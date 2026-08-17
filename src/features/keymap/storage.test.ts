import { describe, expect, it } from 'vitest'
import { loadStoredVil, saveVil, VIL_STORAGE_KEY } from './storage'

const validSource = JSON.stringify({
  version: 1,
  vial_protocol: 6,
  layout: [Array.from({ length: 48 }, () => 'KC_A')],
})

describe('keymap storage', () => {
  it('saves a Vial file and restores it as a keymap', () => {
    saveVil('cornix.vil', validSource)

    const stored = loadStoredVil()
    expect(stored?.fileName).toBe('cornix.vil')
    expect(stored?.keymap.layers).toHaveLength(1)
    expect(stored?.keymap.layers[0].assignments).toHaveLength(48)
  })

  it('returns nothing and clears invalid stored data', () => {
    localStorage.setItem(VIL_STORAGE_KEY, '{"fileName":"broken.vil","source":"{"}')
    expect(loadStoredVil()).toBeUndefined()
    expect(localStorage.getItem(VIL_STORAGE_KEY)).toBeNull()
  })
})
