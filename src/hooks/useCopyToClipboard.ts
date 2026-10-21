import { useCallback, useEffect, useRef, useState } from 'react'

async function writeText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API unavailable (e.g. insecure context): fall back to a hidden textarea.
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      el.remove()
    }
  }
}

/** `copy(text)` writes to the clipboard; `copied` is true for `resetMs` afterwards. */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      const ok = await writeText(text)
      if (!ok) return
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetMs)
    },
    [resetMs],
  )

  return { copied, copy }
}
