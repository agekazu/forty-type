import { describe, expect, it } from 'vitest'
import { cornixLpLayout } from './cornix-lp'

describe('cornixLpLayout', () => {
  it('defines all 48 physical keys in the Cornix LP layout', () => {
    expect(cornixLpLayout.id).toBe('cornix-lp')
    expect(cornixLpLayout.keys).toHaveLength(48)
    expect(cornixLpLayout.keys.filter((key) => key.hand === 'left')).toHaveLength(24)
    expect(cornixLpLayout.keys.filter((key) => key.hand === 'right')).toHaveLength(24)
  })

  it('gives every key a unique id and physical position', () => {
    const ids = cornixLpLayout.keys.map((key) => key.id)

    expect(new Set(ids)).toHaveLength(cornixLpLayout.keys.length)
    expect(cornixLpLayout.keys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'L00', matrix: { row: 0, column: 0 } }),
        expect.objectContaining({ id: 'L32', matrix: { row: 3, column: 2 } }),
        expect.objectContaining({ id: 'R00', matrix: { row: 0, column: 0 } }),
        expect.objectContaining({ id: 'R32', matrix: { row: 3, column: 2 } }),
      ]),
    )
  })
})
