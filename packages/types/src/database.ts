export type UserRole = 'creator' | 'brand' | 'admin'

export type CampaignStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected'

export type AssignmentStatus = 'available' | 'accepted' | 'uploading' | 'processing' | 'rendering' | 'ready' | 'posted' | 'completed' | 'rejected'

export type SurfaceType = 'wall' | 'object' | 'screen' | 'apparel'

// Contextual placement types for product placement (movie-style insertion)
export type PlacementContext =
  | 'table_surface'     // Desk or table — drinks, food, gadgets, books
  | 'shelf_display'     // Shelf or bookshelf — product display, decor
  | 'near_hand'         // Near or in creator's hand — drinks, food, accessories
  | 'counter_surface'   // Kitchen or bathroom counter
  | 'floor_space'       // Floor area — bags, shoes, large items
  | 'background_decor'  // Background decoration — subtle ambient placement
  | 'wearable'          // On clothing or body — apparel, accessories
  | 'screen_display'    // Digital screen content replacement
  | 'wall_display'      // Wall or billboard style

export type ProductType =
  | 'beverage'     // Drinks, bottles, cans
  | 'food'         // Packaged food, snacks
  | 'electronics'  // Phones, laptops, gadgets
  | 'apparel'      // Clothing, shoes, accessories
  | 'beauty'       // Cosmetics, skincare, personal care
  | 'home_decor'   // Home products, decorative items
  | 'books'        // Books, notebooks, stationery
  | 'fitness'      // Sports equipment, supplements, gym gear
  | 'other'        // General product or brand logo

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type TransactionType = 'deposit' | 'campaign_spend' | 'refund'

export type NotificationType = 'campaign_available' | 'video_ready' | 'payout_sent' | 'campaign_approved' | 'campaign_rejected' | 'new_campaign_created'

export interface User {
  id: string
  firebase_uid: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CreatorProfile {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  niche: string[]
  instagram_handle: string | null
  youtube_handle: string | null
  tiktok_handle: string | null
  follower_count: number
  country: string
  state: string | null
  city: string | null
  upi_id: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  total_earned: number
  pending_payout: number
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface BrandProfile {
  id: string
  user_id: string
  brand_name: string
  category: string
  gst_number: string | null
  logo_url: string | null
  website: string | null
  contact_name: string
  contact_phone: string
  wallet_balance: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  brand_id: string
  title: string
  description: string | null
  surface_preference: SurfaceType
  cpm_rate: number
  total_budget: number
  spent_amount: number
  target_niches: string[]
  target_regions: string[]
  min_followers: number
  start_date: string
  end_date: string
  brand_asset_url: string
  brand_asset_type: 'image' | 'video' | 'logo'
  // What the brand's product actually is — drives scene analysis prompts
  product_type?: ProductType
  product_description?: string | null
  status: CampaignStatus
  allowed_categories: string[]
  created_at: string
  updated_at: string
  brand?: BrandProfile
}

export interface CreatorCampaignAssignment {
  id: string
  creator_id: string
  campaign_id: string
  status: AssignmentStatus
  video_url: string | null
  rendered_video_url: string | null
  tracking_code: string | null
  post_url: string | null
  views_verified: number
  earnings_amount: number
  surface_zones: SurfaceZone[] | null
  selected_zone_id: string | null
  render_job_id: string | null
  created_at: string
  updated_at: string
  campaign?: Campaign
  creator?: CreatorProfile
}

export interface SurfaceZone {
  id: string
  type: SurfaceType
  label: string
  // Bounding box in pixels (for display and fallback compositing)
  coordinates: { x: number; y: number; width: number; height: number }
  // 4 corner points [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] for perspective-correct insertion
  corners?: [number, number][]
  // Depth 0–1: 0 = deep background, 1 = close foreground
  depth_estimate?: number
  // Why this location works for product placement
  placement_context?: PlacementContext
  // Human-readable placement description shown to creator
  placement_description?: string
  // Which product types naturally fit here
  compatible_product_types?: ProductType[]
  frame_start: number
  frame_end: number
  confidence: number
}

export interface VideoAnalyticsEvent {
  id: string
  assignment_id: string
  tracking_code: string
  event_type: 'click' | 'view' | 'api_update'
  ip_hash: string | null
  country: string | null
  region: string | null
  city: string | null
  device_type: string | null
  referrer: string | null
  created_at: string
}

export interface WalletTransaction {
  id: string
  brand_id: string
  type: TransactionType
  amount: number
  description: string
  razorpay_payment_id: string | null
  campaign_id: string | null
  created_at: string
}

export interface CreatorPayout {
  id: string
  creator_id: string
  amount: number
  status: PayoutStatus
  razorpay_payout_id: string | null
  upi_id: string | null
  bank_account: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, string> | null
  read: boolean
  created_at: string
}

export interface WaitlistEntry {
  id: string
  email: string
  type: 'creator' | 'brand'
  created_at: string
}
