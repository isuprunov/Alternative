import { useMemo } from 'react'
import { useData } from '../data/store'
import { NewsCard } from '../components/blocks'
import { NewsIcon } from '../components/icons'
import './pages.css'

export default function NewsPage() {
  const { data } = useData()

  const sorted = useMemo(
    () =>
      [...data.news].sort((a, b) => {
        // Закреплённые — всегда сверху, затем по дате (новые выше).
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.date.localeCompare(a.date)
      }),
    [data.news],
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Новости</h1>
        <p>Объявления и новости сообщества. Важное закреплено вверху.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="card empty-state">
          <NewsIcon size={32} />
          <div>Новостей пока нет.</div>
        </div>
      ) : (
        <div className="grid grid-news">
          {sorted.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  )
}
