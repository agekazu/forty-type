import type { KeyAssignment, Keymap } from './types'

export interface KeyStroke {
  character: string
  keyId: string
  layer: number
  modifierKeyIds: readonly string[]
  layerKeyIds: readonly string[]
}

export type ResolveResult =
  | { supported: true; stroke: KeyStroke }
  | { supported: false; character: string; reason: string }

const UNSHIFTED: Record<string, string> = {
  ' ': 'KC_SPACE',
  '-': 'KC_MINUS',
  '=': 'KC_EQUAL',
  '[': 'KC_LBRACKET',
  ']': 'KC_RBRACKET',
  '\\': 'KC_BSLASH',
  ';': 'KC_SCOLON',
  "'": 'KC_QUOTE',
  '`': 'KC_GRAVE',
  ',': 'KC_COMMA',
  '.': 'KC_DOT',
  '/': 'KC_SLASH',
}

const SHIFTED: Record<string, string> = {
  '!': 'KC_1',
  '@': 'KC_2',
  '#': 'KC_3',
  $: 'KC_4',
  '%': 'KC_5',
  '^': 'KC_6',
  '&': 'KC_7',
  '*': 'KC_8',
  '(': 'KC_9',
  ')': 'KC_0',
  _: 'KC_MINUS',
  '+': 'KC_EQUAL',
  '{': 'KC_LBRACKET',
  '}': 'KC_RBRACKET',
  '|': 'KC_BSLASH',
  ':': 'KC_SCOLON',
  '"': 'KC_QUOTE',
  '~': 'KC_GRAVE',
  '<': 'KC_COMMA',
  '>': 'KC_DOT',
  '?': 'KC_SLASH',
}

const DIRECT: Record<string, string> = {
  KC_EXLM: '!', KC_AT: '@', KC_HASH: '#', KC_DLR: '$', KC_PERC: '%', KC_CIRC: '^',
  KC_AMPR: '&', KC_ASTR: '*', KC_LPRN: '(', KC_RPRN: ')', KC_UNDS: '_', KC_PLUS: '+',
  KC_LCBR: '{', KC_RCBR: '}', KC_PIPE: '|', KC_COLN: ':', KC_DQUO: '"', KC_TILD: '~',
  KC_LABK: '<', KC_RABK: '>', KC_QUES: '?',
}

const characterSpec = (character: string): { keycode: string; shift: boolean } | undefined => {
  if (/^[a-z]$/.test(character)) return { keycode: `KC_${character.toUpperCase()}`, shift: false }
  if (/^[A-Z]$/.test(character)) return { keycode: `KC_${character}`, shift: true }
  if (/^[0-9]$/.test(character)) return { keycode: `KC_${character}`, shift: false }
  if (UNSHIFTED[character]) return { keycode: UNSHIFTED[character], shift: false }
  if (SHIFTED[character]) return { keycode: SHIFTED[character], shift: true }
}

const outputOf = (keycode: string): { keycode: string; shifted: boolean } => {
  const shifted = keycode.match(/^(?:LSFT|RSFT|S)\((.+)\)$/)
  if (shifted) return { keycode: shifted[1], shifted: true }
  const direct = DIRECT[keycode]
  if (direct) return { keycode: characterSpec(direct)?.keycode ?? keycode, shifted: true }
  return { keycode, shifted: false }
}

const findAssignment = (keymap: Keymap, predicate: (keycode: string) => boolean) =>
  keymap.layers.flatMap((layer) =>
    layer.assignments.map((assignment) => ({ layer: layer.index, assignment })),
  ).find(({ assignment }) => predicate(assignment.keycode))

const baseAssignments = (keymap: Keymap): readonly KeyAssignment[] =>
  keymap.layers.find((layer) => layer.index === 0)?.assignments ?? []

const layerKeyIds = (keymap: Keymap, layer: number): string[] => {
  if (layer === 0) return []
  const pattern = new RegExp(`^(?:MO|TG|TO|TT)\\(${layer}\\)$|^LT\\(${layer},`)
  return baseAssignments(keymap)
    .filter(({ keycode }) => pattern.test(keycode))
    .map(({ keyId }) => keyId)
    .slice(0, 1)
}

export const resolveCharacter = (keymap: Keymap, character: string): ResolveResult => {
  const spec = characterSpec(character)
  if (!spec) return { supported: false, character, reason: 'ASCII英数字・記号以外は未対応です。' }

  const target = findAssignment(keymap, (keycode) => {
    const output = outputOf(keycode)
    return output.keycode === spec.keycode && output.shifted === spec.shift
  }) ?? (spec.shift
    ? findAssignment(keymap, (keycode) => {
        const output = outputOf(keycode)
        return output.keycode === spec.keycode && !output.shifted
      })
    : undefined)

  if (!target) return { supported: false, character, reason: `「${character}」を出力するキーがありません。` }

  const encodedShift = outputOf(target.assignment.keycode).shifted
  const modifierKeyIds = spec.shift && !encodedShift
    ? baseAssignments(keymap)
        .filter(({ keycode }) => keycode === 'KC_LSHIFT' || keycode === 'KC_RSHIFT')
        .map(({ keyId }) => keyId)
        .slice(0, 1)
    : []
  if (spec.shift && !encodedShift && modifierKeyIds.length === 0) {
    return { supported: false, character, reason: 'Shiftキーがキーマップにありません。' }
  }

  const layers = layerKeyIds(keymap, target.layer)
  if (target.layer > 0 && layers.length === 0) {
    return { supported: false, character, reason: `レイヤー${target.layer}へ移動するキーがありません。` }
  }

  return {
    supported: true,
    stroke: {
      character,
      keyId: target.assignment.keyId,
      layer: target.layer,
      modifierKeyIds,
      layerKeyIds: layers,
    },
  }
}
