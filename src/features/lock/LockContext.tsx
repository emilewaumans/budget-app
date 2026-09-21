import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && hasPinSet()) {
        setUnlocked(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  function refresh() {
    const nowSet = hasPinSet()
    setPinSet(nowSet)
    if (!nowSet) setUnlocked(true)
  }

  function lockNow() {
    if (hasPinSet()) setUnlocked(false)
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

  const value: LockContextValue = { pinSet, refresh, lockNow }

  if (pinSet && !unlocked) {
    return (
      <LockContext.Provider value={value}>
        <div className="lock-screen">
          <h1>Enter PIN</h1>
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
