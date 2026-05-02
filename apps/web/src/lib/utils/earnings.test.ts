import { describe, it, expect } from 'vitest'
import {
  calculateCreatorEarnings,
  calculatePlatformFee,
  calculateCPMCost,
  calculateEarningsFromViews,
  formatEarnings,
} from './earnings'

describe('calculateCreatorEarnings', () => {
  it('gives creator 70% of brand spend', () => {
    expect(calculateCreatorEarnings(10000)).toBe(7000)
    expect(calculateCreatorEarnings(30000)).toBe(21000)
    expect(calculateCreatorEarnings(1500)).toBe(1050)
  })

  it('handles decimal CPM correctly', () => {
    const brandSpend = (48200 / 1000) * 600
    expect(calculateCreatorEarnings(brandSpend)).toBe(20244)
  })

  it('never returns more than brand paid', () => {
    const brandSpend = 5000
    expect(calculateCreatorEarnings(brandSpend)).toBeLessThan(brandSpend)
  })

  it('returns 0 for 0 spend', () => {
    expect(calculateCreatorEarnings(0)).toBe(0)
  })
})

describe('calculatePlatformFee', () => {
  it('gives platform 30% of brand spend', () => {
    expect(calculatePlatformFee(10000)).toBe(3000)
    expect(calculatePlatformFee(1000)).toBe(300)
  })

  it('creator + platform = total spend', () => {
    const spend = 7777
    expect(calculateCreatorEarnings(spend) + calculatePlatformFee(spend)).toBe(spend)
  })
})

describe('calculateCPMCost', () => {
  it('calculates total cost from views and CPM', () => {
    expect(calculateCPMCost(50000, 600)).toBe(30000)
    expect(calculateCPMCost(1000, 400)).toBe(400)
    expect(calculateCPMCost(100000, 300)).toBe(30000)
  })

  it('handles fractional results by rounding', () => {
    expect(calculateCPMCost(999, 600)).toBe(599)
  })
})

describe('calculateEarningsFromViews', () => {
  it('calculates creator earnings end-to-end from views', () => {
    // 50K views × ₹600 CPM = ₹30,000 brand spend → ₹21,000 creator
    expect(calculateEarningsFromViews(50000, 600)).toBe(21000)
  })
})

describe('formatEarnings', () => {
  it('formats amounts over 1 lakh', () => {
    expect(formatEarnings(150000)).toBe('₹1.5L')
  })

  it('formats amounts over 1000 as K', () => {
    expect(formatEarnings(12400)).toBe('₹12.4K')
  })

  it('formats small amounts directly', () => {
    expect(formatEarnings(750)).toBe('₹750')
  })
})
