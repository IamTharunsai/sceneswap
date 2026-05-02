import { createAdminClient } from '@/lib/clients/supabase-server'
import type { Campaign } from '@sceneswap/types'

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, brand:brand_profiles(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getCampaignsByBrand(brandId: string): Promise<Campaign[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, brand:brand_profiles(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCampaign(
  data: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'spent_amount' | 'brand'>
): Promise<Campaign> {
  const supabase = createAdminClient()
  const { data: created, error } = await supabase
    .from('campaigns')
    .insert({ ...data, status: 'pending_approval' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return created
}

export async function updateCampaignStatus(
  id: string,
  status: Campaign['status']
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getPendingApprovalCampaigns(): Promise<Campaign[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, brand:brand_profiles(*)')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}
