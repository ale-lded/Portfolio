import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { race as copy } from '../../content'
import { leaveBackstage } from '../../lib/backstage'
import { SETUPS, TYRES, type SetupId, type TyreId } from '../../game/car'
import { Game, type GamePhase, type Hud, type Result } from '../../game/game'
import { formatTime } from '../../game/format'
import { add, cleanName, load, qualifies, type Entry } from '../../game/leaderboard'
import './Race.css'

const TYRE_IDS: TyreId[] = ['soft', 'medium', 'hard']
const SETUP_IDS: SetupId[] = ['speed', 'balanced', 'corner']

/** Bars on the choice cards, read from the specs so they never drift from the physics. */
const maxOf = (values: number[]) => Math.max(...values)
const TYRE_BARS = (() => {
  const grip = maxOf(TYRE_IDS.map((t) => TYRES[t].grip))
  const wear = maxOf(TYRE_IDS.map((t) => TYRES[t].wear))
  return Object.fromEntries(
    TYRE_IDS.map((t) => [t, [TYRES[t].grip / grip, 1 - (TYRES[t].wear / wear) * 0.85]]),
  ) as Record<TyreId, [number, number]>
})()
const SETUP_BARS = (() => {
  const speed = maxOf(SETUP_IDS.map((s) => SETUPS[s].vmax))
  const handling = maxOf(SETUP_IDS.map((s) => SETUPS[s].steer * SETUPS[s].grip))
  return Object.fromEntries(
    SETUP_IDS.map((s) => [s, [SETUPS[s].vmax / speed, (SETUPS[s].steer * SETUPS[s].grip) / handling]]),
  ) as Record<SetupId, [number, number]>
})()

/** The minigame: the canvas, and the menus and HUD laid over it. */
export function Race({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const [phase, setPhase] = useState<GamePhase>('select')
  const [tyre, setTyre] = useState<TyreId>('medium')
  const [setup, setSetup] = useState<SetupId>('balanced')
  const [board, setBoard] = useState<Entry[]>(load)
  const [result, setResult] = useState<Result | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [go, setGo] = useState(0)

  useEffect(() => {
    const hud = hudRef.current!
    const el = (k: string) => hud.querySelector<HTMLElement>(`[data-hud="${k}"]`)!
    const fields = {
      lap: el('lap'),
      time: el('time'),
      lapTime: el('lapTime'),
      best: el('best'),
      wear: el('wear'),
      speed: el('speed'),
      lights: el('lights'),
    }
    const set = (node: HTMLElement, text: string) => {
      if (node.textContent !== text) node.textContent = text
    }
    let lastPhase: GamePhase = 'select'
    const game = new Game(canvasRef.current!, {
      phase: (p) => {
        // "Go!" only when the lights go out, not when coming back from a pause
        if (p === 'racing' && lastPhase === 'countdown') setGo((n) => n + 1)
        lastPhase = p
        setPhase(p)
      },
      hud: (h: Hud) => {
        set(fields.lap, `${h.lap}/${h.laps}`)
        set(fields.time, formatTime(h.time))
        set(fields.lapTime, formatTime(h.lapTime))
        set(fields.best, h.best ? formatTime(h.best) : '–:––.–––')
        set(fields.speed, String(Math.round(h.speed * 0.5)))
        fields.wear.style.setProperty('--left', (1 - h.wear).toFixed(3))
        fields.wear.dataset.low = h.wear > 0.6 ? 'true' : 'false'
        fields.lights.dataset.lit = String(h.lights)
      },
      finish: (r) => {
        setResult(r)
        setSaved(null)
        setName('')
      },
    })
    gameRef.current = game
    return () => {
      game.dispose()
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    gameRef.current?.setActive(active)
  }, [active])

  // Keyboard focus follows the screen
  useEffect(() => {
    if (!active) return
    if (phase === 'select') startRef.current?.focus({ preventScroll: true })
    if (phase === 'countdown' || phase === 'racing') (document.activeElement as HTMLElement | null)?.blur()
  }, [phase, active])

  const start = () => {
    setResult(null)
    gameRef.current?.start({ tyre, setup })
  }
  const toSelect = () => {
    setResult(null)
    gameRef.current?.toSelect()
  }
  const restart = () => {
    setResult(null)
    gameRef.current?.restart()
  }

  const canSave = !!result && saved === null && qualifies(result.time, board)
  const save = () => {
    if (!result) return
    const at = Date.now()
    setBoard(add({ name: cleanName(name) || '???', time: result.time, best: result.best, ...result.choice, at }))
    setSaved(at)
  }

  const showHud = phase === 'countdown' || phase === 'racing' || phase === 'paused' || phase === 'finished'

  return (
    <div className="race" data-phase={phase}>
      <canvas className="race__canvas" ref={canvasRef} aria-hidden="true" />

      {/* HUD: always in the DOM, so the game can write into it every frame */}
      <div className="race__hud mono" ref={hudRef} hidden={!showHud} aria-hidden="true">
        <div className="race__hud-main">
          <div className="race__stat race__stat--lap">
            <span>{copy.lap}</span>
            <strong data-hud="lap">1/3</strong>
          </div>
          <div className="race__stat">
            <span>{copy.time}</span>
            <strong data-hud="time">0:00.000</strong>
          </div>
          <div className="race__stat race__stat--small">
            <span>{copy.lap}</span>
            <b data-hud="lapTime">0:00.000</b>
            <span>{copy.best}</span>
            <b data-hud="best">–:––.–––</b>
          </div>
        </div>
        <div className="race__hud-car">
          <span>
            {copy.wear} · {copy.tyres[tyre].name}
          </span>
          <i className="race__wear" data-hud="wear" />
        </div>
        <div className="race__speed">
          <strong data-hud="speed">0</strong> {copy.speedUnit}
        </div>
        <div className="race__lights" data-hud="lights" data-lit="0">
          <i />
          <i />
          <i />
        </div>
        {go > 0 && (
          <p key={go} className="race__go">
            {copy.go}
          </p>
        )}
      </div>

      {phase === 'select' && (
        <div className="race__screen race__screen--select">
          <div className="race__panel race__panel--choose">
            <p className="race__kicker mono">{copy.subtitle}</p>
            <h2 className="race__title">{copy.title}</h2>

            <Choices
              label={copy.tyresLabel}
              ids={TYRE_IDS}
              value={tyre}
              onChange={setTyre}
              item={(t) => copy.tyres[t]}
              bars={(t) => [
                [copy.stats.grip, TYRE_BARS[t][0]],
                [copy.stats.life, TYRE_BARS[t][1]],
              ]}
            />
            <Choices
              label={copy.setupLabel}
              ids={SETUP_IDS}
              value={setup}
              onChange={setSetup}
              item={(s) => copy.setups[s]}
              bars={(s) => [
                [copy.stats.speed, SETUP_BARS[s][0]],
                [copy.stats.handling, SETUP_BARS[s][1]],
              ]}
            />

            <button type="button" className="race__go-btn" ref={startRef} onClick={start}>
              {copy.start} <span aria-hidden="true">→</span>
            </button>
            <Controls />
          </div>
          <Board board={board} highlight={null} />
        </div>
      )}

      {phase === 'paused' && (
        <div className="race__screen race__screen--center">
          <div className="race__panel race__panel--menu">
            <h2 className="race__title">{copy.paused}</h2>
            <MenuButton autoFocus onClick={() => gameRef.current?.resume()} kbd="esc">
              {copy.resume}
            </MenuButton>
            <MenuButton onClick={restart} kbd="r">
              {copy.restart}
            </MenuButton>
            <MenuButton onClick={toSelect}>{copy.change}</MenuButton>
            <MenuButton onClick={leaveBackstage}>{copy.quit}</MenuButton>
          </div>
        </div>
      )}

      {phase === 'finished' && result && (
        <div className="race__screen race__screen--center">
          <div className="race__panel race__panel--result">
            <p className="race__kicker mono">{copy.finish}</p>
            <p className="race__total">{formatTime(result.time)}</p>
            <ol className="race__laps mono">
              {result.laps.map((t, i) => (
                <li key={i} data-best={t === result.best}>
                  <span>
                    {copy.lap} {i + 1}
                  </span>
                  <span>{formatTime(t)}</span>
                </li>
              ))}
            </ol>
            <p className="race__combo mono">
              {copy.tyres[result.choice.tyre].name} · {copy.setups[result.choice.setup].name}
            </p>

            {canSave && (
              <form
                className="race__save"
                onSubmit={(e) => {
                  e.preventDefault()
                  save()
                }}
              >
                <label>
                  <span className="race__record mono">{copy.record}</span>
                  <span className="race__initials-label">{copy.initials}</span>
                  <input
                    className="race__initials mono"
                    value={name}
                    onChange={(e) => setName(cleanName(e.target.value))}
                    maxLength={3}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="AAA"
                  />
                </label>
                <button type="submit" className="race__go-btn" disabled={!name}>
                  {copy.save}
                </button>
              </form>
            )}

            {!canSave && (
              <div className="race__actions">
                <MenuButton autoFocus onClick={restart} kbd="r">
                  {copy.again}
                </MenuButton>
                <MenuButton onClick={toSelect}>{copy.change}</MenuButton>
              </div>
            )}
          </div>
          <Board board={board} highlight={saved} />
        </div>
      )}
    </div>
  )
}

type ChoicesProps<T extends string> = {
  label: string
  ids: T[]
  value: T
  onChange: (id: T) => void
  item: (id: T) => { name: string; text: string }
  bars: (id: T) => [string, number][]
}

function Choices<T extends string>({ label, ids, value, onChange, item, bars }: ChoicesProps<T>) {
  return (
    <fieldset className="race__choices">
      <legend className="mono">{label}</legend>
      {ids.map((id) => {
        const { name, text } = item(id)
        return (
          <label key={id} className="race__choice" data-on={id === value}>
            <input type="radio" name={label} checked={id === value} onChange={() => onChange(id)} />
            <span className="race__choice-name">{name}</span>
            <span className="race__choice-text">{text}</span>
            <span className="race__bars">
              {bars(id).map(([bar, v]) => (
                <span key={bar} className="race__bar mono">
                  {bar}
                  <i style={{ '--v': v.toFixed(3) } as CSSProperties} />
                </span>
              ))}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

function Board({ board, highlight }: { board: Entry[]; highlight: number | null }) {
  return (
    <div className="race__panel race__panel--board">
      <p className="race__kicker mono">{copy.board}</p>
      {board.length ? (
        <ol className="race__board">
          {board.map((e, i) => (
            <li key={e.at} data-new={e.at === highlight}>
              <span className="race__rank mono">{i + 1}</span>
              <span className="race__name mono">{e.name}</span>
              <span className="race__time mono">{formatTime(e.time)}</span>
              <span className="race__car mono">
                {copy.tyres[e.tyre]?.name} · {copy.setups[e.setup]?.name}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="race__empty">{copy.empty}</p>
      )}
      <p className="race__local mono">{copy.local}</p>
    </div>
  )
}

function Controls() {
  return (
    <ul className="race__controls mono">
      {copy.controls.map(([keys, what]) => (
        <li key={keys}>
          <kbd>{keys}</kbd> {what}
        </li>
      ))}
    </ul>
  )
}

function MenuButton({
  children,
  onClick,
  kbd,
  autoFocus,
}: {
  children: ReactNode
  onClick: () => void
  kbd?: string
  autoFocus?: boolean
}) {
  return (
    <button type="button" className="race__menu-btn" onClick={onClick} autoFocus={autoFocus}>
      <span>{children}</span>
      {kbd && <kbd className="mono">{kbd}</kbd>}
    </button>
  )
}
