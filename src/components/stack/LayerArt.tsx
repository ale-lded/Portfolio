import { contact, projects, stack } from '../../content'

/**
 * The drawing on top of each layer, one per step of the method, at a fixed 520×240 design size
 * (the SVG scales with the plate). Purely decorative: the step text lives in the plate header.
 * Colours follow the site palette and the syntax colours of the code window.
 */
const C = {
  bg: '#0a0a0b',
  panel: '#0e0d0d',
  ink: '#1a0f00',
  text: '#f2eee8',
  muted: '#8e8a84',
  amber: '#ffb547',
  deep: '#ff8a1f',
  soft: 'rgba(255, 181, 71, 0.14)',
  line: 'rgba(255, 236, 214, 0.18)',
  faint: 'rgba(255, 236, 214, 0.08)',
  punct: '#6e6860',
  attr: '#e3c9a0',
  str: '#f28b54',
  cardEdge: 'rgba(201, 143, 78, 0.5)',
}

const featured = projects[0]
/** Two tags at most fit on the small card */
const featuredTags = featured.tags.slice(0, 2)

/** Lays items out left to right: the x of each one, given their widths and a gap. */
const rowX = (start: number, widths: number[], gap: number) =>
  widths.map((_, i) => start + widths.slice(0, i).reduce((sum, w) => sum + w + gap, 0))

/** Listen: the notes from the first call, beside the conversation itself. */
function Brief() {
  const { title, questions, answer } = stack.art.brief
  const bars = [10, 22, 14, 30, 18, 26, 12, 20, 8, 16, 24, 10]
  return (
    <>
      <rect x="20" y="14" width="300" height="212" rx="8" fill={C.panel} stroke={C.line} />
      <text className="mono" x="36" y="40" fontSize="11" fill={C.amber}>
        {title}
      </text>
      <line x1="20" y1="54" x2="320" y2="54" stroke={C.faint} />
      {questions.map((q, i) => {
        const y = 82 + i * 30
        return (
          <g key={q}>
            <circle cx="42" cy={y - 4} r="6" fill="none" stroke={C.amber} />
            <path d={`M39 ${y - 4} l2 2 l4 -4`} fill="none" stroke={C.amber} strokeWidth="1.3" />
            <text className="sans" x="58" y={y} fontSize="12.5" fill={C.text}>
              {q}
            </text>
          </g>
        )
      })}
      <rect x="36" y="168" width="268" height="36" rx="6" fill={C.soft} stroke={C.amber} strokeOpacity="0.6" />
      <text className="mono" x="50" y="190.5" fontSize="11.5" fill={C.amber}>
        {`→ ${answer}`}
      </text>
      {/* The conversation: their words, then mine */}
      <rect x="350" y="20" width="150" height="56" rx="14" fill="none" stroke={C.line} />
      <rect x="366" y="36" width="104" height="6" rx="2" fill={C.line} />
      <rect x="366" y="52" width="72" height="6" rx="2" fill={C.faint} />
      <rect x="370" y="92" width="130" height="44" rx="14" fill={C.soft} stroke={C.amber} strokeOpacity="0.6" />
      <rect x="386" y="108" width="84" height="6" rx="2" fill={C.amber} fillOpacity="0.7" />
      <rect x="386" y="120" width="52" height="6" rx="2" fill={C.amber} fillOpacity="0.35" />
      {bars.map((h, i) => (
        <rect key={i} x={356 + i * 12} y={184 - h / 2} width="5" height={h} rx="2.5" fill={i < 7 ? C.amber : C.line} />
      ))}
      <text className="mono" x="350" y="222" fontSize="9.5" fill={C.muted}>
        12:40
      </text>
    </>
  )
}

function Wireframe() {
  const handles = [
    [33, 47],
    [307, 47],
    [33, 119],
    [307, 119],
  ]
  return (
    <>
      <rect x="20" y="14" width="300" height="212" rx="8" fill="none" stroke={C.line} />
      <line x1="20" y1="36" x2="320" y2="36" stroke={C.line} />
      {[32, 42, 52].map((x) => (
        <circle key={x} cx={x} cy="25" r="3" fill={C.line} />
      ))}
      <rect x="36" y="50" width="268" height="66" fill="none" stroke={C.line} strokeDasharray="4 4" />
      <path d="M36 50 L304 116 M304 50 L36 116" stroke={C.faint} />
      <rect x="36" y="128" width="150" height="8" rx="2" fill={C.line} />
      <rect x="36" y="142" width="104" height="6" rx="2" fill={C.faint} />
      {[36, 128, 220].map((x) => (
        <rect key={x} x={x} y="160" width="84" height="52" rx="4" fill="none" stroke={C.line} strokeDasharray="4 4" />
      ))}
      {/* Selected frame, as in a design tool */}
      <rect x="33" y="47" width="274" height="72" fill="none" stroke={C.amber} strokeWidth="1.5" />
      {handles.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 3.5} y={y - 3.5} width="7" height="7" fill={C.bg} stroke={C.amber} strokeWidth="1.5" />
      ))}
      <rect x="226" y="124" width="81" height="18" rx="3" fill={C.amber} />
      <text className="mono" x="266.5" y="136.5" textAnchor="middle" fontSize="10" fill={C.ink}>
        274 × 72
      </text>
      <path d="M284 92 v22 l6 -6 l4 9 l4 -2 l-4 -9 h8 z" fill={C.text} stroke={C.bg} strokeLinejoin="round" />
      {/* User flow */}
      {stack.art.flow.map((label, i) => {
        const last = i === 2
        return (
          <g key={label}>
            <rect
              x="356"
              y={20 + i * 76}
              width="144"
              height="40"
              rx="8"
              fill={last ? C.soft : 'none'}
              stroke={last ? C.amber : C.line}
            />
            <text className="mono" x="372" y={44.5 + i * 76} fontSize="12" fill={last ? C.amber : C.muted}>
              {`0${i + 1}  ${label}`}
            </text>
          </g>
        )
      })}
      {[0, 1].map((i) => (
        <path key={i} d={`M428 ${62 + i * 76} v32 M424 ${90 + i * 76} l4 4 l4 -4`} fill="none" stroke={C.line} />
      ))}
    </>
  )
}

function DesignSystem() {
  const swatches = [
    { fill: C.amber, label: 'amber' },
    { fill: C.deep, label: 'deep' },
    { fill: C.text, label: 'text' },
    { fill: C.muted, label: 'muted' },
    { fill: '#17171a', label: 'surface' },
  ]
  const spacing = [4, 8, 12, 16, 24]
  const spacingX = rowX(
    316,
    spacing.map((s) => s * 2),
    8,
  )
  return (
    <>
      {swatches.map((s, i) => (
        <g key={s.label}>
          <rect x={20 + i * 56} y="20" width="44" height="44" rx="8" fill={s.fill} stroke={C.line} />
          <text className="mono" x={20 + i * 56} y="80" fontSize="9.5" fill={C.muted}>
            {s.label}
          </text>
        </g>
      ))}
      <text className="sans" x="20" y="178" fontSize="72" fontWeight="650" letterSpacing="-3" fill={C.text}>
        Aa
      </text>
      <text className="display" x="128" y="178" fontSize="72" fill={C.amber}>
        Aa
      </text>
      <text className="mono" x="20" y="206" fontSize="10" fill={C.muted}>
        Inter · Space Grotesk
      </text>
      <rect x="316" y="20" width="150" height="38" rx="19" fill={C.amber} />
      <text className="sans" x="391" y="43.5" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.ink}>
        {contact.cta} →
      </text>
      <rect x="316" y="76" width="46" height="26" rx="13" fill={C.soft} stroke={C.amber} />
      <circle cx="349" cy="89" r="9" fill={C.amber} />
      <text className="mono" x="374" y="93" fontSize="11" fill={C.muted}>
        {stack.art.toggle}
      </text>
      <rect x="316" y="120" width="184" height="36" rx="8" fill="none" stroke={C.line} />
      <text className="mono" x="330" y="142" fontSize="11" fill={C.muted}>
        {stack.art.email}
      </text>
      <line x1="428" y1="130" x2="428" y2="146" stroke={C.amber} strokeWidth="1.5" />
      {spacing.map((s, i) => {
        const x = spacingX[i]
        return (
          <g key={s}>
            <rect x={x} y="176" width={s * 2} height="10" fill={C.soft} stroke={C.amber} strokeOpacity="0.6" />
            <text className="mono" x={x} y="204" fontSize="9" fill={C.muted}>
              {s}
            </text>
          </g>
        )
      })}
    </>
  )
}

function FrontEnd() {
  const lines: [string, string][][] = [
    [
      [C.punct, '<'],
      [C.amber, 'Card'],
    ],
    [
      [C.attr, '  title'],
      [C.punct, '='],
      [C.str, `"${featured.title}"`],
    ],
    [
      [C.attr, '  tags'],
      [C.punct, '={'],
      [C.text, 'tags'],
      [C.punct, '}'],
    ],
    [
      [C.attr, '  onOpen'],
      [C.punct, '={'],
      [C.text, 'open'],
      [C.punct, '}'],
    ],
    [[C.punct, '/>']],
  ]
  const tagW = featuredTags.map((tag) => tag.length * 5.4 + 14)
  const tagX = rowX(350, tagW, 6)
  /** The launch badge grows with its word ("Live", "En ligne"), right edge fixed */
  const liveW = stack.art.live.length * 6.4 + 34
  return (
    <>
      <rect x="20" y="14" width="280" height="212" rx="8" fill={C.panel} stroke={C.faint} />
      <rect x="21" y="53" width="278" height="24" fill={C.soft} />
      {lines.map((tokens, i) => (
        <g key={i}>
          <text className="mono" x="36" y={46 + i * 24} fontSize="11" fill={C.punct}>
            {i + 1}
          </text>
          <text className="mono" x="58" y={46 + i * 24} fontSize="12.5" xmlSpace="preserve">
            {tokens.map(([fill, t], k) => (
              <tspan key={k} fill={fill}>
                {t}
              </tspan>
            ))}
          </text>
        </g>
      ))}
      <text className="mono" x="58" y="196" fontSize="11" fill={C.punct}>
        {'// React + TypeScript'}
      </text>
      {/* Launch: the site is online */}
      <rect x={288 - liveW} y="26" width={liveW} height="20" rx="10" fill={C.soft} stroke={C.amber} strokeOpacity="0.7" />
      <circle cx={302 - liveW} cy="36" r="3.5" fill={C.amber} />
      <text className="mono" x={312 - liveW} y="40" fontSize="10.5" fill={C.amber}>
        {stack.art.live}
      </text>
      <path d="M306 120 h20 M321 115 l5 5 l-5 5" fill="none" stroke={C.amber} strokeDasharray="3 3" />
      {/* The rendered component */}
      <rect x="334" y="24" width="166" height="192" rx="12" fill="#151413" stroke={C.cardEdge} />
      <text className="mono" x="350" y="46" fontSize="10" fill={C.amber}>
        01
      </text>
      <text className="mono" x="484" y="46" textAnchor="end" fontSize="11" fill={C.muted}>
        ↗
      </text>
      <text className="sans" x="350" y="150" fontSize="28" fontWeight="700" letterSpacing="-1.2" fill={C.text}>
        {featured.title}
      </text>
      <rect x="350" y="162" width="120" height="6" rx="2" fill={C.line} />
      <rect x="350" y="174" width="88" height="6" rx="2" fill={C.faint} />
      {featuredTags.map((tag, i) => {
        const w = tagW[i]
        const x = tagX[i]
        return (
          <g key={tag}>
            <rect x={x} y="190" width={w} height="16" rx="8" fill="none" stroke={C.line} />
            <text className="mono" x={x + w / 2} y="201" textAnchor="middle" fontSize="8.5" fill={C.muted}>
              {tag}
            </text>
          </g>
        )
      })}
    </>
  )
}

const ART = [Brief, Wireframe, DesignSystem, FrontEnd]

export function LayerArt({ index }: { index: number }) {
  const Art = ART[index] ?? Wireframe
  return (
    <svg className="art" viewBox="0 0 520 240" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  )
}
