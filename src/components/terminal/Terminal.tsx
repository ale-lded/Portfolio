import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { decrypt, encrypt, looksEncrypted } from '../../cipher/cipher'
import { terminal } from '../../content'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useScramble } from './useScramble'
import './Terminal.css'

type Mode = 'encrypt' | 'decrypt'

type Output =
  | { kind: 'idle' }
  | { kind: 'ok'; text: string }
  | { kind: 'error'; text: string }

type CopyState = 'idle' | 'copied' | 'failed'

/** An old CRT switching on: a bright line opens into the picture. Played backwards to close. */
const POWER_ON: Keyframe[] = [
  { transform: 'scale(0.04, 0.004)', filter: 'brightness(2)', opacity: 0 },
  { transform: 'scale(1, 0.004)', filter: 'brightness(2)', opacity: 1, offset: 0.4 },
  { transform: 'none', filter: 'none', opacity: 1 },
]

type TerminalProps = {
  open: boolean
  onClose: () => void
}

/** The cipher terminal: a modal dialog to encrypt and decrypt short messages. */
export function Terminal({ open, onClose }: TerminalProps) {
  const reduced = useReducedMotion()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLPreElement>(null)

  const [mode, setMode] = useState<Mode>('encrypt')
  const [key, setKey] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<Output>({ kind: 'idle' })
  const [status, setStatus] = useState('')
  const [copy, setCopy] = useState<CopyState>('idle')
  /** Bumped on every run, so the output animation replays even for the same text */
  const [runId, setRunId] = useState(0)

  const outputText = output.kind === 'idle' ? '' : output.text
  const shown = useScramble(outputText, runId, reduced)

  // ---------- Power on / off ----------
  useEffect(() => {
    const dialog = dialogRef.current!
    const screen = screenRef.current!
    let stale = false

    if (open && !dialog.open) {
      dialog.showModal()
      inputRef.current?.focus()
      if (!reduced) screen.animate(POWER_ON, { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' })
    } else if (!open && dialog.open) {
      const off = reduced
        ? Promise.resolve()
        : screen.animate([...POWER_ON].reverse(), { duration: 340, easing: 'ease-in', fill: 'forwards' }).finished
      off.then(() => {
        if (stale) return
        dialog.close()
        screen.getAnimations().forEach((a) => a.cancel())
      })
    }
    return () => {
      stale = true
    }
  }, [open, reduced])

  // The "Copied" label goes back to "Copy" after a moment
  useEffect(() => {
    if (copy === 'idle') return
    const t = setTimeout(() => setCopy('idle'), 2000)
    return () => clearTimeout(t)
  }, [copy])

  // ---------- Actions ----------
  const switchMode = (next: Mode) => {
    setMode(next)
    setOutput({ kind: 'idle' })
    setStatus('')
  }

  const onInput = (value: string) => {
    setInput(value)
    // Pasting a code in encrypt mode almost always means "open this": switch for them
    if (mode === 'encrypt' && looksEncrypted(value)) {
      setMode('decrypt')
      setStatus(terminal.detected)
    }
  }

  const run = () => {
    setCopy('idle')
    setStatus('')
    setRunId((n) => n + 1)
    if (!input.trim()) return setOutput({ kind: 'error', text: terminal.errors.empty })
    if (mode === 'encrypt') return setOutput({ kind: 'ok', text: encrypt(input, key) })
    const result = decrypt(input, key)
    setOutput(result.ok ? { kind: 'ok', text: result.text } : { kind: 'error', text: terminal.errors[result.reason] })
  }

  const copyOutput = async () => {
    if (output.kind !== 'ok') return
    try {
      await navigator.clipboard.writeText(output.text)
      setCopy('copied')
    } catch {
      // No clipboard access (old browser, insecure origin): select the text so ⌘C works
      const range = document.createRange()
      range.selectNodeContents(outputRef.current!)
      getSelection()?.removeAllRanges()
      getSelection()?.addRange(range)
      setCopy('failed')
    }
  }

  /** Puts a fresh code back in, in decrypt mode: a quick check that it opens before sending it. */
  const feedBack = () => {
    if (output.kind !== 'ok') return
    setInput(output.text)
    switchMode('decrypt')
    inputRef.current?.focus()
  }

  /** Empties the message and the result; the key stays, since it is usually reused. */
  const clear = () => {
    setInput('')
    setOutput({ kind: 'idle' })
    setStatus('')
    setCopy('idle')
    inputRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      run()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="term"
      aria-label={terminal.label}
      // Esc: play the power-off instead of letting the dialog vanish
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      // A click on the backdrop lands on the dialog itself, outside the screen
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="term__screen mono" ref={screenRef} onKeyDown={onKeyDown}>
        <header className="term__bar">
          <span className="term__dot" aria-hidden="true" />
          <span className="term__title">{terminal.title}</span>
          <button type="button" className="term__close" onClick={onClose}>
            {terminal.close} <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className="term__body">
          <p className="term__intro">{terminal.intro}</p>

          <div className="term__modes" role="group" aria-label={terminal.modeLabel}>
            {(['encrypt', 'decrypt'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className="term__mode"
                aria-pressed={mode === m}
                onClick={() => switchMode(m)}
              >
                {terminal.modes[m]}
              </button>
            ))}
          </div>

          <label className="term__field">
            <span className="term__label">{terminal.keyLabel}</span>
            <input
              className="term__input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={terminal.keyPlaceholder}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <span className="term__hint">{terminal.keyHint}</span>
          </label>

          <label className="term__field">
            <span className="term__label">{terminal.inputLabel[mode]}</span>
            <textarea
              ref={inputRef}
              className="term__input term__input--area"
              value={input}
              onChange={(e) => onInput(e.target.value)}
              placeholder={terminal.inputPlaceholder[mode]}
              rows={4}
              spellCheck={mode === 'encrypt'}
            />
          </label>

          <div className="term__actions">
            <button type="button" className="term__btn term__btn--primary" onClick={run}>
              {terminal.run[mode]} <kbd>{terminal.runHint}</kbd>
            </button>
            <button
              type="button"
              className="term__btn"
              onClick={clear}
              disabled={!input && output.kind === 'idle'}
            >
              {terminal.clear}
            </button>
            <span className="term__status" role="status">
              {status}
            </span>
          </div>

          <section className="term__out" data-kind={output.kind} aria-label={terminal.output}>
            <header className="term__out-bar">
              <span className="term__label">{terminal.output}</span>
              <span className="term__out-actions">
                {mode === 'encrypt' && (
                  <button type="button" className="term__btn term__btn--small" onClick={feedBack} disabled={output.kind !== 'ok'}>
                    {terminal.check}
                  </button>
                )}
                <button
                  type="button"
                  className="term__btn term__btn--small"
                  onClick={copyOutput}
                  disabled={output.kind !== 'ok'}
                  data-copy={copy}
                >
                  {copy === 'copied' ? terminal.copied : copy === 'failed' ? terminal.copyFailed : terminal.copy}
                </button>
              </span>
            </header>
            {/* The animated text is for the eyes; screen readers get the final result once */}
            <pre className="term__result" ref={outputRef} aria-hidden="true">
              {output.kind === 'idle' ? <span className="term__idle">{terminal.idle}</span> : shown}
            </pre>
            <p className="sr-only" aria-live="polite">
              {outputText}
            </p>
          </section>

          <p className="term__note">{terminal.disclaimer}</p>
        </div>
      </div>
    </dialog>
  )
}
