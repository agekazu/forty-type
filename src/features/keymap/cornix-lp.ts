import type { KeyboardLayout, PhysicalKey } from './types'

const key = (
  hand: PhysicalKey['hand'],
  row: number,
  column: number,
  x: number,
  y: number,
): PhysicalKey => ({
  id: `${hand[0].toUpperCase()}${row}${column}`,
  hand,
  matrix: { row, column },
  position: { x, y },
})

const createHalf = (hand: PhysicalKey['hand'], offsetX: number): PhysicalKey[] => [
  ...[0, 1, 2].flatMap((row) =>
    [0, 1, 2, 3, 4, 5, 6].map((column) =>
      key(hand, row, column, offsetX + column, row + column * 0.08),
    ),
  ),
  key(hand, 3, 0, offsetX + 2.5, 3.45),
  key(hand, 3, 1, offsetX + 3.5, 3.75),
  key(hand, 3, 2, offsetX + 4.5, 4.05),
]

/**
 * Cornix LP's 48-key layout: a 3×7 columnar grid and a 3-key thumb cluster
 * on each half. Coordinates use one key unit, and are only for rendering.
 */
export const cornixLpLayout: KeyboardLayout = {
  id: 'cornix-lp',
  name: 'Cornix LP',
  keys: [...createHalf('left', 0), ...createHalf('right', 9)],
}
