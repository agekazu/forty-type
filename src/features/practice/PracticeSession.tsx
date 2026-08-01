import { useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardDiagram } from '../keyboard/KeyboardDiagram'
import { resolveCharacter } from '../keymap/resolve'
import type { Keymap } from '../keymap/types'
import { createSession, recordInput, scoreSession, startSession } from './session'

const PRACTICE_TEXT = 'forty type!'

interface PracticeSessionProps {
  keymap: Keymap
}

export const PracticeSession = ({ keymap }: PracticeSessionProps) => {
  const [session, setSession] = useState(() => createSession(PRACTICE_TEXT))
  const [now, setNow] = useState(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const score = scoreSession(session, now)
  const character = session.prompt[session.position]
  const resolved = character ? resolveCharacter(keymap, character) : undefined

  useEffect(() => {
    if (session.status !== 'active') return
    inputRef.current?.focus()
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [session.status])

  const promptParts = useMemo(() => ({
    completed: session.prompt.slice(0, session.position),
    current: session.prompt[session.position],
    remaining: session.prompt.slice(session.position + 1),
  }), [session.position, session.prompt])

  const begin = () => {
    const timestamp = Date.now()
    setNow(timestamp)
    setSession((current) => startSession(current, timestamp))
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">タイピング練習</h2>
          <p className="mt-1 text-sm text-slate-400">入力欄にフォーカスして、表示された文字列を入力してください。</p>
        </div>
        <button
          className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-cyan-950 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          type="button"
          onClick={begin}
        >
          {session.status === 'idle' ? '練習を開始' : 'もう一度'}
        </button>
      </div>

      <p className="mt-6 rounded-lg bg-slate-950 p-5 font-mono text-2xl tracking-wider" aria-label="練習文字列">
        <span className="text-emerald-400">{promptParts.completed}</span>
        {session.status !== 'complete' && <mark className="bg-cyan-400 text-cyan-950">{promptParts.current}</mark>}
        <span className="text-slate-400">{promptParts.remaining}</span>
      </p>
      <input
        ref={inputRef}
        className="mt-4 w-full rounded-md border border-slate-600 bg-slate-950 px-4 py-3 focus:border-cyan-400 focus:outline-none"
        aria-label="タイピング入力"
        placeholder={session.status === 'active' ? 'ここに入力' : '開始ボタンを押してください'}
        disabled={session.status !== 'active'}
        value=""
        onChange={(event) => {
          const entered = event.target.value.slice(-1)
          if (entered) setSession((current) => recordInput(current, entered, Date.now()))
        }}
      />
      <p className={`mt-2 min-h-6 text-sm ${session.lastInput?.correct === false ? 'text-rose-300' : 'text-emerald-300'}`} aria-live="polite">
        {session.status === 'complete'
          ? '完了しました！'
          : session.lastInput?.correct === false
            ? `「${session.lastInput.character}」は不正解です。`
            : session.lastInput ? '正解です。' : ''}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">経過時間</dt><dd className="mt-1 text-xl font-semibold">{score.elapsedSeconds.toFixed(1)}秒</dd></div>
        <div className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">速度</dt><dd className="mt-1 text-xl font-semibold">{score.wordsPerMinute.toFixed(0)} WPM</dd></div>
        <div className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">精度</dt><dd className="mt-1 text-xl font-semibold">{score.accuracy.toFixed(0)}%</dd></div>
      </dl>

      {resolved?.supported ? (
        <div className="mt-6"><KeyboardDiagram keymap={keymap} stroke={resolved.stroke} /></div>
      ) : character ? (
        <p className="mt-6 rounded-lg bg-rose-950/50 p-4 text-rose-200" role="status">{resolved?.reason}</p>
      ) : null}
    </section>
  )
}
