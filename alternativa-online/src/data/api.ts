import type {
  AppData,
  CommunitySettings,
  Meeting,
  NewsItem,
  Resource,
  ServiceAssignment,
} from '../types'

/** Базовый адрес API (можно переопределить через VITE_API_URL). */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5080/api'

interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

async function http<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) {
    throw new Error(`Запрос ${path} завершился ошибкой ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** CRUD-набор для сущности с строковым id. */
function crud<T extends { id: string }>(path: string) {
  return {
    create: (body: Omit<T, 'id'>) => http<T>(path, { method: 'POST', body }),
    update: (id: string, body: T) =>
      http<T>(`${path}/${id}`, { method: 'PUT', body }),
    remove: (id: string) => http<void>(`${path}/${id}`, { method: 'DELETE' }),
  }
}

export const api = {
  /** Сводный снимок всех данных. */
  getData: () => http<AppData>('/data'),

  updateSettings: (body: CommunitySettings) =>
    http<CommunitySettings>('/settings', { method: 'PUT', body }),

  meetings: crud<Meeting>('/meetings'),
  assignments: crud<ServiceAssignment>('/assignments'),
  news: crud<NewsItem>('/news'),
  resources: crud<Resource>('/resources'),
}
