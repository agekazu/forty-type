import { useState, type DragEvent } from 'react'
import type { Keymap } from './features/keymap/types'
import { parseVil } from './features/keymap/vil'
import { PracticeSession } from './features/practice/PracticeSession'

type ImportState =
  | { status: 'idle' }
  | { status: 'success'; fileName: string; keymap: Keymap }
  | { status: 'error'; message: string }

function App() {
  const [importState, setImportState] = useState<ImportState>({ status: 'idle' })

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
          <PracticeSession keymap={importState.keymap} />
        )}
      </div>
    </main>
  )
}

export default App
