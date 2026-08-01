import { describe, expect, it } from 'vitest'
import { parseVil, VilValidationError } from './vil'

const layer = Array.from({ length: 48 }, (_, index) => `KC_${index}`)

describe('parseVil', () => {
  it('loads a version 1 Vial layout and maps it to physical keys', () => {
    const keymap = parseVil(JSON.stringify({ version: 1, vial_protocol: 6, layout: [[layer]] }))

    expect(keymap.keyboardId).toBe('cornix-lp')
    expect(keymap.layers[0].assignments).toHaveLength(48)
    expect(keymap.layers[0].assignments[0]).toEqual({ keyId: 'L00', keycode: 'KC_0' })
    expect(keymap.layers[0].assignments[47]).toEqual({ keyId: 'R32', keycode: 'KC_47' })
  })

  it('ignores Vial matrix placeholders', () => {
    const keymap = parseVil(
      JSON.stringify({ version: 1, vial_protocol: 6, layout: [[layer.slice(0, 24), -1, layer.slice(24)]] }),
    )

    expect(keymap.layers[0].assignments).toHaveLength(48)
  })

  it.each([
    ['broken JSON', '{'],
    ['unsupported version', JSON.stringify({ version: 2, vial_protocol: 6, layout: [layer] })],
    ['wrong key count', JSON.stringify({ version: 1, vial_protocol: 6, layout: [['KC_A']] })],
  ])('rejects %s', (_case, source) => {
    expect(() => parseVil(source)).toThrow(VilValidationError)
  })
})
