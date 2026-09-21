const HASH_KEY = 'budget-app:pinHash'
const SALT_KEY = 'budget-app:pinSalt'

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return toHex(hashBuffer)
}

function generateSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

export function hasPinSet(): boolean {
  return Boolean(localStorage.getItem(HASH_KEY))
}

export async function setPin(pin: string): Promise<void> {
  const salt = generateSalt()
  const hash = await sha256Hex(salt + pin)
  localStorage.setItem(SALT_KEY, salt)
  localStorage.setItem(HASH_KEY, hash)
}

export async function verifyPin(pin: string): Promise<boolean> {
  const salt = localStorage.getItem(SALT_KEY)
  const hash = localStorage.getItem(HASH_KEY)
  if (!salt || !hash) return false
  const candidate = await sha256Hex(salt + pin)
  return candidate === hash
}

export function clearPin(): void {
  localStorage.removeItem(HASH_KEY)
  localStorage.removeItem(SALT_KEY)
}
