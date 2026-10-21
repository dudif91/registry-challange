import { formatBytes } from './formatBytes'
import { formatCount } from './formatCount'
import { formatRelativeTime } from './formatRelativeTime'
import { pullCommand } from './pullCommand'

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [-5, '0 B'],
    [512, '512 B'],
    [1536, '1.5 KB'],
    [30_000_000, '28.6 MB'],
    [2_399_475_911, '2.2 GB'],
    [256_765_859_289, '239 GB'],
  ])('%s -> %s', (input, expected) => {
    expect(formatBytes(input)).toBe(expected)
  })
})

describe('formatCount', () => {
  it.each([
    [950, '950'],
    [21411, '21.4K'],
    [2000, '2K'],
    [13_491_966_974, '13.5B'],
  ])('%s -> %s', (input, expected) => {
    expect(formatCount(input)).toBe(expected)
  })
})

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-10-21T12:00:00Z')
  it.each([
    ['2026-10-21T11:59:30Z', '30 seconds ago'],
    ['2026-10-21T09:00:00Z', '3 hours ago'],
    ['2026-10-13T12:00:00Z', '8 days ago'],
    ['2026-07-21T12:00:00Z', '3 months ago'],
    ['2024-10-21T12:00:00Z', '2 years ago'],
  ])('%s -> %s', (iso, expected) => {
    expect(formatRelativeTime(iso, now)).toBe(expected)
  })
  it('returns empty string for invalid input', () => {
    expect(formatRelativeTime('', now)).toBe('')
    expect(formatRelativeTime('nope', now)).toBe('')
  })
})

describe('pullCommand', () => {
  it('omits the namespace for official images', () => {
    expect(pullCommand('library', 'nginx', 'latest')).toBe('docker pull nginx:latest')
  })
  it('keeps the namespace for community images', () => {
    expect(pullCommand('fluent', 'fluent-bit', '5.1.4')).toBe('docker pull fluent/fluent-bit:5.1.4')
  })
  it('omits the tag when none is given', () => {
    expect(pullCommand('library', 'redis')).toBe('docker pull redis')
  })
})
