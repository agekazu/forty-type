import { cornixLpLayout } from './cornix-lp'
import type { Keymap, KeymapLayer } from './types'

export class VilValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VilValidationError'
  }
}

interface VilDocument {
  version: number
  vial_protocol: number
  layout: unknown[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const collectKeycodes = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (value === -1) return []
  if (!Array.isArray(value)) {
    throw new VilValidationError('layoutに不正なキーコードが含まれています。')
  }
  return value.flatMap(collectKeycodes)
}

const validateDocument = (value: unknown): VilDocument => {
  if (!isRecord(value)) {
    throw new VilValidationError('VialファイルはJSONオブジェクトである必要があります。')
  }
  if (value.version !== 1) {
    throw new VilValidationError(`未対応のVialファイルバージョンです（対応: 1）。`)
  }
  if (!Number.isInteger(value.vial_protocol) || Number(value.vial_protocol) < 1) {
    throw new VilValidationError('vial_protocolが見つからないか不正です。')
  }
  if (!Array.isArray(value.layout) || value.layout.length === 0) {
    throw new VilValidationError('キーマップのレイヤーが見つかりません。')
  }
  return value as unknown as VilDocument
}

/** Parse a Vial backup entirely in memory; callers decide how file bytes are obtained. */
export const parseVil = (source: string): Keymap => {
  let decoded: unknown
  try {
    decoded = JSON.parse(source)
  } catch {
    throw new VilValidationError('JSONとして読み込めませんでした。')
  }

  const document = validateDocument(decoded)
  const layers: KeymapLayer[] = document.layout.map((layer, index) => {
    const keycodes = collectKeycodes(layer)
    if (keycodes.length !== cornixLpLayout.keys.length) {
      throw new VilValidationError(
        `レイヤー${index}のキー数がCornix LPと一致しません（${keycodes.length}/48）。`,
      )
    }
    return {
      index,
      assignments: keycodes.map((keycode, keyIndex) => ({
        keyId: cornixLpLayout.keys[keyIndex].id,
        keycode,
      })),
    }
  })

  return { keyboardId: 'cornix-lp', layers }
}
