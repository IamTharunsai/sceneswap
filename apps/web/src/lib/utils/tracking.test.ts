import { describe, it, expect } from 'vitest'
import { generateTrackingCode, isValidTrackingCode, buildTrackingUrl } from './tracking'

describe('generateTrackingCode', () => {
  it('generates a unique code every time', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateTrackingCode()))
    expect(codes.size).toBe(100)
  })

  it('generates codes of consistent length (12)', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateTrackingCode().length).toBe(12)
    }
  })

  it('only contains URL-safe alphanumeric characters', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateTrackingCode()).toMatch(/^[a-zA-Z0-9]+$/)
    }
  })
})

describe('isValidTrackingCode', () => {
  it('rejects empty strings', () => {
    expect(isValidTrackingCode('')).toBe(false)
  })

  it('rejects codes with special chars', () => {
    expect(isValidTrackingCode('abc!@#xyz12!')).toBe(false)
  })

  it('rejects codes of wrong length', () => {
    expect(isValidTrackingCode('abc123')).toBe(false)
    expect(isValidTrackingCode('abc123DEF456XYZ')).toBe(false)
  })

  it('accepts valid 12-char alphanumeric codes', () => {
    expect(isValidTrackingCode('abc123DEF456')).toBe(true)
  })

  it('validates generated codes', () => {
    const code = generateTrackingCode()
    expect(isValidTrackingCode(code)).toBe(true)
  })
})

describe('buildTrackingUrl', () => {
  it('builds a correct tracking URL', () => {
    expect(buildTrackingUrl('https://sceneswap.com', 'abc123DEF456')).toBe(
      'https://sceneswap.com/api/track/abc123DEF456'
    )
  })
})
