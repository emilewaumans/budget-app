/**
 * registerType: 'autoUpdate' lets a new service worker take over in the background, but that
 * alone doesn't refresh the page — without this, an already-open tab (or, worse, an installed
 * iOS home-screen PWA that rarely gets a real reload) keeps running the old JS indefinitely.
 * Reload once the new worker actually takes control so updates show up on next launch.
 */
export function initServiceWorkerAutoReload(): void {
  if (!('serviceWorker' in navigator)) return

  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    window.location.reload()
  })
}
