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
    expect(screen.getByRole('button', { name: '数字' })).toBeVisible()
    expect(screen.getByRole('button', { name: '記号' })).toBeVisible()
    expect(screen.getByLabelText('問題数')).toBeVisible()
    expect(screen.getByRole('option', { name: '100問' })).toBeInTheDocument()
    expect(screen.getByLabelText('1問の文字数')).toBeVisible()
    expect(screen.getByRole('option', { name: '100文字' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '練習を開始' }))
    expect(await screen.findByText(/このキーマップでは、このコースの文字を出力できません/)).toBeVisible()
  })

  it('restores a previously loaded keymap after remount', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    const layer = Array.from({ length: 48 }, () => 'KC_A')
    const file = new File(
      [JSON.stringify({ version: 1, vial_protocol: 6, layout: [layer] })],
      'cornix.vil',
      { type: 'application/json' },
    )

    await user.upload(screen.getByLabelText(/\.vilファイルを選択/), file)
    expect(await screen.findByText(/cornix\.vil を読み込みました/)).toBeVisible()

    unmount()
    render(<App />)

    expect(screen.getByText(/cornix\.vil を読み込みました/)).toBeVisible()
    expect(screen.getByRole('button', { name: '数字' })).toBeVisible()
  })
})
