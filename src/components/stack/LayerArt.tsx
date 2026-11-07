import { projects } from '../../content'

/**
 * The drawing on top of each layer, one per skill, at a fixed 520×240 design size
 * (the SVG scales with the plate). Purely decorative: the skill text lives in the plate header.
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

/** Lays items out left to right: the x of each one, given their widths and a gap. */
const rowX = (start: number, widths: number[], gap: number) =>
  widths.map((_, i) => start + widths.slice(0, i).reduce((sum, w) => sum + w + gap, 0))

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
      {['Ricerca', 'Flussi', 'Prototipo'].map((label, i) => {
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
        Scrivimi →
      </text>
      <rect x="316" y="76" width="46" height="26" rx="13" fill={C.soft} stroke={C.amber} />
      <circle cx="349" cy="89" r="9" fill={C.amber} />
      <text className="mono" x="374" y="93" fontSize="11" fill={C.muted}>
        attivo
      </text>
      <rect x="316" y="120" width="184" height="36" rx="8" fill="none" stroke={C.line} />
      <text className="mono" x="330" y="142" fontSize="11" fill={C.muted}>
        nome@studio.it
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
  const tagW = featured.tags.map((tag) => tag.length * 5.4 + 14)
  const tagX = rowX(350, tagW, 6)
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
      {featured.tags.map((tag, i) => {
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

function Database() {
  const status = ['online', 'in corso', 'online']
  return (
    <>
      <text className="mono" x="20" y="30" fontSize="12" xmlSpace="preserve">
        <tspan fill={C.amber}>SELECT</tspan>
        <tspan fill={C.text}> * </tspan>
        <tspan fill={C.amber}>FROM</tspan>
        <tspan fill={C.text}> progetti;</tspan>
      </text>
      <rect x="20" y="46" width="320" height="140" rx="8" fill="none" stroke={C.line} />
      {[
        ['ID', 34],
        ['PROGETTO', 74],
        ['STATO', 250],
      ].map(([label, x]) => (
        <text key={label} className="mono" x={x} y="66" fontSize="9.5" fill={C.muted}>
          {label}
        </text>
      ))}
      <line x1="20" y1="76" x2="340" y2="76" stroke={C.line} />
      <rect x="21" y="77" width="318" height="36" fill={C.soft} />
      {projects.slice(0, 3).map((project, i) => {
        const y = 100 + i * 36
        return (
          <g key={project.title}>
            {i > 0 && <line x1="20" y1={y - 23} x2="340" y2={y - 23} stroke={C.faint} />}
            <text className="mono" x="34" y={y} fontSize="10.5" fill={C.muted}>
              {String(i + 1).padStart(2, '0')}
            </text>
            <text className="sans" x="74" y={y} fontSize="13" fontWeight="500" fill={C.text}>
              {project.title}
            </text>
            <circle cx="254" cy={y - 4} r="3" fill={status[i] === 'online' ? C.amber : C.muted} />
            <text className="mono" x="264" y={y} fontSize="10.5" fill={C.muted}>
              {status[i]}
            </text>
          </g>
        )
      })}
      <text className="mono" x="20" y="214" fontSize="10.5" xmlSpace="preserve">
        <tspan fill={C.muted}>GET /api/progetti</tspan>
        <tspan fill={C.amber}> 200 OK</tspan>
        <tspan fill={C.muted}> · 38 ms</tspan>
      </text>
      {/* Database cylinder */}
      <ellipse cx="440" cy="40" rx="52" ry="14" fill={C.soft} stroke={C.amber} />
      <path d="M388 40 V176 M492 40 V176" stroke={C.amber} />
      {[85, 130, 176].map((y) => (
        <path key={y} d={`M388 ${y} a52 14 0 0 0 104 0`} fill="none" stroke={C.amber} strokeOpacity={y === 176 ? 1 : 0.5} />
      ))}
      <text className="mono" x="440" y="206" textAnchor="middle" fontSize="9.5" fill={C.muted}>
        database
      </text>
    </>
  )
}

const ART = [Wireframe, DesignSystem, FrontEnd, Database]

export function LayerArt({ index }: { index: number }) {
  const Art = ART[index] ?? Wireframe
  return (
    <svg className="art" viewBox="0 0 520 240" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  )
}
