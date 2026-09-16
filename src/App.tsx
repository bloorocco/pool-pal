import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  formatMetric,
  metricRanges,
  statusFor,
  statusLabel,
} from './chemistry'
import {
  daysFromToday,
  dueLabel,
  formatDate,
  formatDateTime,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  todayIsoDate,
  normalizeIsoDate,
} from './dates'
import type { Reading, Sanitizer, TabId, Task } from './types'
import { usePoolStore } from './usePoolStore'

const TABS: { id: TabId; label: string }[] = [
  { id: 'water', label: 'Water' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
]

const QUICK_TASKS = [
  'Test water chemistry',
  'Empty skimmer baskets',
  'Brush walls and steps',
  'Backwash / clean filter',
  'Shock the pool',
]

function Wave() {
  return (
    <svg className="wave" viewBox="0 0 720 180" aria-hidden="true">
      <path
        fill="#b7e4ea"
        d="M0 90c60 28 120 28 180 0s120-28 180 0 120 28 180 0 120-28 180 0v90H0z"
      />
      <path
        fill="#d9f2f4"
        d="M0 118c60 22 120 22 180 0s120-22 180 0 120 22 180 0 120-22 180 0v62H0z"
      />
    </svg>
  )
}

function StatusBadge({ status }: { status: ReturnType<typeof statusFor> }) {
  return <span className={`badge ${status}`}>{statusLabel(status)}</span>
}

function WaterTab({
  sanitizer,
  readings,
  onAdd,
  onDelete,
}: {
  sanitizer: Sanitizer
  readings: Reading[]
  onAdd: (reading: Omit<Reading, 'id'>) => void
  onDelete: (id: string) => void
}) {
  const ranges = metricRanges(sanitizer)
  const latest = readings[0]
  const [recordedAt, setRecordedAt] = useState(() => toDatetimeLocalValue(new Date()))
  const [ph, setPh] = useState('7.4')
  const [sanitizerLevel, setSanitizerLevel] = useState(sanitizer === 'bromine' ? '4' : '2')
  const [alkalinity, setAlkalinity] = useState('100')
  const [cyanuricAcid, setCyanuricAcid] = useState('40')
  const [temperatureF, setTemperatureF] = useState('82')

  useEffect(() => {
    setSanitizerLevel(sanitizer === 'bromine' ? '4' : '2')
  }, [sanitizer])

  function submit(event: FormEvent) {
    event.preventDefault()
    onAdd({
      recordedAt: fromDatetimeLocalValue(recordedAt),
      ph: Number(ph),
      sanitizerLevel: Number(sanitizerLevel),
      alkalinity: Number(alkalinity),
      cyanuricAcid: Number(cyanuricAcid),
      temperatureF: Number(temperatureF),
    })
    setRecordedAt(toDatetimeLocalValue(new Date()))
  }

  return (
    <section>
      <article className="card">
        <div className="card-head">
          <div>
            <h2>Latest water</h2>
            <p className="quiet">
              {latest
                ? `Logged ${formatDateTime(latest.recordedAt)}`
                : 'No readings yet. Log your first test below.'}
            </p>
          </div>
        </div>
        {latest ? (
          <div className="metrics">
            {ranges.map((range) => {
              const value = latest[range.key]
              const status = statusFor(value, range)
              return (
                <div className="metric" key={range.key}>
                  <div className="label">
                    <span>{range.label}</span>
                    <StatusBadge status={status} />
                  </div>
                  <strong>{formatMetric(value, range)}</strong>
                  <div className="hint">Typical {range.hint}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty">
            <h3>Your pool is waiting</h3>
            <p>Keep a quiet log of pH, sanitizer, alkalinity, CYA, and temperature.</p>
          </div>
        )}
      </article>

      <article className="card">
        <div className="card-head">
          <div>
            <h2>Log a reading</h2>
            <p className="quiet">Date and time are saved with each test.</p>
          </div>
        </div>
        <form className="form" onSubmit={submit}>
          <div className="fields">
            <label className="span-2">
              Date & time
              <input
                type="datetime-local"
                value={recordedAt}
                onChange={(event) => setRecordedAt(event.target.value)}
                required
              />
            </label>
            {ranges.map((range) => {
              const value =
                range.key === 'ph'
                  ? ph
                  : range.key === 'sanitizerLevel'
                    ? sanitizerLevel
                    : range.key === 'alkalinity'
                      ? alkalinity
                      : range.key === 'cyanuricAcid'
                        ? cyanuricAcid
                        : temperatureF
              const setValue =
                range.key === 'ph'
                  ? setPh
                  : range.key === 'sanitizerLevel'
                    ? setSanitizerLevel
                    : range.key === 'alkalinity'
                      ? setAlkalinity
                      : range.key === 'cyanuricAcid'
                        ? setCyanuricAcid
                        : setTemperatureF
              return (
                <label key={range.key}>
                  {range.label} {range.unit ? `(${range.unit})` : ''} · {range.hint}
                  <input
                    type="number"
                    inputMode="decimal"
                    step={range.step}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    required
                  />
                </label>
              )
            })}
          </div>
          <div className="actions">
            <button className="primary" type="submit">
              Save reading
            </button>
          </div>
        </form>
        <p className="footnote">
          Status uses typical residential ranges. Always follow your test kit and local
          health guidance.
        </p>
      </article>

      <article className="card">
        <div className="card-head">
          <h2>History</h2>
        </div>
        {readings.length === 0 ? (
          <p className="quiet">Past tests will appear here, newest first.</p>
        ) : (
          <div className="list">
            {readings.map((reading) => (
              <div className="row" key={reading.id}>
                <div>
                  <h3>{formatDateTime(reading.recordedAt)}</h3>
                  <p className="quiet">
                    {ranges
                      .map((range) => {
                        const value = reading[range.key]
                        return `${range.label} ${formatMetric(value, range)} (${statusLabel(statusFor(value, range))})`
                      })
                      .join(' · ')}
                  </p>
                </div>
                <button
                  className="danger"
                  type="button"
                  onClick={() => onDelete(reading.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}

function TasksTab({
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  tasks: Task[]
  onAdd: (title: string, dueOn: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [dueOn, setDueOn] = useState(todayIsoDate)
  const open = tasks
    .filter((task) => !task.completedAt)
    .slice()
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn))
  const done = tasks.filter((task) => task.completedAt)

  function submit(event: FormEvent) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return
    onAdd(nextTitle, normalizeIsoDate(dueOn))
    setTitle('')
    setDueOn(todayIsoDate())
  }

  return (
    <section>
      <article className="card">
        <div className="card-head">
          <div>
            <h2>Maintenance</h2>
            <p className="quiet">Due dates stay on this device. Check them off as you go.</p>
          </div>
        </div>
        <div className="chips">
          {QUICK_TASKS.map((task) => (
            <button
              key={task}
              className="chip"
              type="button"
              onClick={() => onAdd(task, todayIsoDate())}
            >
              {task}
            </button>
          ))}
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <div className="fields">
            <label className="span-2">
              Task
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Vacuum the floor"
              />
            </label>
            <label>
              Due date
              <input
                type="date"
                value={dueOn}
                onChange={(event) => {
                  const next = event.target.value
                  setDueOn(next ? normalizeIsoDate(next) : todayIsoDate())
                }}
              />
            </label>
          </div>
          <div className="actions">
            <button className="primary" type="submit">
              Add task
            </button>
          </div>
        </form>
      </article>

      <article className="card">
        <h2>Open</h2>
        {open.length === 0 ? (
          <div className="empty">
            <h3>All clear</h3>
            <p>No open maintenance items. Add one when something comes due.</p>
          </div>
        ) : (
          <div className="list">
            {open.map((task) => {
              const overdue = daysFromToday(task.dueOn) < 0
              return (
                <div className={`row task${overdue ? ' overdue' : ''}`} key={task.id}>
                  <input
                    className="check"
                    type="checkbox"
                    checked={false}
                    onChange={() => onToggle(task.id)}
                    aria-label={`Complete ${task.title}`}
                  />
                  <div style={{ flex: 1 }}>
                    <h3>{task.title}</h3>
                    <p className="quiet">
                      {formatDate(task.dueOn)} · {dueLabel(task.dueOn)}
                    </p>
                  </div>
                  <button className="danger" type="button" onClick={() => onDelete(task.id)}>
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </article>

      {done.length > 0 ? (
        <article className="card">
          <h2>Completed</h2>
          <div className="list">
            {done.map((task) => (
              <div className="row task done" key={task.id}>
                <input
                  className="check"
                  type="checkbox"
                  checked
                  onChange={() => onToggle(task.id)}
                  aria-label={`Reopen ${task.title}`}
                />
                <div style={{ flex: 1 }}>
                  <h3>{task.title}</h3>
                  <p className="quiet">
                    Finished {task.completedAt ? formatDateTime(task.completedAt) : ''}
                  </p>
                </div>
                <button className="danger" type="button" onClick={() => onDelete(task.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  )
}

function NotesTab({
  notes,
  onAdd,
  onDelete,
}: {
  notes: { id: string; body: string; createdAt: string }[]
  onAdd: (body: string) => void
  onDelete: (id: string) => void
}) {
  const [body, setBody] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    onAdd(body)
    setBody('')
  }

  return (
    <section>
      <article className="card">
        <div className="card-head">
          <div>
            <h2>Pool notes</h2>
            <p className="quiet">Free-form reminders, equipment quirks, or what the water looked like.</p>
          </div>
        </div>
        <form className="form" onSubmit={submit}>
          <label>
            New note
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Cloudy after yesterday’s rain. Running filter overnight."
              required
            />
          </label>
          <div className="actions">
            <button className="primary" type="submit">
              Save note
            </button>
          </div>
        </form>
      </article>

      <article className="card">
        <h2>Journal</h2>
        {notes.length === 0 ? (
          <div className="empty">
            <h3>Nothing written yet</h3>
            <p>Notes stay in this browser so you can keep a simple backyard log.</p>
          </div>
        ) : (
          <div className="list">
            {notes.map((note) => (
              <div className="row" key={note.id}>
                <div style={{ flex: 1 }}>
                  <p className="quiet">{formatDateTime(note.createdAt)}</p>
                  <p className="note-body">{note.body}</p>
                </div>
                <button className="danger" type="button" onClick={() => onDelete(note.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}

export default function App() {
  const store = usePoolStore()
  const [tab, setTab] = useState<TabId>('water')
  const openCount = useMemo(
    () => store.state.tasks.filter((task) => !task.completedAt).length,
    [store.state.tasks],
  )

  return (
    <div className="app">
      <div className="shell">
        <Wave />
        <header className="header">
          <div className="brand">
            <div className="mark" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M6 20c3-2 6-2 9 0s6 2 9 0"
                  stroke="#7ee0ea"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M6 14c3-2 6-2 9 0s6 2 9 0"
                  stroke="#e8f7f8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx="23" cy="9" r="2.2" fill="#f6e7c1" />
              </svg>
            </div>
            <div>
              <p className="eyebrow">Home pool care</p>
              <h1>Pool Pal</h1>
              <p className="lede">
                Chemistry, chores, and notes — kept calm, local, and easy to check from the
                patio.
              </p>
            </div>
          </div>
          <div className="sanitizer" role="group" aria-label="Sanitizer type">
            <button
              type="button"
              aria-pressed={store.state.sanitizer === 'chlorine'}
              onClick={() => store.setSanitizer('chlorine')}
            >
              Chlorine
            </button>
            <button
              type="button"
              aria-pressed={store.state.sanitizer === 'bromine'}
              onClick={() => store.setSanitizer('bromine')}
            >
              Bromine
            </button>
          </div>
        </header>

        <nav className="tabs" aria-label="Sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === 'tasks' && openCount > 0 ? ` (${openCount})` : ''}
            </button>
          ))}
        </nav>

        {tab === 'water' ? (
          <WaterTab
            sanitizer={store.state.sanitizer}
            readings={store.state.readings}
            onAdd={store.addReading}
            onDelete={store.deleteReading}
          />
        ) : null}
        {tab === 'tasks' ? (
          <TasksTab
            tasks={store.state.tasks}
            onAdd={store.addTask}
            onToggle={store.toggleTask}
            onDelete={store.deleteTask}
          />
        ) : null}
        {tab === 'notes' ? (
          <NotesTab
            notes={store.state.notes}
            onAdd={store.addNote}
            onDelete={store.deleteNote}
          />
        ) : null}

        <nav className="mobile-nav" aria-label="Mobile sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
