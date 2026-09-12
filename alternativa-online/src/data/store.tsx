import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  CommunitySettings,
  Meeting,
  NewsItem,
  Resource,
  ServiceAssignment,
} from '../types'
import { api } from './api'

/**
 * Слой данных приложения. Источник истины — бэкенд (Alternativa.Api).
 * Данные загружаются при старте, мутации отправляются на сервер и затем
 * применяются к локальному состоянию.
 */

export interface DataContextValue {
  data: AppData

  // Настройки
  updateSettings: (patch: Partial<CommunitySettings>) => Promise<void>

  // Собрания
  addMeeting: (m: Omit<Meeting, 'id'>) => Promise<void>
  updateMeeting: (id: string, patch: Partial<Meeting>) => Promise<void>
  removeMeeting: (id: string) => Promise<void>

  // Служения (назначения)
  addAssignment: (a: Omit<ServiceAssignment, 'id'>) => Promise<void>
  updateAssignment: (
    id: string,
    patch: Partial<ServiceAssignment>,
  ) => Promise<void>
  removeAssignment: (id: string) => Promise<void>

  // Новости
  addNews: (n: Omit<NewsItem, 'id'>) => Promise<void>
  updateNews: (id: string, patch: Partial<NewsItem>) => Promise<void>
  removeNews: (id: string) => Promise<void>

  // Ресурсы
  addResource: (r: Omit<Resource, 'id'>) => Promise<void>
  updateResource: (id: string, patch: Partial<Resource>) => Promise<void>
  removeResource: (id: string) => Promise<void>

  /** Перезагрузить данные с сервера. */
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Актуальный снимок данных для чтения внутри мутаций.
  const dataRef = useRef<AppData | null>(null)
  dataRef.current = data

  const load = useCallback(async () => {
    setError(null)
    try {
      setData(await api.getData())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const value = useMemo<DataContextValue>(() => {
    // Мутации: <T> — тип сущности, работают с локальным состоянием после ответа сервера.
    const upsert = <K extends 'meetings' | 'assignments' | 'news' | 'resources'>(
      key: K,
      item: AppData[K][number],
    ) =>
      setData((d) => {
        if (!d) return d
        const list = d[key] as AppData[K]
        const exists = list.some((x) => x.id === item.id)
        const next = exists
          ? list.map((x) => (x.id === item.id ? item : x))
          : [...list, item]
        return { ...d, [key]: next }
      })

    const removeLocal = (
      key: 'meetings' | 'assignments' | 'news' | 'resources',
      id: string,
    ) =>
      setData((d) =>
        d ? { ...d, [key]: d[key].filter((x) => x.id !== id) } : d,
      )

    return {
      // data гарантированно не null: провайдер рендерит children только после загрузки.
      data: data as AppData,

      updateSettings: async (patch) => {
        const current = dataRef.current?.settings ?? { name: '', tagline: '' }
        const merged = { ...current, ...patch }
        const saved = await api.updateSettings(merged)
        setData((d) => (d ? { ...d, settings: saved } : d))
      },

      addMeeting: async (m) => upsert('meetings', await api.meetings.create(m)),
      updateMeeting: async (id, patch) => {
        const current = dataRef.current?.meetings.find((x) => x.id === id)
        if (!current) return
        upsert('meetings', await api.meetings.update(id, { ...current, ...patch }))
      },
      removeMeeting: async (id) => {
        await api.meetings.remove(id)
        removeLocal('meetings', id)
      },

      addAssignment: async (a) =>
        upsert('assignments', await api.assignments.create(a)),
      updateAssignment: async (id, patch) => {
        const current = dataRef.current?.assignments.find((x) => x.id === id)
        if (!current) return
        upsert(
          'assignments',
          await api.assignments.update(id, { ...current, ...patch }),
        )
      },
      removeAssignment: async (id) => {
        await api.assignments.remove(id)
        removeLocal('assignments', id)
      },

      addNews: async (n) => upsert('news', await api.news.create(n)),
      updateNews: async (id, patch) => {
        const current = dataRef.current?.news.find((x) => x.id === id)
        if (!current) return
        upsert('news', await api.news.update(id, { ...current, ...patch }))
      },
      removeNews: async (id) => {
        await api.news.remove(id)
        removeLocal('news', id)
      },

      addResource: async (r) =>
        upsert('resources', await api.resources.create(r)),
      updateResource: async (id, patch) => {
        const current = dataRef.current?.resources.find((x) => x.id === id)
        if (!current) return
        upsert(
          'resources',
          await api.resources.update(id, { ...current, ...patch }),
        )
      },
      removeResource: async (id) => {
        await api.resources.remove(id)
        removeLocal('resources', id)
      },

      refresh: load,
    }
  }, [data, load])

  if (error) {
    return (
      <div className="app-status">
        <div className="card app-status__card">
          <h2>Не удалось подключиться к серверу</h2>
          <p className="secondary">{error}</p>
          <p className="muted" style={{ fontSize: 13 }}>
            Убедитесь, что запущен бэкенд (Alternativa.Api) на порту 5080 и база
            данных (docker compose up -d).
          </p>
          <button className="btn btn-primary" onClick={() => void load()}>
            Повторить
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="app-status">
        <div className="app-status__spinner" />
        <p className="muted">Загрузка данных…</p>
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/** Доступ к слою данных из компонентов. */
// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData должен использоваться внутри <DataProvider>')
  return ctx
}
