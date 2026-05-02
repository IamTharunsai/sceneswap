import { createAdminClient } from '@/lib/clients/supabase-server'
import type { CreatorProfile } from '@sceneswap/types'

export async function getCreatorByUserId(userId: string): Promise<CreatorProfile | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function getCreatorById(id: string): Promise<CreatorProfile | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createCreator(
  data: Omit<CreatorProfile, 'id' | 'created_at' | 'updated_at' | 'total_earned' | 'pending_payout'>
): Promise<CreatorProfile | null> {
  const supabase = createAdminClient()
  const { data: created, error } = await supabase
    .from('creator_profiles')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return created
}

export async function updateCreator(
  id: string,
  data: Partial<CreatorProfile>
): Promise<CreatorProfile | null> {
  const supabase = createAdminClient()
  const { data: updated, error } = await supabase
    .from('creator_profiles')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return updated
}

export async function getMatchingCreators(criteria: {
  niches: string[]
  regions: string[]
  minFollowers: number
  limit?: number
}): Promise<CreatorProfile[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('creator_profiles')
    .select('*')
    .gte('follower_count', criteria.minFollowers)

  if (criteria.niches.length > 0) {
    query = query.overlaps('niche', criteria.niches)
  }

  const { data, error } = await query.limit(criteria.limit ?? 50)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function incrementCreatorEarnings(
  id: string,
  amount: number
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.rpc('increment_creator_earnings', { creator_id: id, amount })
}
