import { useState } from 'react'
import { useData } from '../data/store'
import Modal from '../components/Modal'
import {
  EditIcon,
  ImportantIcon,
  PinIcon,
  PlusIcon,
  ResourceGlyph,
  TrashIcon,
} from '../components/icons'
import type {
  AssignmentScope,
  Meeting,
  NewsItem,
  Resource,
  ResourceIcon,
  ServiceAssignment,
  ServiceRole,
} from '../types'
import { SERVICE_ROLES } from '../types'
import { formatDateHuman } from '../lib/datetime'
import './pages.css'
import './admin.css'

type Tab = 'settings' | 'meetings' | 'services' | 'news' | 'resources'

const TABS: { key: Tab; label: string }[] = [
  { key: 'settings', label: 'Настройки' },
  { key: 'meetings', label: 'Собрания' },
  { key: 'services', label: 'Служения' },
  { key: 'news', label: 'Новости' },
  { key: 'resources', label: 'Ресурсы' },
]

const ICONS: ResourceIcon[] = [
  'telegram',
  'bot',
  'channel',
  'chat',
  'video',
  'link',
]

export default function AdminPage() {
  // Пароль временно отключён — админка доступна без входа.
  return <AdminPanel />
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>('settings')
  const { refresh } = useData()

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Административная панель</h1>
        <p>
          Редактирование содержимого сайта без изменения кода. Данные
          сохраняются на сервере.
        </p>
      </div>

      <div className="admin-note">
        <strong>Как это работает.</strong> Все изменения сразу отправляются на
        бэкенд (Alternativa.Api) и сохраняются в базе данных PostgreSQL.
        Архитектура рассчитана на дальнейшее подключение синхронизации с
        Telegram-ботом.
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && <SettingsTab />}
      {tab === 'meetings' && <MeetingsTab />}
      {tab === 'services' && <ServicesTab />}
      {tab === 'news' && <NewsTab />}
      {tab === 'resources' && <ResourcesTab />}

      <div className="divider" style={{ margin: '32px 0 20px' }} />
      <button className="btn btn-sm" onClick={() => void refresh()}>
        Обновить данные с сервера
      </button>
    </div>
  )
}

/* ============================ Настройки ============================ */

function SettingsTab() {
  const { data, updateSettings } = useData()
  return (
    <div className="card" style={{ padding: 22, maxWidth: 620 }}>
      <div className="stack" style={{ gap: 16 }}>
        <div className="field">
          <label>Название сообщества</label>
          <input
            className="input"
            value={data.settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Короткое описание</label>
          <textarea
            className="textarea"
            value={data.settings.tagline}
            onChange={(e) => updateSettings({ tagline: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

/* ============================ Собрания ============================ */

function emptyMeeting(): Omit<Meeting, 'id'> {
  return {
    title: 'Собрание группы',
    startTime: '01:30',
    endTime: '03:00',
    joinUrl: '',
    note: '',
  }
}

function MeetingsTab() {
  const { data, addMeeting, updateMeeting, removeMeeting } = useData()
  const [editing, setEditing] = useState<Meeting | 'new' | null>(null)

  const sorted = [...data.meetings].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )

  return (
    <div>
      <div className="admin-toolbar">
        <span className="muted">Всего собраний: {data.meetings.length}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <PlusIcon size={16} /> Добавить собрание
        </button>
      </div>

      <div className="card list-card">
        {sorted.map((m) => (
          <div key={m.id} className="admin-row">
            <div className="admin-row__main">
              <div className="admin-row__title">{m.title}</div>
              <div className="admin-row__sub">
                Ежедневно, {m.startTime}–{m.endTime}
                {m.note ? ` · ${m.note}` : ''}
              </div>
            </div>
            <div className="admin-row__actions">
              <button className="icon-btn" onClick={() => setEditing(m)} aria-label="Изменить">
                <EditIcon size={18} />
              </button>
              <button
                className="icon-btn"
                onClick={() => removeMeeting(m.id)}
                aria-label="Удалить"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="empty-state">Собраний пока нет.</div>
        )}
      </div>

      {editing && (
        <MeetingForm
          initial={editing === 'new' ? emptyMeeting() : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addMeeting(draft)
            else updateMeeting(editing.id, draft)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function MeetingForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Omit<Meeting, 'id'>
  onClose: () => void
  onSave: (m: Omit<Meeting, 'id'>) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Omit<Meeting, 'id'>>(k: K, v: Meeting[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Modal
      title="Собрание"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={!draft.title.trim()}
            onClick={() => onSave(draft)}
          >
            Сохранить
          </button>
        </>
      }
    >
      <div className="field">
        <label>Название собрания</label>
        <input
          className="input"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Например, Вечернее собрание"
        />
      </div>
      <p className="muted" style={{ fontSize: 13 }}>
        Собрание повторяется ежедневно в указанное время.
      </p>
      <div className="form-row">
        <div className="field">
          <label>Время начала</label>
          <input
            className="input"
            type="time"
            value={draft.startTime}
            onChange={(e) => set('startTime', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Время окончания</label>
          <input
            className="input"
            type="time"
            value={draft.endTime}
            onChange={(e) => set('endTime', e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label>Ссылка для подключения</label>
        <input
          className="input"
          value={draft.joinUrl}
          onChange={(e) => set('joinUrl', e.target.value)}
          placeholder="https://zoom.us/j/..."
        />
      </div>
      <div className="field">
        <label>Дополнительная информация (необязательно)</label>
        <input
          className="input"
          value={draft.note ?? ''}
          onChange={(e) => set('note', e.target.value)}
        />
      </div>
    </Modal>
  )
}

/* ==================== Служения (назначения) ==================== */

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function emptyAssignment(meetingId: string): Omit<ServiceAssignment, 'id'> {
  return {
    meetingId,
    role: 'соорг',
    scope: 'once',
    date: todayISO(),
    assigneeName: '',
    assigneeTelegram: '',
  }
}

function ServicesTab() {
  const { data, addAssignment, updateAssignment, removeAssignment } = useData()
  const [editing, setEditing] = useState<ServiceAssignment | 'new' | null>(null)
  const [meetingFilter, setMeetingFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<ServiceRole | 'all'>('all')
  const [scopeFilter, setScopeFilter] = useState<AssignmentScope | 'all'>('all')

  const meetingsSorted = [...data.meetings].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )
  const meetingById = (id: string) => data.meetings.find((m) => m.id === id)

  const sorted = [...data.assignments].sort((a, b) => {
    const ta = meetingById(a.meetingId)?.startTime ?? ''
    const tb = meetingById(b.meetingId)?.startTime ?? ''
    return ta.localeCompare(tb) || a.role.localeCompare(b.role)
  })

  const filtered = sorted.filter(
    (a) =>
      (meetingFilter === 'all' || a.meetingId === meetingFilter) &&
      (roleFilter === 'all' || a.role === roleFilter) &&
      (scopeFilter === 'all' || a.scope === scopeFilter),
  )

  const filtersActive =
    meetingFilter !== 'all' || roleFilter !== 'all' || scopeFilter !== 'all'

  const noMeetings = data.meetings.length === 0

  return (
    <div>
      <div className="admin-note" style={{ marginBottom: 16 }}>
        На каждое собрание нужны <strong>соорг</strong>,{' '}
        <strong>ведущий</strong> и <strong>чайханщик</strong>. Роль без
        постоянного назначения считается свободной. Назначение может быть{' '}
        <strong>разовым</strong> (на дату) или <strong>постоянным</strong>{' '}
        (каждый день).
      </div>

      <div className="admin-toolbar">
        <span className="muted">
          {filtersActive
            ? `Показано: ${filtered.length} из ${data.assignments.length}`
            : `Назначений: ${data.assignments.length}`}
        </span>
        <button
          className="btn btn-primary btn-sm"
          disabled={noMeetings}
          onClick={() => setEditing('new')}
        >
          <PlusIcon size={16} /> Назначить служащего
        </button>
      </div>

      {!noMeetings && (
        <div className="admin-filters">
          <div className="field">
            <label>Время</label>
            <select
              className="select"
              value={meetingFilter}
              onChange={(e) => setMeetingFilter(e.target.value)}
            >
              <option value="all">Все собрания</option>
              {meetingsSorted.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.startTime} · {m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Тип служения</label>
            <select
              className="select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as ServiceRole | 'all')}
            >
              <option value="all">Все роли</option>
              {SERVICE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Назначение</label>
            <select
              className="select"
              value={scopeFilter}
              onChange={(e) =>
                setScopeFilter(e.target.value as AssignmentScope | 'all')
              }
            >
              <option value="all">Любое</option>
              <option value="permanent">Постоянные</option>
              <option value="once">Разовые</option>
            </select>
          </div>
          {filtersActive && (
            <button
              className="btn btn-ghost btn-sm admin-filters__reset"
              onClick={() => {
                setMeetingFilter('all')
                setRoleFilter('all')
                setScopeFilter('all')
              }}
            >
              Сбросить
            </button>
          )}
        </div>
      )}

      {noMeetings && (
        <div className="card empty-state">
          Сначала добавьте собрания во вкладке «Собрания».
        </div>
      )}

      {!noMeetings && (
        <div className="card list-card">
          {filtered.map((a) => {
            const m = meetingById(a.meetingId)
            return (
              <div key={a.id} className="admin-row">
                <div className="admin-row__main">
                  <div className="admin-row__title">
                    <span style={{ textTransform: 'capitalize' }}>{a.role}</span>
                    {a.scope === 'permanent' ? (
                      <span className="badge badge-success">Постоянно</span>
                    ) : (
                      <span className="badge">
                        Разово{a.date ? ` · ${formatDateHuman(a.date)}` : ''}
                      </span>
                    )}
                  </div>
                  <div className="admin-row__sub">
                    {m ? `${m.startTime} ${m.title}` : 'Собрание удалено'} ·{' '}
                    {[a.assigneeName, a.assigneeTelegram]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </div>
                </div>
                <div className="admin-row__actions">
                  <button
                    className="icon-btn"
                    onClick={() => setEditing(a)}
                    aria-label="Изменить"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => removeAssignment(a.id)}
                    aria-label="Удалить"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="empty-state">
              {filtersActive
                ? 'По выбранным фильтрам ничего не найдено.'
                : 'Назначений пока нет.'}
            </div>
          )}
        </div>
      )}

      {editing && (
        <AssignmentForm
          meetings={meetingsSorted}
          existing={data.assignments}
          editingId={editing === 'new' ? null : editing.id}
          initial={
            editing === 'new'
              ? emptyAssignment(meetingsSorted[0]?.id ?? '')
              : editing
          }
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addAssignment(draft)
            else updateAssignment(editing.id, draft)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function AssignmentForm({
  meetings,
  existing,
  editingId,
  initial,
  onClose,
  onSave,
}: {
  meetings: Meeting[]
  existing: ServiceAssignment[]
  editingId: string | null
  initial: Omit<ServiceAssignment, 'id'>
  onClose: () => void
  onSave: (a: Omit<ServiceAssignment, 'id'>) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Omit<ServiceAssignment, 'id'>>(
    k: K,
    v: ServiceAssignment[K],
  ) => setDraft((d) => ({ ...d, [k]: v }))

  // Конфликт: та же роль того же собрания уже занята —
  // повторно «постоянно» либо разово на ту же дату.
  const conflict = existing.some(
    (a) =>
      a.id !== editingId &&
      a.meetingId === draft.meetingId &&
      a.role === draft.role &&
      (draft.scope === 'permanent'
        ? a.scope === 'permanent'
        : a.scope === 'once' && a.date === draft.date),
  )

  const canSave = !!draft.meetingId && !!draft.assigneeName.trim() && !conflict

  return (
    <Modal
      title="Назначение служащего"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={!canSave}
            onClick={() =>
              onSave(
                draft.scope === 'permanent'
                  ? { ...draft, date: undefined }
                  : draft,
              )
            }
          >
            Сохранить
          </button>
        </>
      }
    >
      <div className="field">
        <label>Собрание</label>
        <select
          className="select"
          value={draft.meetingId}
          onChange={(e) => set('meetingId', e.target.value)}
        >
          {meetings.map((m) => (
            <option key={m.id} value={m.id}>
              {m.startTime} · {m.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Служение</label>
          <select
            className="select"
            value={draft.role}
            onChange={(e) => set('role', e.target.value as ServiceRole)}
          >
            {SERVICE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Тип назначения</label>
          <select
            className="select"
            value={draft.scope}
            onChange={(e) => set('scope', e.target.value as AssignmentScope)}
          >
            <option value="once">Разово (на дату)</option>
            <option value="permanent">На постоянку</option>
          </select>
        </div>
      </div>

      {draft.scope === 'once' && (
        <div className="field">
          <label>Дата</label>
          <input
            className="input"
            type="date"
            value={draft.date ?? todayISO()}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
      )}

      <div className="form-row">
        <div className="field">
          <label>Имя служащего</label>
          <input
            className="input"
            value={draft.assigneeName}
            onChange={(e) => set('assigneeName', e.target.value)}
            placeholder="Например, Иван"
          />
        </div>
        <div className="field">
          <label>Telegram-ник</label>
          <input
            className="input"
            value={draft.assigneeTelegram}
            onChange={(e) => set('assigneeTelegram', e.target.value)}
            placeholder="@ivan"
          />
        </div>
      </div>

      {conflict && (
        <div className="login-error">
          {draft.scope === 'permanent'
            ? 'На эту роль этого собрания уже есть постоянный служащий.'
            : 'На эту роль этого собрания уже есть назначение на эту дату.'}
        </div>
      )}
    </Modal>
  )
}

/* ============================ Новости ============================ */

function emptyNews(): Omit<NewsItem, 'id'> {
  const d = new Date()
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`
  return {
    date: iso,
    title: '',
    excerpt: '',
    body: '',
    imageUrl: '',
    pinned: false,
    important: false,
  }
}

function NewsTab() {
  const { data, addNews, updateNews, removeNews } = useData()
  const [editing, setEditing] = useState<NewsItem | 'new' | null>(null)

  const sorted = [...data.news].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.date.localeCompare(a.date)
  })

  return (
    <div>
      <div className="admin-toolbar">
        <span className="muted">Всего новостей: {data.news.length}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <PlusIcon size={16} /> Добавить новость
        </button>
      </div>

      <div className="card list-card">
        {sorted.map((n) => (
          <div key={n.id} className="admin-row">
            <div className="admin-row__main">
              <div className="admin-row__title">
                {n.important && (
                  <span className="badge badge-danger badge-dot">
                    <ImportantIcon size={12} /> Важно
                  </span>
                )}
                {n.pinned && !n.important && (
                  <span className="badge badge-warning">
                    <PinIcon size={12} /> Закреплено
                  </span>
                )}
                {n.title}
              </div>
              <div className="admin-row__sub">
                {n.date} · {n.excerpt}
              </div>
            </div>
            <div className="admin-row__actions">
              <button className="icon-btn" onClick={() => setEditing(n)} aria-label="Изменить">
                <EditIcon size={18} />
              </button>
              <button
                className="icon-btn"
                onClick={() => removeNews(n.id)}
                aria-label="Удалить"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div className="empty-state">Новостей пока нет.</div>}
      </div>

      {editing && (
        <NewsForm
          initial={editing === 'new' ? emptyNews() : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addNews(draft)
            else updateNews(editing.id, draft)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function NewsForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Omit<NewsItem, 'id'>
  onClose: () => void
  onSave: (n: Omit<NewsItem, 'id'>) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Omit<NewsItem, 'id'>>(k: K, v: NewsItem[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Modal
      title="Новость"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={!draft.title.trim()}
            onClick={() => onSave(draft)}
          >
            Сохранить
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="field">
          <label>Дата публикации</label>
          <input
            className="input"
            type="date"
            value={draft.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
        <div />
      </div>
      <div className="field">
        <label>Заголовок</label>
        <input
          className="input"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Короткое описание</label>
        <textarea
          className="textarea"
          style={{ minHeight: 60 }}
          value={draft.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Полный текст</label>
        <textarea
          className="textarea"
          style={{ minHeight: 130 }}
          value={draft.body}
          onChange={(e) => set('body', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Ссылка на изображение (необязательно)</label>
        <input
          className="input"
          value={draft.imageUrl ?? ''}
          onChange={(e) => set('imageUrl', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={draft.pinned}
          onChange={(e) => set('pinned', e.target.checked)}
        />
        Закрепить вверху раздела
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={draft.important}
          onChange={(e) => set('important', e.target.checked)}
        />
        Отметить как важное объявление
      </label>
    </Modal>
  )
}

/* ============================ Ресурсы ============================ */

function emptyResource(): Omit<Resource, 'id'> {
  return { name: '', description: '', url: '', icon: 'link' }
}

function ResourcesTab() {
  const { data, addResource, updateResource, removeResource } = useData()
  const [editing, setEditing] = useState<Resource | 'new' | null>(null)

  return (
    <div>
      <div className="admin-toolbar">
        <span className="muted">Всего ресурсов: {data.resources.length}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <PlusIcon size={16} /> Добавить ресурс
        </button>
      </div>

      <div className="card list-card">
        {data.resources.map((r) => (
          <div key={r.id} className="admin-row">
            <div className="resource-card__icon" style={{ width: 40, height: 40 }}>
              <ResourceGlyph icon={r.icon} size={20} />
            </div>
            <div className="admin-row__main">
              <div className="admin-row__title">{r.name}</div>
              <div className="admin-row__sub">{r.url}</div>
            </div>
            <div className="admin-row__actions">
              <button className="icon-btn" onClick={() => setEditing(r)} aria-label="Изменить">
                <EditIcon size={18} />
              </button>
              <button
                className="icon-btn"
                onClick={() => removeResource(r.id)}
                aria-label="Удалить"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
        ))}
        {data.resources.length === 0 && (
          <div className="empty-state">Ресурсов пока нет.</div>
        )}
      </div>

      {editing && (
        <ResourceForm
          initial={editing === 'new' ? emptyResource() : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addResource(draft)
            else updateResource(editing.id, draft)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ResourceForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Omit<Resource, 'id'>
  onClose: () => void
  onSave: (r: Omit<Resource, 'id'>) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Omit<Resource, 'id'>>(k: K, v: Resource[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Modal
      title="Ресурс"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={!draft.name.trim()}
            onClick={() => onSave(draft)}
          >
            Сохранить
          </button>
        </>
      }
    >
      <div className="field">
        <label>Название</label>
        <input
          className="input"
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Краткое описание</label>
        <input
          className="input"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Ссылка</label>
        <input
          className="input"
          value={draft.url}
          onChange={(e) => set('url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="field">
        <label>Иконка</label>
        <select
          className="select"
          value={draft.icon}
          onChange={(e) => set('icon', e.target.value as ResourceIcon)}
        >
          {ICONS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
