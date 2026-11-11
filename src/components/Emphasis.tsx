import { Fragment } from 'react'

/** Turns the **double asterisks** of the copy into <strong>, the rest stays plain text. */
export function Emphasis({ text }: { text: string }) {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))
}
