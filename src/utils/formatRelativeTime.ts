const STEPS: [number, Intl.RelativeTimeFormatUnit][] = [
  [60, 'second'],
  [60, 'minute'],
  [24, 'hour'],
  [30, 'day'],
  [12, 'month'],
  [Number.POSITIVE_INFINITY, 'year'],
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "2026-10-13T23:40:54Z" -> "8 days ago". Returns "" for missing/invalid input. */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return ''
  let delta = Math.round((then - now) / 1000)
  for (const [size, unit] of STEPS) {
    if (Math.abs(delta) < size) return rtf.format(delta, unit)
    delta = Math.round(delta / size)
  }
  return ''
}
