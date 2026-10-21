import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">
          <span aria-hidden="true">🐳</span> Registry UI
        </Link>
      </div>
    </header>
  )
}
