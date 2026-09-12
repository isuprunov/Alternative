/**
 * Доменные типы приложения «Альтернатива Онлайн».
 *
 * Структуры данных намеренно приближены к тому, что может отдавать
 * внешний источник (Telegram-бот / REST API), чтобы в дальнейшем
 * слой данных (src/data/store.ts) можно было заменить без правок UI.
 */

/** День недели: 1 — понедельник ... 7 — воскресенье (ISO 8601). */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Собрание в расписании.
 * Расписание ежедневное: собрание повторяется каждый день в указанное время
 * (группа проходит круглосуточно — каждый нечётный час в :30).
 */
export interface Meeting {
  id: string
  title: string
  /** Время начала в формате "HH:MM" (24 ч). */
  startTime: string
  /** Время окончания в формате "HH:MM" (24 ч). Может переходить за полночь. */
  endTime: string
  /** Ссылка для подключения (Zoom и т.п.). */
  joinUrl: string
  /** Необязательная дополнительная информация. */
  note?: string
}

/** Тип служения. На каждое собрание нужны все три. */
export type ServiceRole = 'соорг' | 'ведущий' | 'чайханщик'

/** Все роли служений в порядке отображения. */
export const SERVICE_ROLES: ServiceRole[] = ['соорг', 'ведущий', 'чайханщик']

/** Как взято служение: разово (на дату) или на постоянку (каждый день). */
export type AssignmentScope = 'once' | 'permanent'

/**
 * Назначение служащего на роль конкретного собрания (слота времени).
 *
 * Назначает только администратор. «permanent» — служащий закреплён за слотом
 * каждый день; «once» — только на дату `date`. Отсутствие назначения на роль
 * означает, что служение свободно и требуется служащий.
 */
export interface ServiceAssignment {
  id: string
  /** Ссылка на собрание-слот (Meeting.id). */
  meetingId: string
  role: ServiceRole
  scope: AssignmentScope
  /** Дата в формате ISO "YYYY-MM-DD" — обязательна для scope="once". */
  date?: string
  /** Имя назначенного служащего. */
  assigneeName: string
  /** Telegram-ник, например "@ivan". */
  assigneeTelegram: string
}

/** Новость / объявление. */
export interface NewsItem {
  id: string
  /** Дата публикации в формате ISO "YYYY-MM-DD". */
  date: string
  title: string
  /** Короткое описание для карточки. */
  excerpt: string
  /** Полный текст (поддерживает переносы строк). */
  body: string
  /** Необязательное изображение (URL). */
  imageUrl?: string
  /** Закреплено в верхней части раздела. */
  pinned: boolean
  /** Особо важное объявление (статус «Важно»). */
  important: boolean
}

/** Ключ иконки для карточки ресурса. */
export type ResourceIcon =
  | 'telegram'
  | 'bot'
  | 'channel'
  | 'chat'
  | 'video'
  | 'link'

/** Внешний ресурс сообщества. */
export interface Resource {
  id: string
  name: string
  description: string
  url: string
  icon: ResourceIcon
}

/** Общие настройки сообщества. */
export interface CommunitySettings {
  name: string
  tagline: string
}

/** Полный снимок данных приложения. */
export interface AppData {
  settings: CommunitySettings
  meetings: Meeting[]
  assignments: ServiceAssignment[]
  news: NewsItem[]
  resources: Resource[]
}
