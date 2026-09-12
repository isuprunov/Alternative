import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../data/store'
import { computeNowNext, upcomingOccurrences } from '../lib/datetime'
import { buildCoverage, freePositions, plural } from '../lib/services'
import {
  FreePositionCard,
  MeetingItem,
  NewsCard,
  NowNext,
  ResourceCard,
  SectionHead,
} from '../components/blocks'
import {
  CalendarIcon,
  NewsIcon,
  ResourcesIcon,
  ServiceIcon,
} from '../components/icons'
import './pages.css'

export default function HomePage() {
  const { data } = useData()

  const { current, next } = useMemo(
    () => computeNowNext(data.meetings),
    [data.meetings],
  )
  const upcoming = useMemo(
    () => upcomingOccurrences(data.meetings, new Date(), 4),
    [data.meetings],
  )

  const freeServices = useMemo(
    () => freePositions(buildCoverage(data.meetings, data.assignments)),
    [data.meetings, data.assignments],
  )

  const latestNews = useMemo(
    () =>
      [...data.news]
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return b.date.localeCompare(a.date)
        })
        .slice(0, 3),
    [data.news],
  )

  return (
    <div className="fade-in">
      {/* Верхний блок */}
      <section className="hero">
        <h1>{data.settings.name}</h1>
        <p>{data.settings.tagline}</p>
        <div className="hero__actions">
          <Link to="/schedule" className="btn btn-primary">
            <CalendarIcon size={17} />
            Полное расписание
          </Link>
          <Link to="/services" className="btn">
            <ServiceIcon size={17} />
            Нужны служащие
          </Link>
        </div>
      </section>

      {/* Сейчас / Далее */}
      <section className="page-section">
        <NowNext current={current} next={next} />
      </section>

      {/* Ближайшие собрания + Нужны служащие */}
      <div className="home-cols">
        <section>
          <SectionHead
            title="Ближайшие собрания"
            icon={<CalendarIcon size={19} />}
            linkTo="/schedule"
            linkLabel="Все собрания"
          />
          <div className="card list-card">
            {upcoming.map((occ, i) => (
              <MeetingItem key={`${occ.meeting.id}-${i}`} occ={occ} />
            ))}
          </div>
        </section>

        <section>
          <SectionHead
            title="Нужны служащие"
            icon={<ServiceIcon size={19} />}
            linkTo="/services"
            linkLabel="Посмотреть все"
          />
          <div className="stack" style={{ gap: 16 }}>
            <div className="card stat">
              <div className="stat__num">{freeServices.length}</div>
              <div className="stat__label">
                свободных{' '}
                {plural(freeServices.length, 'позиция', 'позиции', 'позиций')}
                <br />
                на ближайших собраниях
              </div>
            </div>
            {freeServices.slice(0, 2).map((c) => (
              <FreePositionCard key={`${c.meeting.id}-${c.role}`} coverage={c} />
            ))}
            {freeServices.length === 0 && (
              <div className="card empty-state">
                Все служения закрыты. Спасибо за участие!
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Новости */}
      <section className="page-section">
        <SectionHead
          title="Новости"
          icon={<NewsIcon size={19} />}
          linkTo="/news"
        />
        <div className="grid grid-news">
          {latestNews.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </section>

      {/* Наши ресурсы */}
      <section className="page-section">
        <SectionHead
          title="Наши ресурсы"
          icon={<ResourcesIcon size={19} />}
          linkTo="/resources"
        />
        <div className="grid grid-resources">
          {data.resources.slice(0, 4).map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </section>
    </div>
  )
}
