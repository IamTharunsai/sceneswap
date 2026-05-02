import { createAdminClient } from '@/lib/clients/supabase-server'
import type { VideoAnalyticsEvent } from '@sceneswap/types'

export async function logAnalyticsEvent(
  event: Omit<VideoAnalyticsEvent, 'id' | 'created_at'>
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('video_analytics_events').insert(event)
  if (error) throw new Error(error.message)
}

export async function getAnalyticsForAssignment(
  assignmentId: string,
  days = 30
): Promise<VideoAnalyticsEvent[]> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('video_analytics_events')
    .select('*')
    .eq('assignment_id', assignmentId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDailyViewsForBrand(
  brandId: string,
  days = 30
): Promise<{ date: string; views: number }[]> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase.rpc('get_daily_views_for_brand', {
    p_brand_id: brandId,
    p_since: since,
  })
  if (error) throw new Error(error.message)
  return data ?? []
}
