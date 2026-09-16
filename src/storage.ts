import { emptyState, type PoolState } from './types'

export const STORAGE_KEY = 'pool-pal.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSanitizer(value: unknown): value is PoolState['sanitizer'] {
  return value === 'chlorine' || value === 'bromine'
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function parseReadings(value: unknown): PoolState['readings'] {
  if (!Array.isArray(value)) return []
  const readings: PoolState['readings'] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const id = asString(item.id)
    const recordedAt = asString(item.recordedAt)
    const ph = asNumber(item.ph)
    const sanitizerLevel = asNumber(item.sanitizerLevel)
    const alkalinity = asNumber(item.alkalinity)
    const cyanuricAcid = asNumber(item.cyanuricAcid)
    const temperatureF = asNumber(item.temperatureF)
    if (
      !id ||
      !recordedAt ||
      ph === null ||
      sanitizerLevel === null ||
      alkalinity === null ||
      cyanuricAcid === null ||
      temperatureF === null
    ) {
      continue
    }
    readings.push({
      id,
      recordedAt,
      ph,
      sanitizerLevel,
      alkalinity,
      cyanuricAcid,
      temperatureF,
    })
  }
  return readings
}

function parseTasks(value: unknown): PoolState['tasks'] {
  if (!Array.isArray(value)) return []
  const tasks: PoolState['tasks'] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const id = asString(item.id)
    const title = asString(item.title)
    const dueOn = asString(item.dueOn)
    const createdAt = asString(item.createdAt)
    const completedAt =
      item.completedAt === null || item.completedAt === undefined
        ? null
        : asString(item.completedAt)
    if (!id || !title || !dueOn || !createdAt) continue
    tasks.push({ id, title, dueOn, createdAt, completedAt })
  }
  return tasks
}

function parseNotes(value: unknown): PoolState['notes'] {
  if (!Array.isArray(value)) return []
  const notes: PoolState['notes'] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const id = asString(item.id)
    const body = asString(item.body)
    const createdAt = asString(item.createdAt)
    if (!id || !body || !createdAt) continue
    notes.push({ id, body, createdAt })
  }
  return notes
}

export function loadState(): PoolState {
  if (typeof localStorage === 'undefined') return emptyState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return emptyState
    return {
      sanitizer: isSanitizer(parsed.sanitizer) ? parsed.sanitizer : 'chlorine',
      readings: parseReadings(parsed.readings),
      tasks: parseTasks(parsed.tasks),
      notes: parseNotes(parsed.notes),
    }
  } catch {
    return emptyState
  }
}

export function saveState(state: PoolState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
