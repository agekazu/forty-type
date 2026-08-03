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
    [0, 1, 2, 3, 4, 5].map((column) =>
      key(hand, row, column, offsetX + column, row + column * 0.08),
    ),
  ),
  key(hand, 3, 0, offsetX, 3.15),
  key(hand, 3, 1, offsetX + 1, 3.23),
  key(hand, 3, 2, offsetX + 2, 3.31),
  key(hand, 3, 3, offsetX + 3, 3.47),
  key(hand, 3, 4, offsetX + 4, 3.75),
  key(hand, 3, 5, offsetX + 5, 4.03),
]

/**
 * Cornix LP's 48-key layout: a 3×6 columnar grid and a 6-key lower cluster
 * on each half. The two encoder buttons in Vial's matrix are not keyboard keys.
 * Coordinates use one key unit, and are only for rendering.
 */
export const cornixLpLayout: KeyboardLayout = {
  id: 'cornix-lp',
  name: 'Cornix LP',
  keys: [...createHalf('left', 0), ...createHalf('right', 9)],
}
