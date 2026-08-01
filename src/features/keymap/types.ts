export type KeyboardId = 'cornix-lp'

export type Hand = 'left' | 'right'

export interface KeyPosition {
  x: number
  y: number
}

export interface PhysicalKey {
  /** Stable identifier used by the UI and layer assignments. */
  id: string
  hand: Hand
  /** Position in the keyboard's physical matrix. */
  matrix: {
    row: number
    column: number
  }
  position: KeyPosition
}

export interface KeyboardLayout {
  id: KeyboardId
  name: string
  keys: readonly PhysicalKey[]
}

export interface KeyAssignment {
  keyId: PhysicalKey['id']
  keycode: string
}

export interface KeymapLayer {
  index: number
  assignments: readonly KeyAssignment[]
}

export interface Keymap {
  keyboardId: KeyboardId
  layers: readonly KeymapLayer[]
}
