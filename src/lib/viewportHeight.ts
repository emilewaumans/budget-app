/**
 * iOS Safari (including installed/standalone PWAs) has a long history of unreliable
 * `100vh`/`100dvh` values — they can settle a bit short of the real screen height,
 * leaving a gap below anything pinned to the bottom (like the tab bar). `window.innerHeight`
 * doesn't have this problem, so we mirror it into a CSS var and let #root use that instead.
 */
export function initViewportHeightFix(): void {
  function setAppHeight() {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
  }

  setAppHeight()
  window.addEventListener('resize', setAppHeight)
  window.addEventListener('orientationchange', setAppHeight)
}
