import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('describes the app privacy promise', () => {
    render(<App />)

    expect(screen.getByText('MVPの実装を準備中です。キーマップは外部へ送信しません。')).toBeVisible()
  })
})
