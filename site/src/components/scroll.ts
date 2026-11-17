import type Lenis from 'lenis'

// The homepage's smooth scroller, so the gallery can pause it while open. Other pages have none.
let current: Lenis | null = null
export const setLenis = (l: Lenis | null) => { current = l }
export const getLenis = () => current
