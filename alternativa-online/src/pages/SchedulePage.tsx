import { useMemo } from 'react'
import { useData } from '../data/store'
import { JoinButton } from '../components/blocks'
import { CalendarIcon, ClockIcon } from '../components/icons'
import { computeNowNext } from '../lib/datetime'
import './pages.css'

export default function SchedulePage() {
  const { data } = useData()

  const { current, next } = useMemo(
    () => computeNowNext(data.meetings),
    [data.meetings],
  )
  const currentId = current?.meeting.id ?? null
  const nextId = next?.meeting.id ?? null

  // Ежедневное расписание: сортируем собрания по времени начала.
  const sorted = useMemo(
    () => [...data.meetings].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data.meetings],
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Расписание собраний</h1>
        <p>
          Собрания группы проходят ежедневно — каждый нечётный час в :30.
          Идущее сейчас и ближайшее собрание выделены.
        </p>
      </div>

      <div className="card schedule-lead">
        <span className="schedule-lead__icon">
          <ClockIcon size={22} />
        </span>
        <div className="schedule-lead__text">
          <b>Каждый день, круглосуточно</b>
          <span>
            01:30, 03:30, 05:30 … 23:30 — каждое собрание длится 1,5 часа
          </span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card empty-state">
          <CalendarIcon size={32} />
          <div>Расписание пока не заполнено.</div>
        </div>
      ) : (
        <div className="timetable">
          {sorted.map((m) => {
            const isLive = m.id === currentId
            const isNext = m.id === nextId && !isLive
            return (
              <div
                key={m.id}
                className={`card slot${isLive ? ' live' : ''}${
                  isNext ? ' next-up' : ''
                }`}
              >
                {isLive && (
                  <span className="badge badge-live slot__badge">
                    <span className="pulse-dot" /> Идёт сейчас
                  </span>
                )}
                {isNext && (
                  <span className="badge badge-success slot__badge">
                    Ближайшее
                  </span>
                )}
                <div className="slot__time">
                  {m.startTime}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      opacity: 0.7,
                      marginLeft: 6,
                    }}
                  >
                    – {m.endTime}
                  </span>
                </div>
                <div className="slot__title">{m.title}</div>
                {m.note && <div className="slot__note">{m.note}</div>}
                {/* Кнопка «Подключиться» — одна: у идущего собрания,
                    а если сейчас ничего не идёт — у ближайшего. */}
                {(isLive || (isNext && !currentId)) && (
                  <div className="slot__actions">
                    <JoinButton url={m.joinUrl} small primary />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
