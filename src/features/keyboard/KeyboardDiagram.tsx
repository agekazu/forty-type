import { cornixLpLayout } from '../keymap/cornix-lp'
import type { Keymap } from '../keymap/types'
import type { KeyStroke } from '../keymap/resolve'

interface KeyboardDiagramProps {
  keymap: Keymap
  stroke?: KeyStroke
}

const labelFor = (keymap: Keymap, keyId: string, layer: number) => {
  const current = keymap.layers.find((item) => item.index === layer)
    ?.assignments.find((assignment) => assignment.keyId === keyId)?.keycode
  if (current && current !== 'KC_TRNS') return current.replace(/^KC_/, '')
  return keymap.layers[0]?.assignments.find((assignment) => assignment.keyId === keyId)
    ?.keycode.replace(/^KC_/, '') ?? ''
}

const highlightFor = (keyId: string, stroke?: KeyStroke) => {
  if (stroke?.keyId === keyId) return 'next'
  if (stroke?.modifierKeyIds.includes(keyId)) return 'modifier'
  if (stroke?.layerKeyIds.includes(keyId)) return 'layer'
  return 'none'
}

const colorFor = (highlight: ReturnType<typeof highlightFor>) => ({
  next: { fill: '#22d3ee', stroke: '#a5f3fc', text: '#083344' },
  modifier: { fill: '#f472b6', stroke: '#fbcfe8', text: '#500724' },
  layer: { fill: '#fbbf24', stroke: '#fef3c7', text: '#451a03' },
  none: { fill: '#1e293b', stroke: '#475569', text: '#cbd5e1' },
}[highlight])

export const KeyboardDiagram = ({ keymap, stroke }: KeyboardDiagramProps) => (
  <figure>
    <svg
      className="w-full"
      viewBox="-0.25 -0.25 16.5 5.1"
      role="img"
      aria-label="Cornix LP キーボード。水色は次のキー、ピンクはShift、黄色はレイヤーキーです。"
    >
      <title>Cornix LP キーガイド</title>
      {cornixLpLayout.keys.map((key) => {
        const highlight = highlightFor(key.id, stroke)
        const colors = colorFor(highlight)
        return (
          <g
            key={key.id}
            transform={`translate(${key.position.x} ${key.position.y})`}
            data-key-id={key.id}
            data-highlight={highlight}
          >
            <rect width="0.9" height="0.9" rx="0.12" fill={colors.fill} stroke={colors.stroke} strokeWidth="0.04" />
            <text x="0.45" y="0.53" textAnchor="middle" fill={colors.text} fontSize="0.2" fontWeight="600">
              {labelFor(keymap, key.id, stroke?.layer ?? 0)}
            </text>
          </g>
        )
      })}
    </svg>
    <figcaption className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
      <span><i className="mr-2 inline-block size-3 rounded-sm bg-cyan-400" />次のキー</span>
      <span><i className="mr-2 inline-block size-3 rounded-sm bg-pink-400" />Shift</span>
      <span><i className="mr-2 inline-block size-3 rounded-sm bg-amber-400" />レイヤー</span>
    </figcaption>
  </figure>
)
