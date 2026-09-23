/**
 * Face ID / Touch ID unlock via WebAuthn's "platform authenticator" — there's no backend, so
 * there's no server to hand a challenge to or verify against. Instead, at setup time we keep the
 * credential's public key ourselves (in localStorage, alongside the PIN), and at unlock time we
 * verify the signature the platform authenticator returns against that stored key with the Web
 * Crypto API. A successful verification is only possible if the same device's secure enclave,
 * having just confirmed the person's face/fingerprint, produced the signature.
 */

const USER_ID_KEY = 'budget-app:webauthnUserId'
const CREDENTIAL_ID_KEY = 'budget-app:webauthnCredentialId'
const PUBLIC_KEY_KEY = 'budget-app:webauthnPublicKey'
const ALG_KEY = 'budget-app:webauthnAlg'

function bufToBase64(buf: ArrayBuffer): string {
  let binary = ''
  for (const byte of new Uint8Array(buf)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export function isFaceIdSupported(): boolean {
  return typeof window !== 'undefined' && 'PublicKeyCredential' in window
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isFaceIdSupported()) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function hasFaceIdRegistered(): boolean {
  return Boolean(localStorage.getItem(CREDENTIAL_ID_KEY))
}

function getOrCreateUserId(): Uint8Array {
  const existing = localStorage.getItem(USER_ID_KEY)
  if (existing) return new Uint8Array(base64ToBuf(existing))
  const id = crypto.getRandomValues(new Uint8Array(16))
  localStorage.setItem(USER_ID_KEY, bufToBase64(id.buffer))
  return id
}

/** Prompts for Face ID/Touch ID and stores the new credential's public key for future unlocks. */
export async function registerFaceId(): Promise<void> {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = getOrCreateUserId()

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: challenge as BufferSource,
      rp: { name: 'Budget', id: location.hostname },
      user: { id: userId as BufferSource, name: 'Budget App', displayName: 'Budget App' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null

  if (!credential) throw new Error('Face ID setup was cancelled')

  const response = credential.response as AuthenticatorAttestationResponse
  const publicKey = response.getPublicKey()
  if (!publicKey) throw new Error('This device could not provide a usable public key')

  localStorage.setItem(CREDENTIAL_ID_KEY, bufToBase64(credential.rawId))
  localStorage.setItem(PUBLIC_KEY_KEY, bufToBase64(publicKey))
  localStorage.setItem(ALG_KEY, String(response.getPublicKeyAlgorithm()))
}

export function clearFaceId(): void {
  localStorage.removeItem(CREDENTIAL_ID_KEY)
  localStorage.removeItem(PUBLIC_KEY_KEY)
  localStorage.removeItem(ALG_KEY)
}

async function importVerifyKey(publicKeySpki: ArrayBuffer, alg: number): Promise<CryptoKey> {
  if (alg === -7) {
    return crypto.subtle.importKey('spki', publicKeySpki, { name: 'ECDSA', namedCurve: 'P-256' }, false, [
      'verify',
    ])
  }
  if (alg === -257) {
    return crypto.subtle.importKey(
      'spki',
      publicKeySpki,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
  }
  throw new Error('Unsupported signature algorithm')
}

/** WebAuthn ECDSA signatures are DER-encoded; Web Crypto wants raw fixed-width r||s. */
function derToRawEcdsaSignature(der: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(der)
  let offset = 2 // skip the outer SEQUENCE tag + length byte

  function readInt(): Uint8Array {
    offset++ // skip the INTEGER tag (0x02)
    const len = bytes[offset]
    offset++
    let value = bytes.slice(offset, offset + len)
    offset += len
    while (value.length > 32 && value[0] === 0) value = value.slice(1)
    if (value.length < 32) {
      const padded = new Uint8Array(32)
      padded.set(value, 32 - value.length)
      value = padded
    }
    return value
  }

  const r = readInt()
  const s = readInt()
  const raw = new Uint8Array(64)
  raw.set(r, 0)
  raw.set(s, 32)
  return raw.buffer
}

/** Prompts for Face ID/Touch ID and cryptographically verifies the result. */
export async function verifyFaceId(): Promise<boolean> {
  const credentialIdB64 = localStorage.getItem(CREDENTIAL_ID_KEY)
  const publicKeyB64 = localStorage.getItem(PUBLIC_KEY_KEY)
  const algRaw = localStorage.getItem(ALG_KEY)
  if (!credentialIdB64 || !publicKeyB64 || !algRaw) return false
  const alg = Number(algRaw)

  let assertion: PublicKeyCredential | null
  try {
    assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)) as BufferSource,
        allowCredentials: [{ id: base64ToBuf(credentialIdB64), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
  } catch {
    return false
  }
  if (!assertion) return false

  const response = assertion.response as AuthenticatorAssertionResponse
  const key = await importVerifyKey(base64ToBuf(publicKeyB64), alg)

  const clientDataHash = await crypto.subtle.digest('SHA-256', response.clientDataJSON)
  const signedData = new Uint8Array(response.authenticatorData.byteLength + clientDataHash.byteLength)
  signedData.set(new Uint8Array(response.authenticatorData), 0)
  signedData.set(new Uint8Array(clientDataHash), response.authenticatorData.byteLength)

  const signature = alg === -7 ? derToRawEcdsaSignature(response.signature) : response.signature
  const verifyAlgorithm = alg === -7 ? { name: 'ECDSA', hash: 'SHA-256' } : { name: 'RSASSA-PKCS1-v1_5' }

  try {
    return await crypto.subtle.verify(verifyAlgorithm, key, signature, signedData.buffer)
  } catch {
    return false
  }
}
