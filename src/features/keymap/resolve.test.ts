import { describe, expect, it } from 'vitest'
import type { Keymap } from './types'
import { resolveCharacter } from './resolve'

const keymap = (entries: string[][]): Keymap => ({
  keyboardId: 'cornix-lp',
  layers: entries.map((keycodes, index) => ({
    index,
    assignments: keycodes.map((keycode, keyIndex) => ({ keyId: `K${keyIndex}`, keycode })),
  })),
})

describe('resolveCharacter', () => {
  it('resolves a base-layer letter', () => {
    expect(resolveCharacter(keymap([['KC_A']]), 'a')).toEqual({
      supported: true,
      stroke: { character: 'a', keyId: 'K0', layer: 0, modifierKeyIds: [], layerKeyIds: [] },
    })
  })

  it('includes Shift for uppercase and shifted symbols', () => {
    const map = keymap([['KC_A', 'KC_1', 'KC_LSHIFT']])

    expect(resolveCharacter(map, 'A')).toMatchObject({
      supported: true,
      stroke: { keyId: 'K0', modifierKeyIds: ['K2'] },
    })
    expect(resolveCharacter(map, '!')).toMatchObject({
      supported: true,
      stroke: { keyId: 'K1', modifierKeyIds: ['K2'] },
    })
  })

  it('includes the base-layer momentary key for a symbol on another layer', () => {
    const map = keymap([['MO(1)', 'KC_LSHIFT'], ['KC_SLASH', 'KC_TRNS']])

    expect(resolveCharacter(map, '?')).toEqual({
      supported: true,
      stroke: { character: '?', keyId: 'K0', layer: 1, modifierKeyIds: ['K1'], layerKeyIds: ['K0'] },
    })
  })

  it('does not require a physical Shift for an encoded shifted keycode', () => {
    expect(resolveCharacter(keymap([['LSFT(KC_1)']]), '!')).toMatchObject({
      supported: true,
      stroke: { modifierKeyIds: [] },
    })
  })

  it('explains unsupported characters', () => {
    expect(resolveCharacter(keymap([['KC_A']]), 'あ')).toEqual({
      supported: false,
      character: 'あ',
      reason: 'ASCII英数字・記号以外は未対応です。',
    })
    expect(resolveCharacter(keymap([['KC_A']]), 'z')).toMatchObject({ supported: false })
  })
})
