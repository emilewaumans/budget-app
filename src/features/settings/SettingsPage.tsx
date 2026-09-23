import { Download, Lock, LockOpen, Monitor, Moon, ScanFace, Sun, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { downloadExportZip } from '../export/exportData'
import {
  clearFaceId,
  hasFaceIdRegistered,
  isPlatformAuthenticatorAvailable,
  registerFaceId,
} from '../lock/faceId'
import { clearPin, hasPinSet, setPin, verifyPin } from '../lock/pin'
import { useLock } from '../lock/LockContext'
import { getTheme, setTheme, type Theme } from '../../lib/theme'

export default function SettingsPage() {
  const { refresh, lockNow } = useLock()

  const [theme, setThemeState] = useState<Theme>(() => getTheme())
  const [exporting, setExporting] = useState(false)

  const [faceIdAvailable, setFaceIdAvailable] = useState(false)
  const [faceIdEnabled, setFaceIdEnabled] = useState(() => hasFaceIdRegistered())
  const [faceIdBusy, setFaceIdBusy] = useState(false)
  const [faceIdError, setFaceIdError] = useState<string | null>(null)

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setFaceIdAvailable)
  }, [])

  const [pinIsSet, setPinIsSet] = useState(() => hasPinSet())
  const [showChangeForm, setShowChangeForm] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  function resetPinForm() {
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setMessage(null)
  }

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExportZip()
    } finally {
      setExporting(false)
    }
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (pinIsSet && !(await verifyPin(currentPin))) {
      setMessage({ type: 'error', text: 'Current PIN is incorrect' })
      return
    }
    if (newPin.length < 4) {
      setMessage({ type: 'error', text: 'PIN must be at least 4 digits' })
      return
    }
    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'PINs do not match' })
      return
    }

    await setPin(newPin)
    setPinIsSet(true)
    setShowChangeForm(false)
    resetPinForm()
    setMessage({ type: 'success', text: 'PIN saved' })
    refresh()
  }

  async function handleRemovePin() {
    setMessage(null)
    if (!(await verifyPin(currentPin))) {
      setMessage({ type: 'error', text: 'Current PIN is incorrect' })
      return
    }
    clearPin()
    clearFaceId()
    setFaceIdEnabled(false)
    setPinIsSet(false)
    setShowChangeForm(false)
    resetPinForm()
    setMessage({ type: 'success', text: 'PIN removed — app lock is off' })
    refresh()
  }

  function handleThemeChange(next: Theme) {
    setThemeState(next)
    setTheme(next)
  }

  async function handleEnableFaceId() {
    setFaceIdBusy(true)
    setFaceIdError(null)
    try {
      await registerFaceId()
      setFaceIdEnabled(true)
    } catch {
      setFaceIdError('Could not set up Face ID on this device.')
    } finally {
      setFaceIdBusy(false)
    }
  }

  function handleDisableFaceId() {
    clearFaceId()
    setFaceIdEnabled(false)
  }

  return (
    <div className="page">
      <PageHeader title="Settings" back helpTopic="settings" />
      <div className="page-body">
        <section>
          <h3>
            <Sun size={18} /> Appearance
          </h3>
          <div className="segmented">
            <button
              type="button"
              className={theme === 'system' ? 'active' : undefined}
              onClick={() => handleThemeChange('system')}
            >
              <Monitor size={16} /> System
            </button>
            <button
              type="button"
              className={theme === 'light' ? 'active' : undefined}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={16} /> Light
            </button>
            <button
              type="button"
              className={theme === 'dark' ? 'active' : undefined}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </section>

        <section>
          <h3>
            <Lock size={18} /> App lock
          </h3>
          {pinIsSet && !showChangeForm && (
            <div className="button-stack">
              <button
                type="button"
                className="btn btn-block"
                onClick={() => {
                  resetPinForm()
                  setShowChangeForm(true)
                }}
              >
                <Lock size={16} /> Change PIN
              </button>
              {faceIdAvailable &&
                (faceIdEnabled ? (
                  <button type="button" className="btn btn-block" onClick={handleDisableFaceId}>
                    <ScanFace size={16} /> Turn off Face ID
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-block"
                    onClick={handleEnableFaceId}
                    disabled={faceIdBusy}
                  >
                    <ScanFace size={16} /> {faceIdBusy ? 'Setting up…' : 'Set up Face ID'}
                  </button>
                ))}
              <button type="button" className="btn btn-danger btn-block" onClick={handleRemovePin}>
                <Trash2 size={16} /> Remove PIN
              </button>
              <button type="button" className="btn btn-block" onClick={lockNow}>
                <LockOpen size={16} /> Lock now
              </button>
            </div>
          )}

          {faceIdError && <p className="amount-negative">{faceIdError}</p>}

          {(!pinIsSet || showChangeForm) && (
            <form onSubmit={handleSavePin} className="page-body" style={{ padding: 0 }}>
              {pinIsSet && (
                <div className="field">
                  <label htmlFor="currentPin">Current PIN</label>
                  <input
                    id="currentPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                  />
                </div>
              )}
              <div className="field">
                <label htmlFor="newPin">{pinIsSet ? 'New PIN' : 'PIN'}</label>
                <input
                  id="newPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="confirmPin">Confirm PIN</label>
                <input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                />
              </div>

              {message && (
                <p className={message.type === 'error' ? 'amount-negative' : 'list-item__subtitle'}>
                  {message.text}
                </p>
              )}

              <div className="button-stack">
                <button type="submit" className="btn btn-primary btn-block">
                  {pinIsSet ? 'Save new PIN' : 'Set PIN'}
                </button>
                {pinIsSet && (
                  <button
                    type="button"
                    className="btn btn-block"
                    onClick={() => {
                      setShowChangeForm(false)
                      resetPinForm()
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        <section>
          <h3>
            <Download size={18} /> Data
          </h3>
          <button type="button" className="btn btn-block" onClick={handleExport} disabled={exporting}>
            <Download size={16} /> {exporting ? 'Preparing export…' : 'Export all data (CSV)'}
          </button>
          <p className="list-item__subtitle">
            Downloads a .zip with your accounts, transactions, savings goals, recurring items, and
            payees as CSV files — your data is never locked into this app.
          </p>
        </section>
      </div>
    </div>
  )
}
