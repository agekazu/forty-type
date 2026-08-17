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
        expect.objectContaining({ id: 'L35', matrix: { row: 3, column: 5 } }),
        expect.objectContaining({ id: 'R00', matrix: { row: 0, column: 0 } }),
        expect.objectContaining({ id: 'R35', matrix: { row: 3, column: 5 } }),
      ]),
    )
  })

  it('places the right half as a reflection of the left, not a copy', () => {
    const left = cornixLpLayout.keys.filter((item) => item.hand === 'left')
    const right = cornixLpLayout.keys.filter((item) => item.hand === 'right')
    const axis = 7.45

    for (const leftKey of left) {
      const rightKey = right.find((item) => (
        item.matrix.row === leftKey.matrix.row
        && item.matrix.column === 5 - leftKey.matrix.column
      ))

      expect(rightKey, `missing mirror of ${leftKey.id}`).toBeDefined()
      expect(rightKey!.position.y).toBeCloseTo(leftKey.position.y)
      expect((leftKey.position.x + rightKey!.position.x) / 2 + 0.45).toBeCloseTo(axis)
    }

    const leftInner = left.find((item) => item.id === 'L05')!
    const rightInner = right.find((item) => item.id === 'R00')!
    const leftOuter = left.find((item) => item.id === 'L00')!
    expect(leftInner.position.y).toBeGreaterThan(leftOuter.position.y)
    expect(rightInner.position.y).toBeCloseTo(leftInner.position.y)
    expect(rightInner.position.y).toBeGreaterThan(right.find((item) => item.id === 'R05')!.position.y)
  })
})
