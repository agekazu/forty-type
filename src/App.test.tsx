import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('describes the app privacy promise', () => {
    render(<App />)

    expect(screen.getByText(/ファイルはブラウザ内だけで処理され、外部へ送信されません/)).toBeVisible()
  })

  it('shows the result of loading a Vial file', async () => {
    const user = userEvent.setup()
    render(<App />)
    const layer = Array.from({ length: 48 }, () => 'KC_A')
    const file = new File(
      [JSON.stringify({ version: 1, vial_protocol: 6, layout: [layer] })],
      'cornix.vil',
      { type: 'application/json' },
    )

    await user.upload(screen.getByLabelText(/\.vilファイルを選択/), file)

    expect(await screen.findByText(/cornix\.vil を読み込みました/)).toBeVisible()
  })
})
