import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cornixLpLayout } from '../keymap/cornix-lp'
import type { Keymap } from '../keymap/types'
import { KeyboardDiagram } from './KeyboardDiagram'

const keymap: Keymap = {
  keyboardId: 'cornix-lp',
  layers: [{
    index: 0,
    assignments: cornixLpLayout.keys.map(({ id: keyId }) => ({ keyId, keycode: 'KC_A' })),
  }],
}

describe('KeyboardDiagram', () => {
  it('renders all Cornix LP keys and distinct guidance states', () => {
    const { container } = render(
      <KeyboardDiagram
        keymap={keymap}
        stroke={{ character: 'A', keyId: 'L00', layer: 0, modifierKeyIds: ['L01'], layerKeyIds: ['L02'] }}
      />,
    )

    expect(screen.getByRole('img', { name: /Cornix LP キーボード/ })).toBeVisible()
    expect(container.querySelectorAll('[data-key-id]')).toHaveLength(48)
    expect(container.querySelector('[data-key-id="L00"]')).toHaveAttribute('data-highlight', 'next')
    expect(container.querySelector('[data-key-id="L01"]')).toHaveAttribute('data-highlight', 'modifier')
    expect(container.querySelector('[data-key-id="L02"]')).toHaveAttribute('data-highlight', 'layer')
  })
})
