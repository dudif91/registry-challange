import { useState } from 'react'

interface Props {
  name: string
  src?: string
  size?: number
}

/** Repository logo with an initial-letter fallback (logos are optional and can fail to load). */
export function RepoLogo({ name, src, size = 48 }: Props) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size }

  if (!src || failed) {
    return (
      <span className="logo logo--fallback" style={style} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
    )
  }
  return <img className="logo" style={style} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
}
