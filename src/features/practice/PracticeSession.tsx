import { useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardDiagram } from '../keyboard/KeyboardDiagram'
import { resolveCharacter } from '../keymap/resolve'
import type { Keymap } from '../keymap/types'
import {
  COURSES,
  DEFAULT_PROMPT_COUNT,
  DEFAULT_PROMPT_LENGTH,
  PROMPT_COUNT_MAX,
  PROMPT_COUNT_MIN,
  PROMPT_COUNT_STEP,
  PROMPT_LENGTH_MAX,
  PROMPT_LENGTH_MIN,
  PROMPT_LENGTH_STEP,
  courseById,
  pickPrompts,
  supportedCharactersFor,
  type CourseId,
} from './courses'
import { createSession, currentPrompt, endSession, recordInput, scoreSession, startSession } from './session'

interface PracticeSessionProps {
  keymap: Keymap
}

const promptCounts = Array.from(
  { length: (PROMPT_COUNT_MAX - PROMPT_COUNT_MIN) / PROMPT_COUNT_STEP + 1 },
  (_, index) => PROMPT_COUNT_MIN + index * PROMPT_COUNT_STEP,
)

const promptLengths = Array.from(
  { length: (PROMPT_LENGTH_MAX - PROMPT_LENGTH_MIN) / PROMPT_LENGTH_STEP + 1 },
  (_, index) => PROMPT_LENGTH_MIN + index * PROMPT_LENGTH_STEP,
)

export const PracticeSession = ({ keymap }: PracticeSessionProps) => {
  const [courseId, setCourseId] = useState<CourseId>('numbers')
  const [promptCount, setPromptCount] = useState(DEFAULT_PROMPT_COUNT)
  const [promptLength, setPromptLength] = useState(DEFAULT_PROMPT_LENGTH)
  const [session, setSession] = useState(() => createSession())
  const [startError, setStartError] = useState('')
  const [now, setNow] = useState(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const course = courseById(courseId)
  const characters = useMemo(() => supportedCharactersFor(keymap), [keymap])
  const score = scoreSession(session, now)
  const prompt = currentPrompt(session)
  const character = prompt[session.position]
  const resolved = character ? resolveCharacter(keymap, character) : undefined
  const busy = session.status === 'active'

  useEffect(() => {
    if (session.status !== 'active') return
    inputRef.current?.focus()
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [session.status])

  const promptParts = useMemo(() => ({
    completed: prompt.slice(0, session.position),
    current: session.status === 'active' ? prompt[session.position] : undefined,
    remaining: prompt.slice(session.status === 'active' ? session.position + 1 : session.position),
  }), [prompt, session.position, session.status])

  const begin = () => {
    const prompts = pickPrompts(course, promptCount, promptLength, characters)
    if (prompts.length === 0) {
      setStartError('このキーマップでは、このコースの文字を出力できません。')
      setSession(createSession())
      return
    }
    const timestamp = Date.now()
    setStartError('')
    setNow(timestamp)
    setSession(startSession(createSession(prompts), timestamp))
  }

  const selectCourse = (next: CourseId) => {
    setCourseId(next)
    setStartError('')
    setSession(createSession())
  }

  const finish = () => {
    const timestamp = Date.now()
    setNow(timestamp)
    setSession((current) => endSession(current, timestamp))
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">タイピング練習</h2>
          <p className="mt-1 text-sm text-slate-400">
            コース・問題数・文字数を選び、表示された文字列を入力してください。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {busy && (
            <button
              className="rounded-md border border-rose-400 px-4 py-2 font-semibold text-rose-200 hover:bg-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-200"
              type="button"
              onClick={finish}
            >
              終了
            </button>
          )}
          <button
            className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-cyan-950 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            type="button"
            onClick={begin}
          >
            {session.status === 'idle' ? '練習を開始' : 'もう一度'}
          </button>
        </div>
      </div>

      <fieldset className="mt-6" disabled={busy}>
        <legend className="text-sm font-medium text-slate-300">コース</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COURSES.map((item) => (
            <button
              key={item.id}
              className={`rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
                item.id === courseId
                  ? 'bg-cyan-400 text-cyan-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              type="button"
              aria-pressed={item.id === courseId}
              onClick={() => selectCourse(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-400">{course.description}</p>
      </fieldset>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-3 text-sm text-slate-300">
          問題数
          <select
            className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
            value={promptCount}
            disabled={busy}
            onChange={(event) => {
              setPromptCount(Number(event.target.value))
              setSession(createSession())
            }}
          >
            {promptCounts.map((count) => (
              <option key={count} value={count}>{count}問</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          1問の文字数
          <select
            className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
            value={promptLength}
            disabled={busy}
            onChange={(event) => {
              setPromptLength(Number(event.target.value))
              setSession(createSession())
            }}
          >
            {promptLengths.map((length) => (
              <option key={length} value={length}>{length}文字</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">読み込んだキーマップで打てる文字だけが出題されます。</p>

      {startError && <p className="mt-4 text-sm text-rose-300" role="status">{startError}</p>}

      {session.status !== 'idle' && (
        <>
          <p className="mt-6 text-sm text-slate-400" aria-live="polite">
            お題 {session.promptIndex + 1} / {session.prompts.length}
          </p>
          <p
            className="mt-2 rounded-lg bg-slate-950 p-5 font-mono text-2xl tracking-wider whitespace-pre-wrap"
            aria-label="練習文字列"
            data-prompt={prompt}
          >
            <span className="text-emerald-400">{promptParts.completed}</span>
            {promptParts.current && <mark className="bg-cyan-400 text-cyan-950">{promptParts.current}</mark>}
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
              : session.status === 'ended'
                ? '練習を終了しました。'
                : session.lastInput?.correct === false
                  ? `「${session.lastInput.character}」は不正解です。`
                  : session.lastInput ? '正解です。' : ''}
          </p>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">経過時間</dt><dd className="mt-1 text-xl font-semibold">{score.elapsedSeconds.toFixed(1)}秒</dd></div>
            <div className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">速度</dt><dd className="mt-1 text-xl font-semibold">{score.wordsPerMinute.toFixed(0)} WPM</dd></div>
            <div className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">精度</dt><dd className="mt-1 text-xl font-semibold">{score.accuracy.toFixed(0)}%</dd></div>
          </dl>
        </>
      )}

      {session.status === 'active' && character && resolved && !resolved.supported ? (
        <p className="mt-6 rounded-lg bg-rose-950/50 p-4 text-rose-200" role="status">{resolved.reason}</p>
      ) : (
        <div className="mt-6">
          <KeyboardDiagram keymap={keymap} stroke={session.status === 'active' && resolved?.supported ? resolved.stroke : undefined} />
        </div>
      )}
    </section>
  )
}
