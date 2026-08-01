import { expect, test } from '@playwright/test'
import path from 'node:path'

test('imports a Vial keymap and completes the practice flow', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel(/\.vilファイルを選択/).setInputFiles(path.join(import.meta.dirname, 'fixtures/cornix.vil'))

  await expect(page.getByText(/cornix\.vil を読み込みました/)).toBeVisible()
  await expect(page.getByRole('img', { name: /Cornix LP キーボード/ })).toBeVisible()

  await page.getByRole('button', { name: '練習を開始' }).click()
  await page.getByLabel('タイピング入力').pressSequentially('forty type!')

  await expect(page.getByText('完了しました！')).toBeVisible()
  await expect(page.getByText('100%')).toBeVisible()
})

test('reports an invalid Vial file without leaving the browser', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel(/\.vilファイルを選択/).setInputFiles({
    name: 'invalid.vil',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version": 99}'),
  })

  await expect(page.getByText(/未対応のVialファイルバージョン/)).toBeVisible()
})
