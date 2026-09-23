export type Theme = 'system' | 'light' | 'dark'

const KEY = 'budget-app:theme'

export function getTheme(): Theme {
  const raw = localStorage.getItem(KEY)
  return raw === 'light' || raw === 'dark' ? raw : 'system'
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme): void {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = theme
  }
}

/** Applies the saved theme before React mounts, so there's no flash of the wrong appearance. */
export function initTheme(): void {
  applyTheme(getTheme())
}
