import type { Meeting, ServiceAssignment, ServiceRole } from '../types'
import { SERVICE_ROLES } from '../types'
import { toISODate } from './datetime'

/** Покрытие одной роли на одном собрании-слоте. */
export interface RoleCoverage {
  meeting: Meeting
  role: ServiceRole
  /** Постоянно закреплённый служащий (если есть). */
  permanent?: ServiceAssignment
  /** Разовые назначения на предстоящие даты, отсортированы по дате. */
  onceUpcoming: ServiceAssignment[]
}

/**
 * Строит покрытие «собрание × роль» для всех слотов.
 * Слот-роль без постоянного назначения считается свободной (нужен служащий).
 */
export function buildCoverage(
  meetings: Meeting[],
  assignments: ServiceAssignment[],
  today: string = toISODate(new Date()),
): RoleCoverage[] {
  const sorted = [...meetings].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )
  const result: RoleCoverage[] = []
  for (const meeting of sorted) {
    for (const role of SERVICE_ROLES) {
      const cell = assignments.filter(
        (a) => a.meetingId === meeting.id && a.role === role,
      )
      const permanent = cell.find((a) => a.scope === 'permanent')
      const onceUpcoming = cell
        .filter((a) => a.scope === 'once' && a.date && a.date >= today)
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
      result.push({ meeting, role, permanent, onceUpcoming })
    }
  }
  return result
}

/** Свободные позиции (роли без постоянного служащего). */
export function freePositions(coverage: RoleCoverage[]): RoleCoverage[] {
  return coverage.filter((c) => !c.permanent)
}

/** "@ivan" или "ivan" -> "@ivan". */
export function normalizeTg(nick: string): string {
  const clean = nick.trim().replace(/^@/, '')
  return clean ? `@${clean}` : ''
}

/** Ссылка на профиль в Telegram по нику. */
export function telegramLink(nick: string): string {
  return `https://t.me/${nick.trim().replace(/^@/, '')}`
}

/** Русское склонение существительного по числу. */
export function plural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
