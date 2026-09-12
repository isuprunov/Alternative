import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import ServicesPage from './pages/ServicesPage'
import NewsPage from './pages/NewsPage'
import NewsDetailPage from './pages/NewsDetailPage'
import ResourcesPage from './pages/ResourcesPage'
import AdminPage from './pages/AdminPage'

/** Прокрутка к началу страницы при смене маршрута. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </>
  )
}
