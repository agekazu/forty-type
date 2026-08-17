import { describe, expect, it } from 'vitest'
import type { Keymap } from '../keymap/types'
import {
  COURSES,
  courseById,
  pickPrompts,
  PROMPT_COUNT_MAX,
  PROMPT_COUNT_MIN,
  PROMPT_LENGTH_MAX,
  PROMPT_LENGTH_MIN,
  supportedCharactersFor,
} from './courses'

const keymapFor = (characters: string): Keymap => {
  const keycodes = [...characters].map((character) => {
    if (/[a-z]/.test(character)) return `KC_${character.toUpperCase()}`
    if (/[A-Z]/.test(character)) return `KC_${character}`
    if (/[0-9]/.test(character)) return `KC_${character}`
    const shifted: Record<string, string> = {
      '!': 'LSFT(KC_1)', '@': 'LSFT(KC_2)', '#': 'LSFT(KC_3)', $: 'LSFT(KC_4)',
      '%': 'LSFT(KC_5)', '^': 'LSFT(KC_6)', '&': 'LSFT(KC_7)', '*': 'LSFT(KC_8)',
      '(': 'LSFT(KC_9)', ')': 'LSFT(KC_0)', _: 'LSFT(KC_MINUS)', '+': 'LSFT(KC_EQUAL)',
      '{': 'LSFT(KC_LBRACKET)', '}': 'LSFT(KC_RBRACKET)', '|': 'LSFT(KC_BSLASH)',
      ':': 'LSFT(KC_SCOLON)', '"': 'LSFT(KC_QUOTE)', '~': 'LSFT(KC_GRAVE)',
      '<': 'LSFT(KC_COMMA)', '>': 'LSFT(KC_DOT)', '?': 'LSFT(KC_SLASH)',
    }
    const unshifted: Record<string, string> = {
      ' ': 'KC_SPACE', '-': 'KC_MINUS', '=': 'KC_EQUAL', '[': 'KC_LBRACKET',
      ']': 'KC_RBRACKET', '\\': 'KC_BSLASH', ';': 'KC_SCOLON', "'": 'KC_QUOTE',
      '`': 'KC_GRAVE', ',': 'KC_COMMA', '.': 'KC_DOT', '/': 'KC_SLASH',
    }
    return shifted[character] ?? unshifted[character] ?? 'KC_NO'
  })
  return {
    keyboardId: 'cornix-lp',
    layers: [{
      index: 0,
      assignments: [
        ...keycodes.map((keycode, index) => ({ keyId: `K${index}`, keycode })),
        { keyId: 'SHIFT', keycode: 'KC_LSHIFT' },
      ],
    }],
  }
}

const digits = '0123456789'
const sequential = (() => {
  let value = 0.1
  return () => {
    value = (value + 0.17) % 1
    return value
  }
})()

describe('courses', () => {
  it('lists training courses for specific character classes', () => {
    expect(COURSES.map((course) => course.id)).toEqual([
      'numbers', 'symbols', 'brackets', 'operators', 'letters', 'capitals', 'mixed',
    ])
  })

  it('picks prompts with the selected count and length using only keymap characters', () => {
    const characters = supportedCharactersFor(keymapFor(digits))
    const prompts = pickPrompts(courseById('numbers'), 20, 40, characters, sequential)

    expect(prompts).toHaveLength(20)
    expect(prompts.every((prompt) => prompt.length === 40)).toBe(true)
    expect(prompts.every((prompt) => /^[0-9]+$/.test(prompt))).toBe(true)
  })

  it('returns no prompts when the keymap cannot type the course', () => {
    const characters = supportedCharactersFor(keymapFor('abc'))
    expect(pickPrompts(courseById('numbers'), 10, 50, characters, sequential)).toEqual([])
  })

  it('clamps count and length to their allowed 10-step ranges', () => {
    const characters = [...digits]
    const minimum = pickPrompts(courseById('numbers'), 3, 3, characters, sequential)
    const maximum = pickPrompts(courseById('numbers'), 999, 999, characters, sequential)

    expect(minimum).toHaveLength(PROMPT_COUNT_MIN)
    expect(minimum.every((prompt) => prompt.length === PROMPT_LENGTH_MIN)).toBe(true)
    expect(maximum).toHaveLength(PROMPT_COUNT_MAX)
    expect(maximum.every((prompt) => prompt.length === PROMPT_LENGTH_MAX)).toBe(true)
  })
})
