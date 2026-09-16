import { useCallback, useEffect, useState } from 'react'
import { createId } from './dates'
import { loadState, saveState } from './storage'
import type { PoolState, Reading, Sanitizer } from './types'

export function usePoolStore() {
  const [state, setState] = useState<PoolState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const setSanitizer = useCallback((sanitizer: Sanitizer) => {
    setState((current) => ({ ...current, sanitizer }))
  }, [])

  const addReading = useCallback((reading: Omit<Reading, 'id'>) => {
    setState((current) => ({
      ...current,
      readings: [{ ...reading, id: createId() }, ...current.readings],
    }))
  }, [])

  const deleteReading = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      readings: current.readings.filter((reading) => reading.id !== id),
    }))
  }, [])

  const addTask = useCallback((title: string, dueOn: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setState((current) => ({
      ...current,
      tasks: [
        {
          id: createId(),
          title: trimmed,
          dueOn,
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
        ...current.tasks,
      ],
    }))
  }, [])

  const toggleTask = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== id) return task
        return {
          ...task,
          completedAt: task.completedAt ? null : new Date().toISOString(),
        }
      }),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }))
  }, [])

  const addNote = useCallback((body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return
    setState((current) => ({
      ...current,
      notes: [
        {
          id: createId(),
          body: trimmed,
          createdAt: new Date().toISOString(),
        },
        ...current.notes,
      ],
    }))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== id),
    }))
  }, [])

  return {
    state,
    setSanitizer,
    addReading,
    deleteReading,
    addTask,
    toggleTask,
    deleteTask,
    addNote,
    deleteNote,
  }
}
