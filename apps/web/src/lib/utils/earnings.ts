const CREATOR_SHARE = 0.7

export function calculateCreatorEarnings(brandSpend: number): number {
  return Math.round(brandSpend * CREATOR_SHARE)
}

export function calculatePlatformFee(brandSpend: number): number {
  return Math.round(brandSpend * (1 - CREATOR_SHARE))
}

export function calculateCPMCost(views: number, cpmRate: number): number {
  return Math.round((views / 1000) * cpmRate)
}

export function calculateEarningsFromViews(views: number, cpmRate: number): number {
  const brandSpend = calculateCPMCost(views, cpmRate)
  return calculateCreatorEarnings(brandSpend)
}

export function formatEarnings(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
  return `$${amount.toLocaleString('en-US')}`
}
