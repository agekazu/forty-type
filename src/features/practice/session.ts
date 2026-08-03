export type SessionStatus = 'idle' | 'active' | 'complete'

export interface PracticeSessionState {
  prompt: string
  position: number
  attempts: number
  correctInputs: number
  status: SessionStatus
  startedAt?: number
  endedAt?: number
  lastInput?: { character: string; correct: boolean }
}

export interface SessionScore {
  elapsedSeconds: number
  accuracy: number
  wordsPerMinute: number
}

export const createSession = (prompt: string): PracticeSessionState => ({
  prompt,
  position: 0,
  attempts: 0,
  correctInputs: 0,
  status: 'idle',
})

export const startSession = (session: PracticeSessionState, now: number): PracticeSessionState => ({
  ...session,
  position: 0,
  attempts: 0,
  correctInputs: 0,
  status: 'active',
  startedAt: now,
  endedAt: undefined,
  lastInput: undefined,
})

export const recordInput = (
  session: PracticeSessionState,
  character: string,
  now: number,
): PracticeSessionState => {
  if (session.status !== 'active' || character.length !== 1) return session
  const correct = character === session.prompt[session.position]
  const position = session.position + (correct ? 1 : 0)
  const complete = position >= session.prompt.length
  return {
    ...session,
    position,
    attempts: session.attempts + 1,
    correctInputs: session.correctInputs + (correct ? 1 : 0),
    status: complete ? 'complete' : 'active',
    endedAt: complete ? now : undefined,
    lastInput: { character, correct },
  }
}

export const scoreSession = (session: PracticeSessionState, now: number): SessionScore => {
  const elapsedMilliseconds = session.startedAt === undefined
    ? 0
    : Math.max(0, (session.endedAt ?? now) - session.startedAt)
  const elapsedSeconds = elapsedMilliseconds / 1_000
  const minutes = elapsedSeconds / 60
  return {
    elapsedSeconds,
    accuracy: session.attempts === 0 ? 100 : (session.correctInputs / session.attempts) * 100,
    wordsPerMinute: minutes === 0 ? 0 : (session.correctInputs / 5) / minutes,
  }
}
