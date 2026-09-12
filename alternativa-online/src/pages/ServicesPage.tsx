import { useMemo, useState } from 'react'
import { useData } from '../data/store'
import { RoleRow } from '../components/blocks'
import { ServiceIcon } from '../components/icons'
import {
  buildCoverage,
  freePositions,
  plural,
  type RoleCoverage,
} from '../lib/services'
import { SERVICE_ROLES, type Meeting, type ServiceRole } from '../types'
import './pages.css'

export default function ServicesPage() {
  const { data } = useData()
  const [roleFilter, setRoleFilter] = useState<ServiceRole | 'all'>('all')
  const [onlyNeeded, setOnlyNeeded] = useState(false)

  const coverage = useMemo(
    () => buildCoverage(data.meetings, data.assignments),
    [data.meetings, data.assignments],
  )
  const freeCount = useMemo(() => freePositions(coverage).length, [coverage])

  // Группируем покрытие по собранию-слоту с учётом фильтров.
  const slots = useMemo(() => {
    const map = new Map<string, { meeting: Meeting; rows: RoleCoverage[] }>()
    for (const c of coverage) {
      if (roleFilter !== 'all' && c.role !== roleFilter) continue
      if (onlyNeeded && c.permanent) continue
      const entry = map.get(c.meeting.id) ?? { meeting: c.meeting, rows: [] }
      entry.rows.push(c)
      map.set(c.meeting.id, entry)
    }
    return [...map.values()].sort((a, b) =>
      a.meeting.startTime.localeCompare(b.meeting.startTime),
    )
  }, [coverage, roleFilter, onlyNeeded])

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Служения</h1>
        <p>
          На каждое собрание нужны <strong>соорг</strong>,{' '}
          <strong>ведущий</strong> и <strong>чайханщик</strong>. Сейчас свободно{' '}
          <strong>{freeCount}</strong>{' '}
          {plural(freeCount, 'позиция', 'позиции', 'позиций')}. Служение можно
          взять разово или на постоянку — назначает администратор.
        </p>
      </div>

      {/* Фильтр по роли */}
      <div className="filters">
        <button
          className={`filter-chip${roleFilter === 'all' ? ' active' : ''}`}
          onClick={() => setRoleFilter('all')}
        >
          Все роли
        </button>
        {SERVICE_ROLES.map((r) => (
          <button
            key={r}
            className={`filter-chip${roleFilter === r ? ' active' : ''}`}
            onClick={() => setRoleFilter(r)}
            style={{ textTransform: 'capitalize' }}
          >
            {r}
          </button>
        ))}
        <button
          className={`filter-chip${onlyNeeded ? ' active' : ''}`}
          onClick={() => setOnlyNeeded((v) => !v)}
          style={{ marginLeft: 'auto' }}
        >
          Только где нужны служащие
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="card empty-state">
          <ServiceIcon size={32} />
          <div>По выбранным фильтрам служений не найдено.</div>
        </div>
      ) : (
        <div className="svc-slots">
          {slots.map(({ meeting, rows }) => (
            <div key={meeting.id} className="card svc-slot">
              <div className="svc-slot__head">
                <span className="svc-slot__time">{meeting.startTime}</span>
                <span className="svc-slot__title">{meeting.title}</span>
              </div>
              {rows.map((row) => (
                <RoleRow key={row.role} coverage={row} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
