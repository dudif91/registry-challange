/** 21411 -> "21.4K", 13491966974 -> "13.5B", 950 -> "950". */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  const units: [number, string][] = [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ]
  for (const [size, suffix] of units) {
    if (n >= size) return `${(n / size).toFixed(1).replace(/\.0$/, '')}${suffix}`
  }
  return String(n)
}
