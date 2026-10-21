import type { FormEvent } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onSubmit, onClear }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        className="search__input"
        placeholder="Search Docker Hub repositories…"
        aria-label="Search repositories"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      {value && (
        <button type="button" className="search__clear" aria-label="Clear search" onClick={onClear}>
          ×
        </button>
      )}
    </form>
  )
}
