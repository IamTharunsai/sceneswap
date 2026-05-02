import { createAdminClient } from '@/lib/clients/supabase-server'
import type { BrandProfile } from '@sceneswap/types'

export async function getBrandByUserId(userId: string): Promise<BrandProfile | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function getBrandById(id: string): Promise<BrandProfile | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createBrand(
  data: Omit<BrandProfile, 'id' | 'created_at' | 'updated_at' | 'wallet_balance' | 'total_spent'>
): Promise<BrandProfile | null> {
  const supabase = createAdminClient()
  const { data: created, error } = await supabase
    .from('brand_profiles')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return created
}

export async function updateBrandWallet(id: string, newBalance: number): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('brand_profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deductFromWallet(brandId: string, amount: number): Promise<void> {
  const supabase = createAdminClient()
  const { data: brand } = await supabase
    .from('brand_profiles')
    .select('wallet_balance')
    .eq('id', brandId)
    .single()
  if (!brand) throw new Error('Brand not found')
  if (brand.wallet_balance < amount) throw new Error('Insufficient wallet balance')
  await supabase
    .from('brand_profiles')
    .update({
      wallet_balance: brand.wallet_balance - amount,
      total_spent: supabase.rpc('increment_total_spent', { brand_id: brandId, amount }),
    })
    .eq('id', brandId)
}
