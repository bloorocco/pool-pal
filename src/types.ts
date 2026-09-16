export type Sanitizer = 'chlorine' | 'bromine'

export type TabId = 'water' | 'tasks' | 'notes'

export type RangeStatus = 'ok' | 'low' | 'high'

export type Reading = {
  id: string
  recordedAt: string
  ph: number
  sanitizerLevel: number
  alkalinity: number
  cyanuricAcid: number
  temperatureF: number
}

export type Task = {
  id: string
  title: string
  dueOn: string
  completedAt: string | null
  createdAt: string
}

export type Note = {
  id: string
  body: string
  createdAt: string
}

export type PoolState = {
  sanitizer: Sanitizer
  readings: Reading[]
  tasks: Task[]
  notes: Note[]
}

export const emptyState: PoolState = {
  sanitizer: 'chlorine',
  readings: [],
  tasks: [],
  notes: [],
}
