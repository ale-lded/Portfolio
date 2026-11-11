import { Fragment } from 'react'

const MARK = /\*\*(.+?)\*\*/

/**
 * Turns the **double asterisks** of the copy into an element (<strong> by default),
 * the rest stays plain text.
 */
export function Emphasis({ text, as: Tag = 'strong', className }: { text: string; as?: 'strong' | 'em'; className?: string }) {
  return text.split(MARK).map((part, i) =>
    i % 2 ? (
      <Tag key={i} className={className}>
        {part}
      </Tag>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/** The same copy with its asterisks dropped, where it is shown as plain text. */
export function Plain({ text }: { text: string }) {
  return text.replace(new RegExp(MARK, 'g'), '$1')
}
