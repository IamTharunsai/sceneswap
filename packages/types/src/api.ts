import type { Campaign, CreatorCampaignAssignment, CreatorProfile, SurfaceZone } from './database'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Auth
export interface FirebaseVerifyRequest {
  idToken: string
}

export interface FirebaseVerifyResponse {
  userId: string
  email: string
  role: string
}

// Waitlist
export interface WaitlistRequest {
  email: string
  type: 'creator' | 'brand'
}

// Campaigns
export interface CreateCampaignRequest {
  title: string
  description: string
  surface_preference: string
  cpm_rate: number
  total_budget: number
  target_niches: string[]
  target_regions: string[]
  min_followers: number
  start_date: string
  end_date: string
  brand_asset_url: string
  brand_asset_type: 'image' | 'video' | 'logo'
  allowed_categories: string[]
}

export interface CreateCampaignResponse {
  campaignId: string
  matchedCreators: number
  estimatedReach: number
}

export interface AvailableCampaignsResponse {
  assignments: (CreatorCampaignAssignment & { campaign: Campaign })[]
}

// Upload
export interface PresignedUrlRequest {
  filename: string
  contentType: string
  assignmentId: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
  key: string
}

// AI
export interface DetectSurfacesRequest {
  videoUrl: string
  assignmentId: string
}

export interface DetectSurfacesResponse {
  jobId: string
  estimatedSeconds: number
}

export interface DetectSurfacesStatusResponse {
  status: 'processing' | 'completed' | 'failed'
  progress?: number
  zones?: SurfaceZone[]
  error?: string
}

export interface RenderVideoRequest {
  assignmentId: string
  selectedZoneId: string
  brandAssetUrl: string
}

export interface RenderVideoResponse {
  jobId: string
}

// Analytics
export interface TrackingEvent {
  assignmentId: string
  trackingCode: string
  views: number
  country: string | null
  region: string | null
}

// Creator profile + earnings
export interface CreatorEarningsSummary {
  totalEarned: number
  pendingPayout: number
  thisMonthEarned: number
  videos: {
    assignmentId: string
    campaignTitle: string
    brandName: string
    views: number
    rate: number
    earned: number
    status: string
  }[]
}

// Brand wallet
export interface AddFundsRequest {
  amount: number
}

export interface AddFundsResponse {
  orderId: string
  amount: number
  currency: string
}
