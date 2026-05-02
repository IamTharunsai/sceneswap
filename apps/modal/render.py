"""
SceneSwap — Video Product Placement Renderer
Runs on Modal.com GPU instances. Called by the Next.js render-video API route.

Pipeline:
  1. Download source video from R2
  2. Download brand product image (RGBA PNG for best results)
  3. For each video frame in the target range:
     a. Perspective-warp the product image to fit the target zone
     b. Alpha-composite onto the frame (handles transparency)
  4. Re-encode all frames back to video with original audio
  5. Upload rendered video to R2
  6. POST webhook to notify Next.js that rendering is done
"""

import io
import os
import json
import hashlib
import hmac
import tempfile
import subprocess
import traceback
from pathlib import Path

import modal

app = modal.App("sceneswap-render")

render_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libgl1", "libglib2.0-0")
    .pip_install(
        "opencv-python-headless==4.9.0.80",
        "Pillow==10.3.0",
        "numpy==1.26.4",
        "boto3==1.34.74",
        "requests==2.31.0",
    )
)


@app.function(
    image=render_image,
    timeout=900,   # 15 minutes max
    memory=8192,   # 8 GB RAM
    cpu=4,
)
def render_product_placement(
    video_url: str,
    product_url: str,
    zone: dict,
    assignment_id: str,
    tracking_code: str,
    webhook_url: str,
) -> dict:
    """
    Insert brand product image into video at the specified zone.
    zone: {
      id, type, label,
      coordinates: {x, y, width, height},
      corners?: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
      frame_start: int,
      frame_end: int,
      depth_estimate?: float,
    }
    """
    import cv2
    import numpy as np
    import boto3
    import requests
    from PIL import Image
    from botocore.config import Config

    try:
        # ── 1. Download source video ──────────────────────────────────────
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            src_path = tmp.name
            resp = requests.get(video_url, stream=True, timeout=120)
            resp.raise_for_status()
            for chunk in resp.iter_content(chunk_size=65536):
                tmp.write(chunk)

        # ── 2. Download product image ─────────────────────────────────────
        prod_resp = requests.get(product_url, timeout=30)
        prod_resp.raise_for_status()
        product_pil = Image.open(io.BytesIO(prod_resp.content)).convert("RGBA")
        prod_w, prod_h = product_pil.size
        # Keep product image as BGRA numpy array
        product_np = np.array(product_pil)
        product_bgra = cv2.cvtColor(product_np, cv2.COLOR_RGBA2BGRA)

        # ── 3. Open video ─────────────────────────────────────────────────
        cap = cv2.VideoCapture(src_path)
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open video: {video_url}")

        fps        = cap.get(cv2.CAP_PROP_FPS) or 30.0
        vid_w      = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        vid_h      = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        frame_start = zone.get("frame_start", 0)
        frame_end   = zone.get("frame_end", total_frames)

        # ── 4. Compute perspective transform matrix ───────────────────────
        coords  = zone["coordinates"]
        x, y    = coords["x"], coords["y"]
        w, h    = coords["width"], coords["height"]

        if zone.get("corners"):
            # Use provided 4-corner points for proper perspective
            dst_pts = np.array(zone["corners"], dtype=np.float32)
        else:
            # Fall back to axis-aligned bounding box
            dst_pts = np.array([
                [x,     y    ],
                [x + w, y    ],
                [x + w, y + h],
                [x,     y + h],
            ], dtype=np.float32)

        # Scale dst_pts to actual video resolution
        dst_pts[:, 0] *= (vid_w / 1920.0)
        dst_pts[:, 1] *= (vid_h / 1080.0)

        # Product image corner points (source quad)
        src_pts = np.array([
            [0,      0     ],
            [prod_w, 0     ],
            [prod_w, prod_h],
            [0,      prod_h],
        ], dtype=np.float32)

        M = cv2.getPerspectiveTransform(src_pts, dst_pts)

        # Pre-warp product (same warp for every frame — fast)
        warped_bgra = cv2.warpPerspective(product_bgra, M, (vid_w, vid_h))
        alpha_chan   = warped_bgra[:, :, 3:4].astype(np.float32) / 255.0
        warped_bgr   = warped_bgra[:, :, :3].astype(np.float32)

        # ── 5. Write frames to temp raw video (no audio) ──────────────────
        raw_out = src_path.replace(".mp4", "_raw.mp4")
        fourcc  = cv2.VideoWriter_fourcc(*"mp4v")
        writer  = cv2.VideoWriter(raw_out, fourcc, fps, (vid_w, vid_h))

        frame_idx = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            if frame_start <= frame_idx <= frame_end:
                frame_f = frame.astype(np.float32)
                composited = (warped_bgr * alpha_chan + frame_f * (1.0 - alpha_chan))
                frame = composited.clip(0, 255).astype(np.uint8)

            writer.write(frame)
            frame_idx += 1

        cap.release()
        writer.release()

        # ── 6. Re-mux with original audio via FFmpeg ──────────────────────
        final_out = src_path.replace(".mp4", "_final.mp4")
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-i", raw_out,       # video track (rendered)
            "-i", src_path,      # original (for audio)
            "-c:v", "libx264",   # re-encode video with H.264
            "-preset", "fast",
            "-crf", "22",
            "-c:a", "copy",      # copy audio as-is
            "-map", "0:v:0",     # video from rendered
            "-map", "1:a:0?",    # audio from original (optional)
            "-movflags", "+faststart",
            final_out,
        ]
        result = subprocess.run(ffmpeg_cmd, capture_output=True, timeout=600)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg error: {result.stderr.decode()}")

        # ── 7. Upload rendered video to R2 ────────────────────────────────
        s3 = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
        rendered_key = f"rendered/{assignment_id}/output.mp4"
        s3.upload_file(
            final_out,
            os.environ["R2_BUCKET"],
            rendered_key,
            ExtraArgs={"ContentType": "video/mp4"},
        )
        rendered_url = f"{os.environ['R2_PUBLIC_URL']}/{rendered_key}"

        # ── 8. Notify Next.js webhook ──────────────────────────────────────
        payload = {
            "assignment_id": assignment_id,
            "rendered_url": rendered_url,
            "tracking_code": tracking_code,
            "status": "completed",
            "frames_processed": frame_idx,
        }
        _post_webhook(webhook_url, payload)

        return payload

    except Exception as exc:
        tb = traceback.format_exc()
        error_payload = {
            "assignment_id": assignment_id,
            "status": "failed",
            "error": str(exc),
            "traceback": tb,
        }
        try:
            _post_webhook(webhook_url, error_payload)
        except Exception:
            pass
        raise


def _post_webhook(url: str, payload: dict) -> None:
    """POST webhook with HMAC-SHA256 signature."""
    import requests

    secret = os.environ.get("MODAL_WEBHOOK_SECRET", "")
    body   = json.dumps(payload)
    sig    = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()

    requests.post(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Modal-Signature": sig,
        },
        timeout=30,
    )


# ── Local test entry point ────────────────────────────────────────────────────
@app.local_entrypoint()
def main(
    video_url: str = "",
    product_url: str = "",
    assignment_id: str = "test-001",
):
    if not video_url or not product_url:
        print("Usage: modal run render.py --video-url <url> --product-url <url>")
        return

    result = render_product_placement.remote(
        video_url=video_url,
        product_url=product_url,
        zone={
            "coordinates": {"x": 200, "y": 580, "width": 400, "height": 160},
            "frame_start": 0,
            "frame_end": 9999,
        },
        assignment_id=assignment_id,
        tracking_code="TEST-0001",
        webhook_url="https://sceneswap.app/api/webhooks/modal",
    )
    print("Render complete:", result)
