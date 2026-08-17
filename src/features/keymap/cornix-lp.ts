import type { KeyboardLayout, PhysicalKey } from './types'

const THUMB_STAGGER = [3.15, 3.23, 3.31, 3.47, 3.75, 4.03] as const
const COLUMN_COUNT = 6

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

const createHalf = (hand: PhysicalKey['hand'], offsetX: number): PhysicalKey[] => {
  const reflect = hand === 'right'
  const visualColumn = (column: number) => (reflect ? COLUMN_COUNT - 1 - column : column)

  return [
    ...[0, 1, 2].flatMap((row) =>
      [0, 1, 2, 3, 4, 5].map((column) =>
        key(hand, row, column, offsetX + column, row + visualColumn(column) * 0.08),
      ),
    ),
    ...[0, 1, 2, 3, 4, 5].map((column) =>
      key(hand, 3, column, offsetX + column, THUMB_STAGGER[visualColumn(column)]),
    ),
  ]
}

/**
 * Cornix LP's 48-key layout: a 3×6 columnar grid and a 6-key lower cluster
 * on each half. The two encoder buttons in Vial's matrix are not keyboard keys.
 * Coordinates use one key unit, and are only for rendering.
 *
 * The right half is a reflection of the left (inner columns drop toward the
 * center), not a translated copy of the left-hand stagger.
 */
export const cornixLpLayout: KeyboardLayout = {
  id: 'cornix-lp',
  name: 'Cornix LP',
  keys: [...createHalf('left', 0), ...createHalf('right', 9)],
}
