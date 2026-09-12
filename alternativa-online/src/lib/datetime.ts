import type { Meeting, Weekday } from '../types'

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
}

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
}

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

/** Возвращает ISO-день недели (1..7) для объекта Date. */
export function isoWeekday(d: Date): Weekday {
  const js = d.getDay() // 0 (вс) .. 6 (сб)
  return (js === 0 ? 7 : js) as Weekday
}

/** "HH:MM" -> количество минут от полуночи. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** "YYYY-MM-DD" -> Date (локальная полночь). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Date -> "YYYY-MM-DD" (локальная зона). */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** «6 сентября» */
export function formatDateHuman(iso: string): string {
  const d = parseDate(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** «6 сентября, суббота» */
export function formatDateFull(iso: string): string {
  const d = parseDate(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAY_NAMES[
    isoWeekday(d)
  ].toLowerCase()}`
}

/** Человекочитаемая относительная дата: Сегодня / Завтра / дата. */
export function relativeDay(iso: string, now = new Date()): string {
  const target = parseDate(iso)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  if (diffDays === -1) return 'Вчера'
  return formatDateHuman(iso)
}

/** Экземпляр собрания, привязанный к конкретной дате. */
export interface MeetingOccurrence {
  meeting: Meeting
  /** Дата и время начала. */
  start: Date
  /** Дата и время окончания. */
  end: Date
}

/** Длительность собрания в минутах (с учётом перехода за полночь). */
function durationMinutes(meeting: Meeting): number {
  const startMin = timeToMinutes(meeting.startTime)
  const endMin = timeToMinutes(meeting.endTime)
  return ((endMin - startMin + 1440) % 1440) || 60
}

/**
 * Вычисляет ближайший экземпляр ежедневного собрания начиная с момента `from`
 * (включая идущее сейчас). Корректно обрабатывает собрания, переходящие
 * за полночь (например, 23:30–00:30).
 */
function nextOccurrence(meeting: Meeting, from: Date): MeetingOccurrence {
  const startMin = timeToMinutes(meeting.startTime)
  const durMin = durationMinutes(meeting)

  // Проверяем вчера / сегодня / завтра и берём первый экземпляр,
  // который ещё не завершился (вчера — чтобы поймать идущее собрание,
  // начавшееся до полуночи).
  for (let dayDelta = -1; dayDelta <= 1; dayDelta++) {
    const start = new Date(from)
    start.setDate(from.getDate() + dayDelta)
    start.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0)
    const end = new Date(start.getTime() + durMin * 60000)
    if (from.getTime() < end.getTime()) {
      return { meeting, start, end }
    }
  }

  // Фолбэк (недостижимо при корректных данных).
  const start = new Date(from)
  start.setDate(from.getDate() + 1)
  start.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0)
  return { meeting, start, end: new Date(start.getTime() + durMin * 60000) }
}

/**
 * Список ближайших экземпляров собраний, отсортированный по времени начала.
 */
export function upcomingOccurrences(
  meetings: Meeting[],
  now = new Date(),
  limit = 10,
): MeetingOccurrence[] {
  return meetings
    .map((m) => nextOccurrence(m, now))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit)
}

export interface NowNextState {
  /** Собрание, идущее прямо сейчас (если есть). */
  current: MeetingOccurrence | null
  /** Ближайшее предстоящее собрание. */
  next: MeetingOccurrence | null
}

/** Определяет текущее и ближайшее собрания. */
export function computeNowNext(
  meetings: Meeting[],
  now = new Date(),
): NowNextState {
  const occ = upcomingOccurrences(meetings, now, meetings.length + 2)

  const current =
    occ.find((o) => o.start.getTime() <= now.getTime() && now.getTime() < o.end.getTime()) ??
    null

  const next = occ.find((o) => o.start.getTime() > now.getTime()) ?? null

  return { current, next }
}

/** «14:30» из Date. */
export function formatTime(d: Date): string {
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

/** Оставшееся время в человекочитаемом виде: «через 2 ч 15 мин». */
export function timeUntil(target: Date, now = new Date()): string {
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return 'сейчас'
  const totalMin = Math.round(diffMs / 60000)
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const mins = totalMin % 60

  if (days > 0) return `через ${days} дн ${hours} ч`
  if (hours > 0) return `через ${hours} ч ${mins} мин`
  return `через ${mins} мин`
}
