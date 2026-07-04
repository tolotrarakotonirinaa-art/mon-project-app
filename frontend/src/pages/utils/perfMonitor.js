// ════════════════════════════════════════════════════════
//  perfMonitor.js
//  Mpitantana metrika TENA MARINA (tsy Math.random() intsony) :
//   - Core Web Vitals avy amin'ny PerformanceObserver API
//   - Fotoana valin-teny API tena niantsoina (alefan'i services/api.js)
// ════════════════════════════════════════════════════════

const listeners = new Set()

const vitals = {
  lcp: null,   // Largest Contentful Paint (ms)
  fid: null,   // First Input Delay (ms) — mila interaction voalohany
  cls: 0,      // Cumulative Layout Shift (score, tsy ms)
  ttfb: null,  // Time To First Byte (ms)
  fcp: null,   // First Contentful Paint (ms)
  tti: null,   // Time To Interactive — approximation (domInteractive)
}

function notify() {
  listeners.forEach(fn => fn({ ...vitals }))
}

/**
 * Misoratra ho mpamaky vitals. Miverina amin'ny fonction "unsubscribe".
 */
export function subscribeVitals(fn) {
  listeners.add(fn)
  fn({ ...vitals })
  return () => listeners.delete(fn)
}

function safeObserve(type, cb) {
  try {
    const obs = new PerformanceObserver(cb)
    obs.observe({ type, buffered: true })
    return obs
  } catch {
    return null // type tsy raisin'ity navigateur ity
  }
}

let initialized = false

/**
 * Atombohy ny fanaraha-maso (appeler ao amin'ny useEffect, indray mandeha ihany
 * no tena ilaina satria singleton — azo antsoina imbetsaka tsy misy fahasamihafana).
 */
export function initWebVitals() {
  if (initialized || typeof window === 'undefined' || !('PerformanceObserver' in window)) return
  initialized = true

  // Navigation Timing → TTFB sy TTI (approx.)
  try {
    const [nav] = performance.getEntriesByType('navigation')
    if (nav) {
      vitals.ttfb = Math.round(nav.responseStart - nav.requestStart)
      vitals.tti  = Math.round(nav.domInteractive)
    }
  } catch { /* tsy raisin'ity navigateur ity */ }

  // Paint Timing → FCP
  safeObserve('paint', (list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        vitals.fcp = Math.round(entry.startTime)
      }
    }
    notify()
  })

  // Largest Contentful Paint
  safeObserve('largest-contentful-paint', (list) => {
    const entries = list.getEntries()
    const last = entries[entries.length - 1]
    if (last) vitals.lcp = Math.round(last.renderTime || last.loadTime || last.startTime)
    notify()
  })

  // Cumulative Layout Shift (tsy isaina raha avy amin'ny interaction)
  safeObserve('layout-shift', (list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        vitals.cls = parseFloat((vitals.cls + entry.value).toFixed(4))
      }
    }
    notify()
  })

  // First Input Delay — mila interaction (clic/touche) voalohany
  safeObserve('first-input', (list) => {
    const [entry] = list.getEntries()
    if (entry) vitals.fid = Math.round(entry.processingStart - entry.startTime)
    notify()
  })

  notify()
}

/**
 * Mamerina ny fampiasana mémoire JS tena izy.
 * MARIHINA: performance.memory dia Chrome/Edge ihany no manana azy (non-standard API).
 * Mamerina null raha tsy raisin'ity navigateur ity (tsara kokoa noho ny famitahana
 * amin'ny valeur faux).
 */
export function getMemoryInfo() {
  const m = performance.memory
  if (!m) return null
  const MB = 1024 * 1024
  return {
    used:  m.usedJSHeapSize  / MB,
    total: m.jsHeapSizeLimit / MB,
    heap:  m.totalJSHeapSize / MB,
  }
}

// ── Fanaraha-maso ny fotoana valin-teny API (alefan'i services/api.js) ──
const apiLog = new Map() // endpoint(sans query) -> [durations ms]
const MAX_SAMPLES_PER_ENDPOINT = 100

export function recordApiCall(endpoint, durationMs) {
  const key = String(endpoint).split('?')[0]
  if (!apiLog.has(key)) apiLog.set(key, [])
  const arr = apiLog.get(key)
  arr.push(Math.round(durationMs))
  if (arr.length > MAX_SAMPLES_PER_ENDPOINT) arr.shift()
}

export function getApiStats() {
  return Array.from(apiLog.entries())
    .map(([endpoint, durations]) => ({
      endpoint,
      calls: durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    }))
    .sort((a, b) => b.calls - a.calls)
}

export function resetApiStats() {
  apiLog.clear()
}