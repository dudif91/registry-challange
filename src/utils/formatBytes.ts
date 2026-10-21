const UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

/** 0 -> "0 B", 1536 -> "1.5 KB", 256765859289 -> "239.1 GB" (1024-based). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1)
  const value = bytes / 1024 ** i
  return `${i === 0 || value >= 100 ? Math.round(value) : value.toFixed(1)} ${UNITS[i]}`
}
