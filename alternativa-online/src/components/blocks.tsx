import { Link } from 'react-router-dom'
import type { NewsItem, Resource } from '../types'
import {
  ArrowRightIcon,
  ClockIcon,
  ExternalIcon,
  ImportantIcon,
  PinIcon,
  PlayIcon,
  ResourceGlyph,
} from './icons'
import {
  formatDateHuman,
  formatTime,
  relativeDay,
  timeUntil,
  WEEKDAY_SHORT,
  type MeetingOccurrence,
} from '../lib/datetime'
import { isoWeekday } from '../lib/datetime'
import {
  normalizeTg,
  telegramLink,
  type RoleCoverage,
} from '../lib/services'
import './blocks.css'

/** Ссылка «Подключиться» — открывается в новой вкладке. */
export function JoinButton({
  url,
  small,
  primary = true,
}: {
  url: string
  small?: boolean
  primary?: boolean
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn${primary ? ' btn-primary' : ''}${small ? ' btn-sm' : ''}`}
    >
      <PlayIcon size={small ? 14 : 16} />
      Подключиться
    </a>
  )
}

/** Заголовок секции со ссылкой «смотреть все». */
export function SectionHead({
  title,
  icon,
  linkTo,
  linkLabel,
}: {
  title: string
  icon?: React.ReactNode
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="section-head">
      <h2>
        {icon}
        {title}
      </h2>
      {linkTo && (
        <Link to={linkTo} className="section-link">
          {linkLabel ?? 'Смотреть все'}
          <ArrowRightIcon size={15} />
        </Link>
      )}
    </div>
  )
}

/** Блок «Сейчас / Далее». */
export function NowNext({
  current,
  next,
}: {
  current: MeetingOccurrence | null
  next: MeetingOccurrence | null
}) {
  if (!current && !next) {
    return (
      <div className="card nownext">
        <div className="nownext__empty">Ближайшие собрания пока не запланированы.</div>
      </div>
    )
  }

  return (
    <div className="card nownext">
      {current && (
        <div className="nownext__live">
          <div className="nownext__live-top">
            <span className="pulse-dot" />
            Сейчас идёт собрание
          </div>
          <div className="nownext__live-title">{current.meeting.title}</div>
          <div className="nownext__live-meta">
            Завершится в {formatTime(current.end)}
          </div>
          <div className="nownext__live-actions">
            <JoinButton url={current.meeting.joinUrl} />
          </div>
        </div>
      )}

      {next && (
        <div className="nownext__upcoming">
          <div className="nownext__label">
            {current ? 'Следующее собрание' : 'Ближайшее собрание'}
          </div>
          <div className="nownext__row">
            <div className="nownext__when">
              <span className="nownext__when-day">
                {relativeDay(toISO(next.start))}
              </span>
              <span className="nownext__when-time">{formatTime(next.start)}</span>
            </div>
            <div className="nownext__info">
              <div className="nownext__info-title">{next.meeting.title}</div>
              <div className="nownext__info-sub">
                {WEEKDAY_SHORT[isoWeekday(next.start)]}, {formatDateHuman(toISO(next.start))}
                {' · '}
                {timeUntil(next.start)}
              </div>
            </div>
            {!current && (
              <div className="meeting-item__actions">
                <JoinButton url={next.meeting.joinUrl} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Строка ближайшего собрания (для главной) — информационная, без кнопки. */
export function MeetingItem({ occ }: { occ: MeetingOccurrence }) {
  return (
    <div className="meeting-item">
      <div className="meeting-item__time">
        <b>{formatTime(occ.start)}</b>
        <span>{relativeDay(toISO(occ.start))}</span>
      </div>
      <div className="meeting-item__body">
        <div className="meeting-item__title">{occ.meeting.title}</div>
        {occ.meeting.note && (
          <div className="meeting-item__note">{occ.meeting.note}</div>
        )}
      </div>
    </div>
  )
}


/** Карточка новости в ленте. */
export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="card news-card fade-in">
      {item.imageUrl && (
        <img className="news-card__img" src={item.imageUrl} alt="" loading="lazy" />
      )}
      <div className="news-card__body">
        <div className="news-card__meta">
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
          <span>{formatDateHuman(item.date)}</span>
        </div>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__excerpt">{item.excerpt}</p>
        <div className="news-card__footer">
          <Link to={`/news/${item.id}`} className="section-link">
            Подробнее <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Карточка внешнего ресурса. */
export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="card resource-card">
      <div className="resource-card__icon">
        <ResourceGlyph icon={resource.icon} />
      </div>
      <div className="stack" style={{ gap: 4, flex: 1 }}>
        <div className="resource-card__name">{resource.name}</div>
        <p className="resource-card__desc">{resource.description}</p>
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm"
      >
        Перейти
        <ExternalIcon size={15} />
      </a>
    </div>
  )
}

/** Ссылка на Telegram-профиль служащего. */
function AssigneeTg({ nick }: { nick: string }) {
  const label = normalizeTg(nick)
  if (!label) return null
  return (
    <a
      href={telegramLink(nick)}
      target="_blank"
      rel="noopener noreferrer"
      className="tg-link"
    >
      {label}
    </a>
  )
}

/**
 * Полный блок роли на собрании: постоянный служащий (по умолчанию) и
 * список разовых назначений на конкретные дни («замены по дням»).
 */
export function RoleRow({ coverage }: { coverage: RoleCoverage }) {
  const { role, permanent, onceUpcoming } = coverage
  const hasExceptions = onceUpcoming.length > 0

  return (
    <div className="svc-role">
      <div className="svc-role__top">
        <span className="svc-role__name">{role}</span>
        {permanent ? (
          <span className="badge badge-success">Постоянно</span>
        ) : (
          <span className="badge badge-warning badge-dot">Нужен служащий</span>
        )}
      </div>

      {permanent && (
        <div className="svc-role__person">
          <span className="svc-role__person-name">{permanent.assigneeName}</span>
          <AssigneeTg nick={permanent.assigneeTelegram} />
          <span className="svc-role__person-tag">каждый день</span>
        </div>
      )}

      {hasExceptions && (
        <div className="svc-exceptions">
          <div className="svc-exceptions__label">
            {permanent ? 'Замены по дням' : 'Разовые назначения'}
          </div>
          {onceUpcoming.map((a) => (
            <div key={a.id} className="svc-exception">
              <span className="svc-exception__date">{relativeDay(a.date!)}</span>
              <span className="svc-exception__who">
                {a.assigneeName} <AssigneeTg nick={a.assigneeTelegram} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Компактная карточка свободной позиции (для главной). */
export function FreePositionCard({ coverage }: { coverage: RoleCoverage }) {
  return (
    <div className="card svc-free-card">
      <div className="svc-free-card__role">{coverage.role}</div>
      <div className="svc-free-card__meeting">
        <ClockIcon size={14} />
        {coverage.meeting.startTime} · {coverage.meeting.title}
      </div>
      <span className="badge badge-warning badge-dot">Нужен служащий</span>
    </div>
  )
}
