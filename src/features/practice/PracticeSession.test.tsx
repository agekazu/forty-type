import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { cornixLpLayout } from '../keymap/cornix-lp'
import type { Keymap } from '../keymap/types'
import { PracticeSession } from './PracticeSession'

const keymap: Keymap = {
  keyboardId: 'cornix-lp',
  layers: [{
    index: 0,
    assignments: cornixLpLayout.keys.map((key) => ({ keyId: key.id, keycode: 'KC_1' })),
  }],
}

describe('PracticeSession', () => {
  it('lets the user end an in-progress session and keep the score', async () => {
    const user = userEvent.setup()
    render(<PracticeSession keymap={keymap} />)

    await user.click(screen.getByRole('button', { name: '練習を開始' }))
    expect(await screen.findByText('お題 1 / 10')).toBeVisible()

    await user.click(screen.getByRole('button', { name: '終了' }))
    expect(screen.getByText('練習を終了しました。')).toBeVisible()
    expect(screen.getByRole('button', { name: 'もう一度' })).toBeVisible()
    expect(screen.queryByRole('button', { name: '終了' })).not.toBeInTheDocument()
  })
})
