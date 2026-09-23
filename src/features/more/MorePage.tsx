import { BarChart3, Check, HelpCircle, Landmark, Repeat, Settings, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker'
import { nextPaletteColor, PALETTE_COLORS } from '../../lib/palette'
import { getMoreItemColors, setMoreItemColors } from './moreColors'

const MORE_ITEMS = [
  { id: 'accounts', label: 'Accounts', to: '/accounts', Icon: Landmark },
  { id: 'payees', label: 'Payees', to: '/payees', Icon: Users },
  { id: 'reports', label: 'Reports', to: '/reports', Icon: BarChart3 },
  { id: 'recurring', label: 'Recurring', to: '/recurring', Icon: Repeat },
  { id: 'help', label: 'How this app works', to: '/help', Icon: HelpCircle },
  { id: 'settings', label: 'Settings', to: '/settings', Icon: Settings },
]

export default function MorePage() {
  const [editMode, setEditMode] = useState(false)
  const [colors, setColors] = useState<Record<string, string>>(() => getMoreItemColors())

  function colorFor(id: string, index: number): string {
    return colors[id] ?? nextPaletteColor(index)
  }

  function setColor(id: string, color: string) {
    const next = { ...colors, [id]: color }
    setColors(next)
    setMoreItemColors(next)
  }

  return (
    <div className="page">
      <header className="page-header page-header--large">
        <h1>More</h1>
        <div className="page-header__actions">
          <Link to="/help?topic=more" aria-label="How this page works">
            <HelpCircle size={22} />
          </Link>
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            aria-label={editMode ? 'Done customizing colors' : 'Customize colors'}
          >
            {editMode ? <Check size={22} /> : <Settings size={22} />}
          </button>
        </div>
      </header>
      <div className="page-body">
        {editMode && (
          <p className="list-item__subtitle">Tap a color to change that button's color.</p>
        )}

        <div className="more-grid">
          {MORE_ITEMS.map((item, index) => {
            const color = colorFor(item.id, index)
            const style = { background: `${color}22`, color }

            if (editMode) {
              return (
                <div key={item.id} className="more-card more-card--editing" style={style}>
                  <item.Icon size={24} />
                  <span>{item.label}</span>
                  <ColorSwatchPicker
                    colors={PALETTE_COLORS}
                    value={color}
                    onChange={(c) => setColor(item.id, c)}
                  />
                </div>
              )
            }

            return (
              <Link key={item.id} to={item.to} className="more-card" style={style}>
                <item.Icon size={24} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
