import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

interface Props {
  text: string
  label?: string
  ariaLabel?: string
}

export function CopyButton({ text, label = 'Copy Command', ariaLabel }: Props) {
  const { copied, failed, copy } = useCopyToClipboard()
  return (
    <button type="button" className="btn btn--secondary" aria-label={ariaLabel} onClick={() => copy(text)}>
      <span aria-live="polite">{copied ? 'Copied ✓' : failed ? 'Copy failed' : label}</span>
    </button>
  )
}
