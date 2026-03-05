/**
 * Normalizes video codes to a standard format
 * Examples:
 *  - "ssis123" -> "SSIS-123"
 *  - " waaa-412 " -> "WAAA-412"
 *  - "IPX920" -> "IPX-920"
 */
export function normalizeVideoCode(code: string): string {
  // Remove leading/trailing whitespace
  let normalized = code.trim()

  // Convert to uppercase
  normalized = normalized.toUpperCase()

  // Remove any existing hyphens
  normalized = normalized.replace(/-/g, '')

  // Try to match pattern: letters followed by numbers
  const match = normalized.match(/^([A-Z]+)(\d+)$/)

  if (match) {
    // Add hyphen between letters and numbers
    return `${match[1]}-${match[2]}`
  }

  // If pattern doesn't match, return as is (still uppercase and trimmed)
  return normalized
}

/**
 * Validates if a video code looks reasonable
 */
export function isValidVideoCode(code: string): boolean {
  if (!code || code.trim().length === 0) {
    return false
  }

  const normalized = normalizeVideoCode(code)

  // Should have at least 3 characters
  if (normalized.length < 3) {
    return false
  }

  // Should contain at least one letter and one number
  const hasLetter = /[A-Z]/.test(normalized)
  const hasNumber = /\d/.test(normalized)

  return hasLetter && hasNumber
}
