import { ScanFace } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { hasFaceIdRegistered, verifyFaceId } from './faceId'
import { hasPinSet, verifyPin } from './pin'

interface LockContextValue {
  pinSet: boolean
  /** Call after setPin()/clearPin() so the gate picks up the change. */
  refresh: () => void
  lockNow: () => void
}

const LockContext = createContext<LockContextValue | null>(null)

export function useLock(): LockContextValue {
  const ctx = useContext(LockContext)
  if (!ctx) throw new Error('useLock must be used within AppLock')
  return ctx
}

export function AppLock({ children }: { children: ReactNode }) {
  const [pinSet, setPinSet] = useState(() => hasPinSet())
  const [unlocked, setUnlocked] = useState(() => !hasPinSet())
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState(false)
  const [faceIdAttempting, setFaceIdAttempting] = useState(false)
  const faceIdAttemptedThisLock = useRef(false)

  const showLockScreen = pinSet && !unlocked

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && hasPinSet()) {
        setUnlocked(false)
        faceIdAttemptedThisLock.current = false
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Best-effort automatic prompt: browsers that require a fresh user gesture for
  // navigator.credentials.get() will silently reject this, leaving the "Unlock with Face ID"
  // button as the fallback trigger.
  useEffect(() => {
    if (!showLockScreen || !hasFaceIdRegistered() || faceIdAttemptedThisLock.current) return
    faceIdAttemptedThisLock.current = true
    setFaceIdAttempting(true)
    verifyFaceId().then((ok) => {
      setFaceIdAttempting(false)
      if (ok) setUnlocked(true)
    })
  }, [showLockScreen])

  function refresh() {
    const nowSet = hasPinSet()
    setPinSet(nowSet)
    if (!nowSet) setUnlocked(true)
  }

  function lockNow() {
    if (hasPinSet()) {
      setUnlocked(false)
      faceIdAttemptedThisLock.current = false
    }
  }

  async function handleUnlockSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await verifyPin(pinInput)
    setPinInput('')
    if (ok) {
      setError(false)
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  async function handleUseFaceId() {
    faceIdAttemptedThisLock.current = true
    setFaceIdAttempting(true)
    const ok = await verifyFaceId()
    setFaceIdAttempting(false)
    if (ok) setUnlocked(true)
  }

  const value: LockContextValue = { pinSet, refresh, lockNow }

  if (showLockScreen) {
    return (
      <LockContext.Provider value={value}>
        <div className="lock-screen">
          <h1>Enter PIN</h1>

          {hasFaceIdRegistered() && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleUseFaceId}
                disabled={faceIdAttempting}
              >
                <ScanFace size={18} /> {faceIdAttempting ? 'Waiting for Face ID…' : 'Unlock with Face ID'}
              </button>
              <p className="list-item__subtitle">or enter your PIN</p>
            </>
          )}

          <form className="lock-form" onSubmit={handleUnlockSubmit}>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              className="pin-input"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              maxLength={6}
            />
            {error && <p className="amount-negative">Incorrect PIN</p>}
            <button type="submit" className="btn btn-primary btn-block">
              Unlock
            </button>
          </form>
        </div>
      </LockContext.Provider>
    )
  }

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}
