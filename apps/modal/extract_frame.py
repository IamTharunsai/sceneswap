"""
SceneSwap — Video Keyframe Extractor
Runs on Modal.com. Called before scene analysis to give Grounding DINO a still image.

Takes a video URL, extracts the most representative frame (1 second in),
uploads it to R2, and returns the public frame URL.
"""

import os
import hashlib
import tempfile
import subprocess

import modal

app = modal.App("sceneswap-extract-frame")

extract_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install("boto3==1.34.74", "requests==2.31.0")
)


@app.function(
    image=extract_image,
    timeout=120,
    memory=1024,
)
def extract_keyframe(video_url: str, assignment_id: str) -> str:
    """
    Extract a single frame from the video at t=1s (avoids black intro frames).
    Returns the public R2 URL of the extracted JPEG.
    """
    import boto3
    import requests
    from botocore.config import Config

    # Download video
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        src_path = tmp.name
        resp = requests.get(video_url, stream=True, timeout=120)
        resp.raise_for_status()
        for chunk in resp.iter_content(chunk_size=65536):
            tmp.write(chunk)

    frame_path = src_path.replace(".mp4", "_frame.jpg")

    # Use FFmpeg to extract frame at 1 second
    # -ss 1: seek to 1 second
    # -frames:v 1: extract exactly one frame
    # -q:v 2: JPEG quality (1=best, 31=worst; 2 is excellent)
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-ss", "1",
        "-i", src_path,
        "-frames:v", "1",
        "-q:v", "2",
        frame_path,
    ]
    result = subprocess.run(ffmpeg_cmd, capture_output=True, timeout=60)
    if result.returncode != 0:
        # Try frame at 0 seconds if video is shorter than 1s
        ffmpeg_cmd[3] = "0"
        result = subprocess.run(ffmpeg_cmd, capture_output=True, timeout=60)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg keyframe extraction failed: {result.stderr.decode()}")

    # Upload keyframe to R2
    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    frame_key = f"keyframes/{assignment_id}/frame.jpg"
    s3.upload_file(
        frame_path,
        os.environ["R2_BUCKET"],
        frame_key,
        ExtraArgs={"ContentType": "image/jpeg"},
    )
    frame_url = f"{os.environ['R2_PUBLIC_URL']}/{frame_key}"
    return frame_url


@app.local_entrypoint()
def main(video_url: str = "", assignment_id: str = "test-001"):
    if not video_url:
        print("Usage: modal run extract_frame.py --video-url <url>")
        return
    url = extract_keyframe.remote(video_url=video_url, assignment_id=assignment_id)
    print("Keyframe URL:", url)
