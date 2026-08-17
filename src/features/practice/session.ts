export type SessionStatus = 'idle' | 'active' | 'complete' | 'ended'

export interface PracticeSessionState {
  prompts: readonly string[]
  promptIndex: number
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

export const currentPrompt = (session: PracticeSessionState): string =>
  session.prompts[session.promptIndex] ?? ''

export const createSession = (prompts: readonly string[] = []): PracticeSessionState => ({
  prompts,
  promptIndex: 0,
  position: 0,
  attempts: 0,
  correctInputs: 0,
  status: 'idle',
})

export const startSession = (session: PracticeSessionState, now: number): PracticeSessionState => {
  if (session.prompts.length === 0 || session.prompts.some((prompt) => prompt.length === 0)) {
    return session
  }
  return {
    ...session,
    promptIndex: 0,
    position: 0,
    attempts: 0,
    correctInputs: 0,
    status: 'active',
    startedAt: now,
    endedAt: undefined,
    lastInput: undefined,
  }
}

export const endSession = (
  session: PracticeSessionState,
  now: number,
): PracticeSessionState => {
  if (session.status !== 'active') return session
  return {
    ...session,
    status: 'ended',
    endedAt: now,
  }
}

export const recordInput = (
  session: PracticeSessionState,
  character: string,
  now: number,
): PracticeSessionState => {
  if (session.status !== 'active' || character.length !== 1) return session
  const prompt = currentPrompt(session)
  const correct = character === prompt[session.position]
  const position = session.position + (correct ? 1 : 0)
  const promptComplete = position >= prompt.length
  const nextIndex = session.promptIndex + 1
  const sessionComplete = promptComplete && nextIndex >= session.prompts.length
  return {
    ...session,
    promptIndex: promptComplete && !sessionComplete ? nextIndex : session.promptIndex,
    position: promptComplete && !sessionComplete ? 0 : position,
    attempts: session.attempts + 1,
    correctInputs: session.correctInputs + (correct ? 1 : 0),
    status: sessionComplete ? 'complete' : 'active',
    endedAt: sessionComplete ? now : undefined,
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
