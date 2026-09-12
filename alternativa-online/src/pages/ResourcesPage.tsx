import { useData } from '../data/store'
import { ResourceCard } from '../components/blocks'
import { ResourcesIcon } from '../components/icons'
import './pages.css'

export default function ResourcesPage() {
  const { data } = useData()

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Наши ресурсы</h1>
        <p>
          Основные ресурсы сообщества. Ссылки открываются в новой вкладке.
        </p>
      </div>

      {data.resources.length === 0 ? (
        <div className="card empty-state">
          <ResourcesIcon size={32} />
          <div>Ресурсы пока не добавлены.</div>
        </div>
      ) : (
        <div className="grid grid-resources">
          {data.resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}
