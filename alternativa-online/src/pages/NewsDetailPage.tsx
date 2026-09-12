import { Link, useParams } from 'react-router-dom'
import { useData } from '../data/store'
import { ArrowRightIcon, ImportantIcon, PinIcon } from '../components/icons'
import { formatDateFull } from '../lib/datetime'
import './pages.css'

export default function NewsDetailPage() {
  const { id } = useParams()
  const { data } = useData()
  const item = data.news.find((n) => n.id === id)

  if (!item) {
    return (
      <div className="fade-in">
        <Link to="/news" className="back-link">
          <ArrowRightIcon size={16} style={{ transform: 'rotate(180deg)' }} />
          К новостям
        </Link>
        <div className="card empty-state">Новость не найдена.</div>
      </div>
    )
  }

  return (
    <article className="fade-in news-detail">
      <Link to="/news" className="back-link">
        <ArrowRightIcon size={16} style={{ transform: 'rotate(180deg)' }} />
        К новостям
      </Link>

      <div className="news-card__meta" style={{ marginBottom: 12 }}>
        {item.important && (
          <span className="badge badge-danger badge-dot">
            <ImportantIcon size={12} /> Важно
          </span>
        )}
        {item.pinned && !item.important && (
          <span className="badge badge-warning">
            <PinIcon size={12} /> Закреплено
          </span>
        )}
        <span>{formatDateFull(item.date)}</span>
      </div>

      <h1>{item.title}</h1>

      {item.imageUrl && (
        <img className="news-detail__img" src={item.imageUrl} alt="" />
      )}

      <p className="news-detail__body">{item.body}</p>
    </article>
  )
}
