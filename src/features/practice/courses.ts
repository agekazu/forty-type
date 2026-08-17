import { resolveCharacter } from '../keymap/resolve'
import type { Keymap } from '../keymap/types'

export const PROMPT_COUNT_MIN = 10
export const PROMPT_COUNT_MAX = 100
export const PROMPT_COUNT_STEP = 10
export const DEFAULT_PROMPT_COUNT = 10
export const PROMPT_LENGTH_MIN = 10
export const PROMPT_LENGTH_MAX = 100
export const PROMPT_LENGTH_STEP = 10
export const DEFAULT_PROMPT_LENGTH = 50

export type CourseId =
  | 'numbers'
  | 'symbols'
  | 'brackets'
  | 'operators'
  | 'letters'
  | 'capitals'
  | 'mixed'

export interface Course {
  id: CourseId
  name: string
  description: string
  matches: (character: string) => boolean
  templates: readonly string[]
}

const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index))

const isDigit = (character: string) => /[0-9]/.test(character)
const isLower = (character: string) => character === ' ' || /[a-z]/.test(character)
const isUpper = (character: string) => character === ' ' || /[A-Z]/.test(character)
const isBracket = (character: string) => /[()[\]{}<>]/.test(character)
const isOperator = (character: string) => /[+\-*/%=<>!&|^~]/.test(character)
const isSymbol = (character: string) => /[^A-Za-z0-9\s]/.test(character)

export const COURSES: readonly Course[] = [
  {
    id: 'numbers',
    name: '数字',
    description: '0–9。レイヤー上の数字段を反復します。',
    matches: isDigit,
    templates: [
      '12345', '67890', '1234567890', '0987654321', '13579', '24680',
      '102938', '31415', '27182', '10000', '012345', '112233', '121212',
      '987654', '11111', '777', '42', '256', '1024', '2048', '4096',
      '65536', '12321', '1001', '2026', '314159', '000', '555', '999', '8080',
    ],
  },
  {
    id: 'symbols',
    name: '記号',
    description: '句読点と記号。レイヤー記号の位置を覚えます。',
    matches: isSymbol,
    templates: [
      '[]', '{}', '()', ';;', ',,', '..', "''", '""', '--', '==', '::',
      '!!', '??', '**', '&&', '||', '!=', '<=', '>=', '->', '=>',
      '[]{}', '();', '{}', '\\', '`~', '_+', '-=', '@#', '$%', '^&',
    ],
  },
  {
    id: 'brackets',
    name: '括弧',
    description: '() [] {} <>。対応する括弧をセットで打ちます。',
    matches: isBracket,
    templates: [
      '()', '[]', '{}', '<>', '(())', '[[]]', '{{}}', '<<>>',
      '([])', '{[]}', '({})', '<[]>', '[{()}]', '{[()]}', '([{}])',
      '()[]', '[]{}', '{}()', '<>()', '()<>', '[]<>',
      '(()[])', '{([])}', '<({})>', '[]()', '{}[]', '(){}',
    ],
  },
  {
    id: 'operators',
    name: '演算子',
    description: '代入・比較・論理演算。コードで使う記号を重点的に。',
    matches: isOperator,
    templates: [
      '+=', '-=', '*=', '/=', '%=', '==', '!=', '<=', '>=', '&&', '||',
      '++', '--', '->', '=>', '<<', '>>', '&=', '|=', '^=', '~',
      '+-*/', '=!', '&|', '%/', '==!', '&&||', '++--', '<<=', '>>=', '!==',
    ],
  },
  {
    id: 'letters',
    name: '英字',
    description: '小文字の英単語やフレーズ。自然な文章を長く打つ練習です。',
    matches: isLower,
    templates: [
      'a', 'we', 'to', 'in', 'on', 'at', 'the', 'and', 'for', 'with',
      'morning', 'evening', 'coffee', 'music', 'garden', 'window', 'river',
      'mountain', 'ocean', 'forest', 'weather', 'season', 'travel', 'friend',
      'family', 'story', 'letter', 'picture', 'market', 'station', 'street',
      'light', 'quiet', 'bright', 'gentle', 'simple', 'happy', 'little',
      'today', 'tomorrow', 'always', 'slowly', 'together', 'remember',
      'practice', 'rhythm', 'comfort', 'balance', 'journey', 'discover',
    ],
  },
  {
    id: 'capitals',
    name: '大文字',
    description: '大文字の英単語やフレーズ。Shiftとの同時押しを練習します。',
    matches: isUpper,
    templates: [
      'A', 'WE', 'TO', 'IN', 'ON', 'AT', 'THE', 'AND', 'FOR', 'WITH',
      'MORNING', 'EVENING', 'COFFEE', 'MUSIC', 'GARDEN', 'WINDOW', 'RIVER',
      'MOUNTAIN', 'OCEAN', 'FOREST', 'WEATHER', 'SEASON', 'TRAVEL', 'FRIEND',
      'FAMILY', 'STORY', 'LETTER', 'PICTURE', 'MARKET', 'STATION', 'STREET',
      'LIGHT', 'QUIET', 'BRIGHT', 'GENTLE', 'SIMPLE', 'HAPPY', 'LITTLE',
      'TODAY', 'TOMORROW', 'ALWAYS', 'SLOWLY', 'TOGETHER', 'REMEMBER',
      'PRACTICE', 'RHYTHM', 'COMFORT', 'BALANCE', 'JOURNEY', 'DISCOVER',
    ],
  },
  {
    id: 'mixed',
    name: '総合',
    description: '英数字・記号を含む、日常的な文やフレーズを練習します。',
    matches: (character) => character === ' ' || /[A-Za-z0-9]/.test(character) || isSymbol(character),
    templates: [
      'A', 'I', 'we', 'you', 'the', 'and', 'with', 'from', 'today', 'tomorrow',
      'Good', 'morning', 'evening', 'coffee', 'music', 'books', 'garden',
      'window', 'river', 'mountain', 'ocean', 'forest', 'weather', 'travel',
      'friends', 'family', 'story', 'picture', 'market', 'station', 'street',
      'quiet', 'bright', 'gentle', 'simple', 'happy', 'together', 'practice',
      'slowly', 'remember', 'discover', 'journey', '2026', '10', '42',
      'hello!', 'ready?', 'yes,', 'no,', "it's", 'day.', 'time.', 'again.',
    ],
  },
]

export const courseById = (id: CourseId): Course =>
  COURSES.find((course) => course.id === id) ?? COURSES[0]

export const supportedCharactersFor = (keymap: Keymap): string[] =>
  PRINTABLE_ASCII.filter((character) => resolveCharacter(keymap, character).supported)

const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapWith]] = [copy[swapWith], copy[index]]
  }
  return copy
}

const usesOnly = (prompt: string, allowed: Set<string>) =>
  [...prompt].every((character) => allowed.has(character))

const clampToStep = (value: number, min: number, max: number, step: number) =>
  Math.min(max, Math.max(min, Math.round(value / step) * step))

const pickRandom = <T>(items: readonly T[], random: () => number): T =>
  items[Math.floor(random() * items.length)]

const generatePrompt = (
  templates: readonly string[],
  characters: readonly string[],
  targetLength: number,
  random: () => number,
): string => {
  if (characters.length === 0) return ''

  const canUseSpaces = characters.includes(' ')
  const fillerCharacters = characters.filter((character) => character !== ' ')
  const usableTemplates = templates.filter((template) => template.length <= targetLength)
  let prompt = ''

  while (usableTemplates.length > 0) {
    const separator = canUseSpaces && prompt.length > 0 ? ' ' : ''
    const remaining = targetLength - prompt.length - separator.length
    const fitting = usableTemplates.filter((template) => template.length <= remaining)
    if (fitting.length === 0) break
    prompt += separator + pickRandom(fitting, random)
  }

  while (prompt.length < targetLength) {
    prompt += pickRandom(fillerCharacters.length > 0 ? fillerCharacters : characters, random)
  }

  return prompt
}

export const pickPrompts = (
  course: Course,
  count: number,
  length: number,
  characters: readonly string[],
  random: () => number = Math.random,
): string[] => {
  const size = clampToStep(count, PROMPT_COUNT_MIN, PROMPT_COUNT_MAX, PROMPT_COUNT_STEP)
  const promptLength = clampToStep(length, PROMPT_LENGTH_MIN, PROMPT_LENGTH_MAX, PROMPT_LENGTH_STEP)
  const matching = characters.filter(course.matches)
  if (matching.length === 0 || matching.every((character) => character === ' ')) return []

  const allowed = new Set(matching)
  const templates = course.templates.filter((template) => usesOnly(template, allowed))
  const prompts: string[] = []
  const used = new Set<string>()

  let attempts = 0
  while (prompts.length < size && attempts < size * 20) {
    attempts += 1
    const generated = generatePrompt(shuffle(templates, random), matching, promptLength, random)
    if (!generated || used.has(generated)) continue
    prompts.push(generated)
    used.add(generated)
  }

  while (prompts.length < size) {
    prompts.push(generatePrompt(templates, matching, promptLength, random))
  }

  return prompts
}
