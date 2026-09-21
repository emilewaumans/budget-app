import { useState } from 'react'
import { downloadExportZip } from '../export/exportData'
import { clearPin, hasPinSet, setPin, verifyPin } from '../lock/pin'
import { useLock } from '../lock/LockContext'

export default function SettingsPage() {
  const { refresh, lockNow } = useLock()

  const [exporting, setExporting] = useState(false)

  const [pinIsSet, setPinIsSet] = useState(() => hasPinSet())
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

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
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
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
    setPinIsSet(false)
    setCurrentPin('')
    setMessage({ type: 'success', text: 'PIN removed — app lock is off' })
    refresh()
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>
      <div className="page-body">
        <section>
          <h3>App lock</h3>
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

            <button type="submit" className="btn btn-primary btn-block">
              {pinIsSet ? 'Change PIN' : 'Set PIN'}
            </button>
          </form>

          {pinIsSet && (
            <>
              <button type="button" className="btn btn-danger btn-block" onClick={handleRemovePin}>
                Remove PIN
              </button>
              <button type="button" className="btn btn-block" onClick={lockNow}>
                Lock now
              </button>
            </>
          )}
        </section>

        <section>
          <h3>Data</h3>
          <button type="button" className="btn btn-block" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Preparing export…' : 'Export all data (CSV)'}
          </button>
          <p className="list-item__subtitle">
            Downloads a .zip with your accounts, categories, transactions, splits, budget history,
            and goals as CSV files — your data is never locked into this app.
          </p>
        </section>
      </div>
    </div>
  )
}
