import { useState, type DragEvent } from 'react'
import { KeyboardDiagram } from './features/keyboard/KeyboardDiagram'
import { resolveCharacter } from './features/keymap/resolve'
import type { Keymap } from './features/keymap/types'
import { parseVil } from './features/keymap/vil'

type ImportState =
  | { status: 'idle' }
  | { status: 'success'; fileName: string; keymap: Keymap }
  | { status: 'error'; message: string }

function App() {
  const [importState, setImportState] = useState<ImportState>({ status: 'idle' })
  const [targetCharacter, setTargetCharacter] = useState('a')

  const loadFile = async (file?: File) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.vil')) {
      setImportState({ status: 'error', message: '.vilファイルを選択してください。' })
      return
    }
    try {
      const keymap = parseVil(await file.text())
      setImportState({ status: 'success', fileName: file.name, keymap })
    } catch (error) {
      setImportState({
        status: 'error',
        message: error instanceof Error ? error.message : 'ファイルを読み込めませんでした。',
      })
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    void loadFile(event.dataTransfer.files[0])
  }

  const resolved = importState.status === 'success'
    ? resolveCharacter(importState.keymap, targetCharacter)
    : undefined

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-sm tracking-[0.2em] text-cyan-300">FORTY-TYPE</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
          40%キーボードのためのタイピング練習
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Vialのキーマップをブラウザ内で読み込み、次に押すキーをキーボード図で案内するゲームです。
        </p>
        <section className="mt-10 rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">キーマップを読み込む</h2>
          <label
            className="mt-4 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-600 px-6 py-10 text-center transition hover:border-cyan-400 focus-within:border-cyan-400"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <span className="font-medium">.vilファイルを選択、またはドロップ</span>
            <span className="mt-2 text-sm text-slate-400">ファイルはブラウザ内だけで処理され、外部へ送信されません。</span>
            <input
              className="sr-only"
              type="file"
              accept=".vil,application/json"
              onChange={(event) => void loadFile(event.target.files?.[0])}
            />
          </label>
          <div className="mt-4 min-h-6" aria-live="polite">
            {importState.status === 'success' && (
              <p className="text-emerald-300">
                {importState.fileName} を読み込みました（{importState.keymap.layers.length}レイヤー）。
              </p>
            )}
            {importState.status === 'error' && <p className="text-rose-300">{importState.message}</p>}
          </div>
        </section>
        {importState.status === 'success' && (
          <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">次に押すキー</h2>
                <p className="mt-1 text-sm text-slate-400">案内する文字をキーボードで入力できます。</p>
              </div>
              <label className="text-sm text-slate-300">
                練習する文字
                <input
                  className="ml-3 w-14 rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-center text-lg focus:border-cyan-400 focus:outline-none"
                  value={targetCharacter}
                  maxLength={1}
                  onChange={(event) => setTargetCharacter(event.target.value.slice(-1))}
                />
              </label>
            </div>
            {resolved?.supported ? (
              <div className="mt-6">
                <KeyboardDiagram keymap={importState.keymap} stroke={resolved.stroke} />
              </div>
            ) : (
              <p className="mt-6 rounded-lg bg-rose-950/50 p-4 text-rose-200" role="status">
                {resolved?.reason ?? '文字を入力してください。'}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default App
