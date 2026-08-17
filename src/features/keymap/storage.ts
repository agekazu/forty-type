import { parseVil } from './vil'
import type { Keymap } from './types'

export const VIL_STORAGE_KEY = 'forty-type.vil'

interface StoredVil {
  fileName: string
  source: string
}

const isStoredVil = (value: unknown): value is StoredVil =>
  typeof value === 'object'
  && value !== null
  && typeof (value as StoredVil).fileName === 'string'
  && typeof (value as StoredVil).source === 'string'

export const saveVil = (fileName: string, source: string): void => {
  try {
    localStorage.setItem(VIL_STORAGE_KEY, JSON.stringify({ fileName, source } satisfies StoredVil))
  } catch {
    // Quota, private mode, or disabled storage should not block importing.
  }
}

export const loadStoredVil = (): { fileName: string; keymap: Keymap } | undefined => {
  try {
    const raw = localStorage.getItem(VIL_STORAGE_KEY)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    if (!isStoredVil(parsed)) {
      localStorage.removeItem(VIL_STORAGE_KEY)
      return undefined
    }
    return { fileName: parsed.fileName, keymap: parseVil(parsed.source) }
  } catch {
    try {
      localStorage.removeItem(VIL_STORAGE_KEY)
    } catch {
      // Ignore cleanup failures in the same environments that cannot persist.
    }
    return undefined
  }
}
