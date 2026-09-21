import { useState } from 'react'
import { downloadExportZip } from '../export/exportData'

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExportZip()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>
      <div className="page-body">
        <div className="field">
          <button type="button" className="btn btn-block" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Preparing export…' : 'Export all data (CSV)'}
          </button>
          <p className="list-item__subtitle">
            Downloads a .zip with your accounts, categories, transactions, splits, budget history,
            and goals as CSV files — your data is never locked into this app.
          </p>
        </div>
      </div>
    </div>
  )
}
