import { describe, expect, it } from 'vitest'
import { parseVil, VilValidationError } from './vil'

const layer = Array.from({ length: 48 }, (_, index) => `KC_${index}`)

describe('parseVil', () => {
  it('loads a version 1 Vial layout and maps it to physical keys', () => {
    const keymap = parseVil(JSON.stringify({ version: 1, vial_protocol: 6, layout: [[layer]] }))

    expect(keymap.keyboardId).toBe('cornix-lp')
    expect(keymap.layers[0].assignments).toHaveLength(48)
    expect(keymap.layers[0].assignments[0]).toEqual({ keyId: 'L00', keycode: 'KC_0' })
    expect(keymap.layers[0].assignments[47]).toEqual({ keyId: 'R35', keycode: 'KC_47' })
  })

  it('maps Cornix Vial matrix rows while excluding its two encoder buttons', () => {
    const matrix = Array.from({ length: 8 }, (_, row) => [
      ...Array.from({ length: 6 }, (_, column) => `KC_${row}_${column}`),
      row === 2 || row === 5 ? `KC_ENCODER_${row}` : -1,
    ])
    const keymap = parseVil(JSON.stringify({ version: 1, vial_protocol: 6, layout: [matrix] }))

    expect(keymap.layers[0].assignments).toHaveLength(48)
    expect(keymap.layers[0].assignments[0]).toEqual({ keyId: 'L00', keycode: 'KC_0_0' })
    expect(keymap.layers[0].assignments[23]).toEqual({ keyId: 'L35', keycode: 'KC_3_5' })
    expect(keymap.layers[0].assignments[24]).toEqual({ keyId: 'R00', keycode: 'KC_4_5' })
    expect(keymap.layers[0].assignments[47]).toEqual({ keyId: 'R35', keycode: 'KC_7_0' })
  })

  it.each([
    ['broken JSON', '{'],
    ['unsupported version', JSON.stringify({ version: 2, vial_protocol: 6, layout: [layer] })],
    ['wrong key count', JSON.stringify({ version: 1, vial_protocol: 6, layout: [['KC_A']] })],
  ])('rejects %s', (_case, source) => {
    expect(() => parseVil(source)).toThrow(VilValidationError)
  })
})
