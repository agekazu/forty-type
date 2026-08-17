import { expect, test } from '@playwright/test'
import path from 'node:path'

test('imports a Vial keymap and completes the practice flow', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel(/\.vilファイルを選択/).setInputFiles(path.join(import.meta.dirname, 'fixtures/cornix.vil'))

  await expect(page.getByText(/cornix\.vil を読み込みました/)).toBeVisible()
  await expect(page.getByRole('img', { name: /Cornix LP キーボード/ })).toBeVisible()

  await expect(page.getByRole('button', { name: '数字' })).toBeVisible()
  await page.getByRole('button', { name: '練習を開始' }).click()

  for (let index = 1; index <= 10; index += 1) {
    await expect(page.getByText(`お題 ${index} / 10`)).toBeVisible()
    const text = await page.getByLabel('練習文字列').getAttribute('data-prompt')
    await page.getByLabel('タイピング入力').pressSequentially(text ?? '')
  }

  await expect(page.getByText('完了しました！')).toBeVisible()
  await expect(page.getByText('100%')).toBeVisible()
})

test('ends a practice session before all prompts are finished', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel(/\.vilファイルを選択/).setInputFiles(path.join(import.meta.dirname, 'fixtures/cornix.vil'))

  await page.getByRole('button', { name: '練習を開始' }).click()
  await expect(page.getByText('お題 1 / 10')).toBeVisible()
  await page.getByRole('button', { name: '終了' }).click()

  await expect(page.getByText('練習を終了しました。')).toBeVisible()
  await expect(page.getByRole('button', { name: 'もう一度' })).toBeVisible()
})

test('keeps the imported keymap after a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel(/\.vilファイルを選択/).setInputFiles(path.join(import.meta.dirname, 'fixtures/cornix.vil'))
  await expect(page.getByText(/cornix\.vil を読み込みました/)).toBeVisible()

  await page.reload()

  await expect(page.getByText(/cornix\.vil を読み込みました/)).toBeVisible()
  await expect(page.getByRole('button', { name: '数字' })).toBeVisible()
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
