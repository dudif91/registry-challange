import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { ExplorePage } from './pages/ExplorePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RepoDetailsPage } from './pages/RepoDetailsPage'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" className="container">
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/r/:namespace/:name" element={<RepoDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}
