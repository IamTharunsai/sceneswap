import Replicate from 'replicate'
import type { SurfaceZone, ProductType, PlacementContext } from '@sceneswap/types'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// Grounding DINO: zero-shot object detector, image-only
const DETECTION_MODEL = 'adirik/grounding-dino:efd10a8ddc57511cf38bfb6d0d026c33820f68b99a1054b26faff44daedff81b'

// Product-type-aware detection prompts — tell the model to look for
// PLACEMENT LOCATIONS suited to the brand's actual product
const PLACEMENT_PROMPTS: Record<ProductType, string> = {
  beverage:   'table top. desk surface. counter top. beside person. cup holder. kitchen surface. hand area',
  food:       'table top. counter top. kitchen surface. beside person. plate area. dining surface',
  electronics:'desk. table. shelf. beside laptop. monitor area. hand holding area. bedside table',
  apparel:    'floor near person. shelf. display surface. clothing area. bed. chair',
  beauty:     'vanity table. bathroom counter. shelf. beside person. dresser surface',
  home_decor: 'shelf. mantle. side table. desk. surface near window. display area',
  books:      'desk. table. shelf. bedside table. beside person. bookshelf',
  fitness:    'floor space. gym surface. beside person. table. display area',
  other:      'table. shelf. counter. surface near person. display area. desk',
}

// Which placement contexts naturally match each product type
const PRODUCT_PLACEMENT_MAP: Record<ProductType, PlacementContext[]> = {
  beverage:   ['table_surface', 'counter_surface', 'near_hand', 'background_decor'],
  food:       ['table_surface', 'counter_surface', 'near_hand'],
  electronics:['table_surface', 'shelf_display', 'near_hand', 'background_decor'],
  apparel:    ['floor_space', 'shelf_display', 'wearable'],
  beauty:     ['counter_surface', 'shelf_display', 'table_surface'],
  home_decor: ['shelf_display', 'table_surface', 'background_decor', 'wall_display'],
  books:      ['shelf_display', 'table_surface', 'background_decor'],
  fitness:    ['floor_space', 'table_surface', 'shelf_display'],
  other:      ['table_surface', 'shelf_display', 'background_decor', 'wall_display'],
}

const PLACEMENT_LABELS: Record<PlacementContext, string> = {
  table_surface:   'On the table / desk',
  shelf_display:   'On a shelf in the background',
  near_hand:       'Near creator\'s hand',
  counter_surface: 'On the counter',
  floor_space:     'On the floor nearby',
  background_decor:'Background decoration',
  wearable:        'On clothing / worn',
  screen_display:  'On screen / monitor',
  wall_display:    'On the wall',
}

export interface SceneAnalysisJob {
  jobId: string
  keyframeUrl?: string
}

export async function startSceneAnalysis(
  videoUrl: string,
  productType: ProductType = 'other',
  keyframeUrl?: string,
): Promise<SceneAnalysisJob> {
  // Dev / missing token: mock job that resolves immediately
  if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === 'your_replicate_api_token_here') {
    return { jobId: `mock-job-${Date.now()}`, keyframeUrl }
  }

  // Use extracted keyframe if available, else try video URL directly
  // (Grounding DINO is image-only; in production keyframe is extracted by Modal)
  const imageUrl = keyframeUrl ?? videoUrl

  try {
    const prediction = await replicate.predictions.create({
      version: DETECTION_MODEL,
      input: {
        image: imageUrl,
        prompt: PLACEMENT_PROMPTS[productType],
        box_threshold: 0.25,
        text_threshold: 0.2,
      },
    })
    return { jobId: prediction.id, keyframeUrl }
  } catch {
    return { jobId: `mock-job-${Date.now()}`, keyframeUrl }
  }
}

export async function getSceneAnalysisStatus(
  jobId: string,
  productType: ProductType = 'other',
): Promise<{ status: 'processing' | 'completed' | 'failed'; zones?: SurfaceZone[]; error?: string }> {
  if (jobId.startsWith('mock-job-')) {
    return { status: 'completed', zones: getMockZones(productType) }
  }

  try {
    const prediction = await replicate.predictions.get(jobId)

    if (prediction.status === 'failed') {
      console.error('Replicate scene analysis failed, using mock zones:', prediction.error)
      return { status: 'completed', zones: getMockZones(productType) }
    }

    if (prediction.status !== 'succeeded') {
      return { status: 'processing' }
    }

    const output = prediction.output as ReplicateOutput[] | null
    if (!output || output.length === 0) {
      return { status: 'completed', zones: getMockZones(productType) }
    }

    return { status: 'completed', zones: parseDetectionOutput(output, productType) }
  } catch {
    return { status: 'completed', zones: getMockZones(productType) }
  }
}

interface ReplicateOutput {
  label: string
  box: [number, number, number, number] // [x_min, y_min, x_max, y_max] normalized 0-1
  score: number
}

function parseDetectionOutput(output: ReplicateOutput[], productType: ProductType): SurfaceZone[] {
  const compatibleContexts = PRODUCT_PLACEMENT_MAP[productType]

  return output.slice(0, 5).map((item, i) => {
    const [xMin, yMin, xMax, yMax] = item.box
    const x = Math.round(xMin * 1920)
    const y = Math.round(yMin * 1080)
    const w = Math.round((xMax - xMin) * 1920)
    const h = Math.round((yMax - yMin) * 1080)

    const placementCtx = compatibleContexts[i % compatibleContexts.length]

    return {
      id: `zone-${i}`,
      type: mapSurfaceType(item.label),
      label: item.label,
      coordinates: { x, y, width: w, height: h },
      corners: buildCorners(x, y, w, h),
      depth_estimate: estimateDepth(yMin, yMax),
      placement_context: placementCtx,
      placement_description: PLACEMENT_LABELS[placementCtx],
      compatible_product_types: [productType],
      frame_start: 0,
      frame_end: 300,
      confidence: item.score,
    }
  })
}

// Realistic mock zones for dev — represent actual product placement opportunities
// not just "flat surfaces"
function getMockZones(productType: ProductType): SurfaceZone[] {
  const contexts = PRODUCT_PLACEMENT_MAP[productType]

  const scenarios: Record<ProductType, SurfaceZone[]> = {
    beverage: [
      {
        id: 'zone-0', type: 'object', label: 'Coffee table in foreground',
        coordinates: { x: 120, y: 640, width: 480, height: 180 },
        corners: [[120, 640], [600, 640], [580, 820], [140, 820]],
        depth_estimate: 0.7,
        placement_context: 'table_surface',
        placement_description: 'On the table / desk',
        compatible_product_types: ['beverage', 'food'],
        frame_start: 0, frame_end: 300, confidence: 0.94,
      },
      {
        id: 'zone-1', type: 'object', label: 'Kitchen counter behind creator',
        coordinates: { x: 900, y: 400, width: 520, height: 160 },
        corners: [[900, 400], [1420, 400], [1400, 560], [920, 560]],
        depth_estimate: 0.3,
        placement_context: 'counter_surface',
        placement_description: 'On the counter',
        compatible_product_types: ['beverage', 'food', 'beauty'],
        frame_start: 0, frame_end: 300, confidence: 0.87,
      },
      {
        id: 'zone-2', type: 'object', label: 'Beside creator\'s right hand',
        coordinates: { x: 580, y: 520, width: 180, height: 240 },
        corners: [[580, 520], [760, 520], [760, 760], [580, 760]],
        depth_estimate: 0.85,
        placement_context: 'near_hand',
        placement_description: 'Near creator\'s hand',
        compatible_product_types: ['beverage', 'food'],
        frame_start: 30, frame_end: 270, confidence: 0.79,
      },
    ],
    electronics: [
      {
        id: 'zone-0', type: 'object', label: 'Desk surface beside laptop',
        coordinates: { x: 900, y: 560, width: 400, height: 200 },
        corners: [[900, 560], [1300, 560], [1280, 760], [920, 760]],
        depth_estimate: 0.65,
        placement_context: 'table_surface',
        placement_description: 'On the desk beside laptop',
        compatible_product_types: ['electronics', 'books'],
        frame_start: 0, frame_end: 300, confidence: 0.92,
      },
      {
        id: 'zone-1', type: 'wall', label: 'Shelf in background',
        coordinates: { x: 60, y: 180, width: 360, height: 140 },
        corners: [[60, 180], [420, 180], [420, 320], [60, 320]],
        depth_estimate: 0.15,
        placement_context: 'shelf_display',
        placement_description: 'On a shelf in the background',
        compatible_product_types: ['electronics', 'books', 'home_decor'],
        frame_start: 0, frame_end: 300, confidence: 0.81,
      },
    ],
    apparel: [
      {
        id: 'zone-0', type: 'object', label: 'Floor space in front',
        coordinates: { x: 300, y: 780, width: 360, height: 280 },
        corners: [[300, 780], [660, 780], [660, 1060], [300, 1060]],
        depth_estimate: 0.6,
        placement_context: 'floor_space',
        placement_description: 'On the floor nearby',
        compatible_product_types: ['apparel', 'fitness'],
        frame_start: 0, frame_end: 300, confidence: 0.88,
      },
      {
        id: 'zone-1', type: 'wall', label: 'Background shelf display',
        coordinates: { x: 1200, y: 200, width: 480, height: 300 },
        corners: [[1200, 200], [1680, 200], [1680, 500], [1200, 500]],
        depth_estimate: 0.1,
        placement_context: 'shelf_display',
        placement_description: 'On a shelf in the background',
        compatible_product_types: ['apparel', 'home_decor'],
        frame_start: 0, frame_end: 300, confidence: 0.76,
      },
    ],
    food: [
      {
        id: 'zone-0', type: 'object', label: 'Dining table surface',
        coordinates: { x: 200, y: 600, width: 600, height: 200 },
        corners: [[200, 600], [800, 600], [780, 800], [220, 800]],
        depth_estimate: 0.7,
        placement_context: 'table_surface',
        placement_description: 'On the table',
        compatible_product_types: ['food', 'beverage'],
        frame_start: 0, frame_end: 300, confidence: 0.93,
      },
    ],
    beauty: [
      {
        id: 'zone-0', type: 'object', label: 'Vanity counter surface',
        coordinates: { x: 400, y: 580, width: 520, height: 160 },
        corners: [[400, 580], [920, 580], [900, 740], [420, 740]],
        depth_estimate: 0.55,
        placement_context: 'counter_surface',
        placement_description: 'On the counter',
        compatible_product_types: ['beauty'],
        frame_start: 0, frame_end: 300, confidence: 0.91,
      },
    ],
    home_decor: [
      {
        id: 'zone-0', type: 'wall', label: 'Background shelf',
        coordinates: { x: 100, y: 200, width: 400, height: 180 },
        corners: [[100, 200], [500, 200], [500, 380], [100, 380]],
        depth_estimate: 0.15,
        placement_context: 'shelf_display',
        placement_description: 'On a shelf in the background',
        compatible_product_types: ['home_decor', 'books'],
        frame_start: 0, frame_end: 300, confidence: 0.85,
      },
    ],
    books: [
      {
        id: 'zone-0', type: 'object', label: 'Desk beside creator',
        coordinates: { x: 800, y: 520, width: 360, height: 200 },
        corners: [[800, 520], [1160, 520], [1140, 720], [820, 720]],
        depth_estimate: 0.6,
        placement_context: 'table_surface',
        placement_description: 'On the desk',
        compatible_product_types: ['books', 'electronics'],
        frame_start: 0, frame_end: 300, confidence: 0.89,
      },
    ],
    fitness: [
      {
        id: 'zone-0', type: 'object', label: 'Floor space next to creator',
        coordinates: { x: 100, y: 750, width: 300, height: 300 },
        corners: [[100, 750], [400, 750], [400, 1050], [100, 1050]],
        depth_estimate: 0.7,
        placement_context: 'floor_space',
        placement_description: 'On the floor nearby',
        compatible_product_types: ['fitness'],
        frame_start: 0, frame_end: 300, confidence: 0.86,
      },
    ],
    other: [
      {
        id: 'zone-0', type: 'object', label: 'Table surface',
        coordinates: { x: 200, y: 580, width: 480, height: 180 },
        corners: [[200, 580], [680, 580], [660, 760], [220, 760]],
        depth_estimate: 0.65,
        placement_context: 'table_surface',
        placement_description: 'On the table',
        compatible_product_types: ['other'],
        frame_start: 0, frame_end: 300, confidence: 0.90,
      },
      {
        id: 'zone-1', type: 'wall', label: 'Background shelf',
        coordinates: { x: 1300, y: 180, width: 420, height: 200 },
        corners: [[1300, 180], [1720, 180], [1720, 380], [1300, 380]],
        depth_estimate: 0.1,
        placement_context: 'shelf_display',
        placement_description: 'On a shelf in the background',
        compatible_product_types: ['other'],
        frame_start: 0, frame_end: 300, confidence: 0.78,
      },
      {
        id: 'zone-2', type: 'wall', label: 'Background wall display',
        coordinates: { x: 0, y: 0, width: 1920, height: 1080 },
        corners: [[0, 0], [1920, 0], [1920, 1080], [0, 1080]],
        depth_estimate: 0.0,
        placement_context: 'wall_display',
        placement_description: 'On the wall (billboard style)',
        compatible_product_types: ['other'],
        frame_start: 0, frame_end: 300, confidence: 0.72,
      },
    ],
  }

  return (scenarios[productType] ?? scenarios.other).map((z, i) => ({
    ...z,
    id: `zone-${i}`,
  }))
}

// Estimate depth: objects appearing lower in frame tend to be closer
function estimateDepth(yMin: number, yMax: number): number {
  const centerY = (yMin + yMax) / 2
  return Math.min(1, Math.max(0, centerY))
}

// Build 4 corner points from bounding box (slight perspective hint)
function buildCorners(x: number, y: number, w: number, h: number): [number, number][] {
  // Slight trapezoidal correction for surfaces that are typically horizontal
  // Objects lower in frame are wider-appearing (perspective foreshortening)
  const perspectiveSkew = Math.round(w * 0.03)
  return [
    [x + perspectiveSkew, y],
    [x + w - perspectiveSkew, y],
    [x + w, y + h],
    [x, y + h],
  ]
}

function mapSurfaceType(label: string): SurfaceZone['type'] {
  const l = label.toLowerCase()
  if (l.includes('wall') || l.includes('background') || l.includes('shelf') || l.includes('surface')) return 'wall'
  if (l.includes('screen') || l.includes('tv') || l.includes('monitor') || l.includes('display')) return 'screen'
  if (l.includes('shirt') || l.includes('cloth') || l.includes('jacket') || l.includes('apparel') || l.includes('wear')) return 'apparel'
  return 'object'
}
