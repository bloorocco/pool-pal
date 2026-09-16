import type { RangeStatus, Sanitizer } from './types'

export type MetricKey =
  | 'ph'
  | 'sanitizerLevel'
  | 'alkalinity'
  | 'cyanuricAcid'
  | 'temperatureF'

export type MetricRange = {
  key: MetricKey
  label: string
  unit: string
  min: number
  max: number
  step: number
  hint: string
}

/** Typical residential pool targets (APSP / CDC-aligned). Not a lab prescription. */
export function metricRanges(sanitizer: Sanitizer): MetricRange[] {
  return [
    {
      key: 'ph',
      label: 'pH',
      unit: '',
      min: 7.2,
      max: 7.8,
      step: 0.1,
      hint: '7.2–7.8',
    },
    sanitizer === 'bromine'
      ? {
          key: 'sanitizerLevel',
          label: 'Bromine',
          unit: 'ppm',
          min: 3,
          max: 5,
          step: 0.1,
          hint: '3–5 ppm',
        }
      : {
          key: 'sanitizerLevel',
          label: 'Chlorine',
          unit: 'ppm',
          min: 1,
          max: 4,
          step: 0.1,
          hint: '1–4 ppm',
        },
    {
      key: 'alkalinity',
      label: 'Alkalinity',
      unit: 'ppm',
      min: 80,
      max: 120,
      step: 1,
      hint: '80–120 ppm',
    },
    {
      key: 'cyanuricAcid',
      label: 'Cyanuric acid',
      unit: 'ppm',
      min: 30,
      max: 50,
      step: 1,
      hint: '30–50 ppm',
    },
    {
      key: 'temperatureF',
      label: 'Temperature',
      unit: '°F',
      min: 78,
      max: 86,
      step: 0.5,
      hint: '78–86 °F',
    },
  ]
}

export function statusFor(value: number, range: MetricRange): RangeStatus {
  if (value < range.min) return 'low'
  if (value > range.max) return 'high'
  return 'ok'
}

export function statusLabel(status: RangeStatus): string {
  if (status === 'ok') return 'OK'
  if (status === 'low') return 'Low'
  return 'High'
}

export function formatMetric(value: number, range: MetricRange): string {
  const digits = range.step < 1 ? 1 : 0
  const formatted = value.toFixed(digits)
  return range.unit ? `${formatted} ${range.unit}` : formatted
}
