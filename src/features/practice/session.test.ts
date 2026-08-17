import { describe, expect, it } from 'vitest'
import { createSession, currentPrompt, endSession, recordInput, scoreSession, startSession } from './session'

describe('practice session', () => {
  it('starts, records correct input, and completes', () => {
    let session = startSession(createSession(['ab']), 1_000)
    session = recordInput(session, 'a', 2_000)
    session = recordInput(session, 'b', 3_000)

    expect(session).toMatchObject({
      status: 'complete', position: 2, attempts: 2, correctInputs: 2, endedAt: 3_000,
    })
    expect(scoreSession(session, 9_000)).toEqual({
      elapsedSeconds: 2,
      accuracy: 100,
      wordsPerMinute: 12,
    })
  })

  it('advances to the next prompt after completing one', () => {
    let session = startSession(createSession(['ab', 'c']), 0)
    session = recordInput(session, 'a', 1)
    session = recordInput(session, 'b', 2)

    expect(session).toMatchObject({ status: 'active', promptIndex: 1, position: 0 })
    expect(currentPrompt(session)).toBe('c')

    session = recordInput(session, 'c', 3)
    expect(session).toMatchObject({ status: 'complete', promptIndex: 1, position: 1, endedAt: 3 })
  })

  it('counts mistakes without advancing the prompt', () => {
    let session = startSession(createSession(['a']), 0)
    session = recordInput(session, 'x', 1_000)

    expect(session).toMatchObject({ status: 'active', position: 0, attempts: 1, correctInputs: 0 })
    expect(scoreSession(session, 2_000)).toMatchObject({ elapsedSeconds: 2, accuracy: 0 })
  })

  it('ignores input until the session starts', () => {
    const session = createSession(['a'])
    expect(recordInput(session, 'a', 1_000)).toBe(session)
  })

  it('does not start when there are no prompts', () => {
    const session = createSession([])
    expect(startSession(session, 1_000)).toBe(session)
  })

  it('ends an active session and freezes the score', () => {
    let session = startSession(createSession(['ab']), 1_000)
    session = recordInput(session, 'a', 2_000)
    session = endSession(session, 3_000)

    expect(session).toMatchObject({ status: 'ended', position: 1, endedAt: 3_000 })
    expect(scoreSession(session, 9_000)).toEqual({
      elapsedSeconds: 2,
      accuracy: 100,
      wordsPerMinute: 6,
    })
    expect(endSession(session, 4_000)).toBe(session)
  })
})
