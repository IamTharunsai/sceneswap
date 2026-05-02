import { createAdminClient } from '@/lib/clients/supabase-server'
import type { CreatorCampaignAssignment } from '@sceneswap/types'

export async function getAssignmentsByCreator(
  creatorId: string,
  status?: CreatorCampaignAssignment['status']
): Promise<CreatorCampaignAssignment[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('creator_campaign_assignments')
    .select('*, campaign:campaigns(*, brand:brand_profiles(*))')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAssignmentById(id: string): Promise<CreatorCampaignAssignment | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creator_campaign_assignments')
    .select('*, campaign:campaigns(*, brand:brand_profiles(*)), creator:creator_profiles(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getAssignmentByTrackingCode(
  trackingCode: string
): Promise<CreatorCampaignAssignment | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creator_campaign_assignments')
    .select('*, campaign:campaigns(*)')
    .eq('tracking_code', trackingCode)
    .single()
  if (error) return null
  return data
}

export async function createAssignments(
  assignments: { creator_id: string; campaign_id: string }[]
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('creator_campaign_assignments')
    .insert(assignments.map(a => ({ ...a, status: 'available' })))
  if (error) throw new Error(error.message)
}

export async function updateAssignment(
  id: string,
  data: Partial<CreatorCampaignAssignment>
): Promise<CreatorCampaignAssignment | null> {
  const supabase = createAdminClient()
  const { data: updated, error } = await supabase
    .from('creator_campaign_assignments')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return updated
}

export async function incrementAssignmentViews(
  trackingCode: string,
  viewCount = 1
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.rpc('increment_assignment_views', {
    p_tracking_code: trackingCode,
    p_count: viewCount,
  })
}

export async function getAssignmentsByCampaign(
  campaignId: string
): Promise<CreatorCampaignAssignment[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creator_campaign_assignments')
    .select('*, creator:creator_profiles(*)')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}
