const CODE_LENGTH = 12
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateTrackingCode(): string {
  let code = ''
  const array = new Uint8Array(CODE_LENGTH)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
    for (const byte of array) {
      code += CHARSET[byte % CHARSET.length]
    }
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARSET[Math.floor(Math.random() * CHARSET.length)]
    }
  }
  return code
}

export function isValidTrackingCode(code: string): boolean {
  if (!code || code.length !== CODE_LENGTH) return false
  return /^[a-zA-Z0-9]+$/.test(code)
}

export function buildTrackingUrl(baseUrl: string, code: string): string {
  return `${baseUrl}/api/track/${code}`
}
