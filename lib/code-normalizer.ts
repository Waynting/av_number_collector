/**
 * Normalizes video codes to a standard format
 * Examples:
 *  - "ssis123" -> "SSIS-123"
 *  - " waaa-412 " -> "WAAA-412"
 *  - "IPX920" -> "IPX-920"
 *  - "fc2ppv1234567" -> "FC2-PPV-1234567"
 *  - "1234567" -> "FC2-PPV-1234567"
 */
export function normalizeVideoCode(code: string): string {
  // Remove leading/trailing whitespace
  let normalized = code.trim()

  // Convert to uppercase
  normalized = normalized.toUpperCase()

  // Remove any existing hyphens for processing
  const noHyphens = normalized.replace(/-/g, '')

  // Check if it's an FC2 format
  // Pattern 1: FC2PPV followed by numbers (fc2ppv1234567)
  const fc2WithPrefix = noHyphens.match(/^FC2PPV(\d+)$/)
  if (fc2WithPrefix) {
    return `FC2-PPV-${fc2WithPrefix[1]}`
  }

  // Pattern 2: Pure numbers with 6-8 digits (assume it's FC2)
  const pureNumber = noHyphens.match(/^(\d{6,8})$/)
  if (pureNumber) {
    return `FC2-PPV-${pureNumber[1]}`
  }

  // Try to match standard pattern: letters followed by numbers
  const standardMatch = noHyphens.match(/^([A-Z]+)(\d+)$/)
  if (standardMatch) {
    // Add hyphen between letters and numbers
    return `${standardMatch[1]}-${standardMatch[2]}`
  }

  // If no pattern matches, return as is (still uppercase and trimmed)
  return normalized
}

/**
 * Validates if a video code looks reasonable
 */
export function isValidVideoCode(code: string): boolean {
  if (!code || code.trim().length === 0) {
    return false
  }

  const trimmed = code.trim().toUpperCase()
  const noHyphens = trimmed.replace(/-/g, '')

  // Check for FC2 formats
  // Pattern 1: FC2PPV followed by numbers
  if (/^FC2PPV\d+$/.test(noHyphens)) {
    return true
  }

  // Pattern 2: Pure numbers with 6-8 digits (FC2 format)
  if (/^\d{6,8}$/.test(noHyphens)) {
    return true
  }

  // Standard format: should have at least 3 characters
  if (trimmed.length < 3) {
    return false
  }

  // Standard format: should contain at least one letter and one number
  const hasLetter = /[A-Z]/.test(trimmed)
  const hasNumber = /\d/.test(trimmed)

  return hasLetter && hasNumber
}
