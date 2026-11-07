/**
 * Every piece of copy on the site, in one place: components never hard-code text.
 * When the site becomes multilingual, this file is the one to split per language.
 * Fields marked TODO are placeholders: replace them with your real content.
 */

export const person = {
  name: 'Alessio Mura',
  initials: 'AM',
  /** Service line: the hero title, and the text that transforms on scroll */
  tagline: 'Digital product creator',
  role: 'Full-stack designer and developer',
  // TODO: placeholder intro line
  lead: '“I design clear interfaces and build them, from pixel to database.”',
}

export const nav = {
  label: 'Main',
  home: `${person.name}, back to top`,
  links: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Contact', href: '#contact' },
  ],
}

export const hero = {
  stageLabel: 'Introduction and work',
  meta: 'Portfolio — 2026',
  hint: 'scroll',
  /** The four steps of the hero sequence, shown bottom left while it plays */
  phases: ['01 — Crumbling', '02 — Code → binary', '03 — Recomposing', '04 — Work'],
}

export type Project = {
  title: string
  description: string
  tags: string[]
}

export const work = {
  heading: 'Selected work',
}

/** Sample projects. */
export const projects: Project[] = [
  {
    title: 'Atlas',
    description: 'A personal budgeting app, from prototype to release.',
    tags: ['Figma', 'React Native'],
  },
  {
    title: 'Nerina',
    description: 'Visual identity and website for a small winery.',
    tags: ['Branding', 'HTML, CSS'],
  },
  {
    title: 'Orbita',
    description: 'A real-time dashboard for urban logistics.',
    tags: ['Design system', 'TypeScript'],
  },
]

export const about = {
  label: '02 — About',
  // TODO: placeholder heading and bio, to be rewritten in your own voice
  heading: 'I design digital products and take them all the way to production.',
  bio: [
    'TODO — Placeholder bio. I’m Alessio, a full-stack designer and developer: I work where product meets code, from prototypes and interfaces to the data behind them.',
  ],
}

export type Skill = {
  name: string
  note?: string
  /** One line shown when the layer is lit in the exploded view */
  detail: string
}

/**
 * The stack sequence between "About" and "Contact": the skills become four
 * stacked layers, from the interface on top down to the data.
 * TODO: intro, details and outro are placeholders, to be rewritten in your own voice.
 */
export const stack = {
  label: 'The stack',
  intro: {
    heading: 'Four layers, one product.',
    text: 'Every project goes through the same layers. I handle all of them, from the first sketch to the data.',
  },
  skills: [
    {
      name: 'Product design',
      note: 'Research, prototypes',
      detail: 'Flows, wireframes and prototypes: working out what to build, and why.',
    },
    {
      name: 'Design system',
      note: 'Tokens, components',
      detail: 'Shared rules and components that keep every screen consistent.',
    },
    {
      name: 'Front end',
      note: 'React, TypeScript',
      detail: 'Fast, accessible interfaces, polished down to the last pixel.',
    },
    {
      name: 'Back end & database',
      note: 'APIs, SQL',
      detail: 'Solid APIs and data that hold the product up as it grows.',
    },
  ] satisfies Skill[],
  outro: {
    heading: 'From pixel to database.',
    text: 'One person for the whole stack.',
  },
  /** The four steps of the stack sequence, shown bottom left while it plays */
  phases: ['01 — Assembly', '02 — Exploded view', '03 — Compression', '04 — The stack'],
  /** Words drawn inside the layer illustrations (LayerArt) */
  art: {
    flow: ['Research', 'Flows', 'Prototype'],
    /** Sample switch label and input value in the design-system plate */
    toggle: 'on',
    email: 'name@studio.com',
    table: 'projects',
    columns: ['ID', 'PROJECT', 'STATUS'],
    /** Status of each sample project: true is live */
    status: [
      { live: true, label: 'live' },
      { live: false, label: 'in progress' },
      { live: true, label: 'live' },
    ],
  },
}

export const contact = {
  label: '03 — Contact',
  heading: 'Have a project in mind?',
  cta: 'Get in touch',
  // TODO: put your real email here
  email: 'hello@example.com',
  // TODO: put your real profiles here (leave the array empty to hide them)
  links: [
    { label: 'LinkedIn', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
  backToTop: 'Back to top',
}

export const backstage = {
  /** Accessible name of the bug hidden in the hero */
  bug: 'A pixel out of place',
  label: 'Backstage',
  back: 'Back to the stage',
}

/** The minigame behind the stage: a 3-lap time trial. */
export const race = {
  title: 'Backstage GP',
  subtitle: '// 1 lap · time trial',
  tyresLabel: 'Tyres',
  setupLabel: 'Setup',
  tyres: {
    soft: { name: 'Soft', text: 'Most grip. Fades before the line.' },
    medium: { name: 'Medium', text: 'A bit of everything.' },
    hard: { name: 'Hard', text: 'Less grip, lasts the race.' },
  },
  setups: {
    speed: { name: 'Top speed', text: 'Flies on the straights, lazy in the turns.' },
    balanced: { name: 'Balanced', text: 'No surprises.' },
    corner: { name: 'Cornering', text: 'Sharp in the turns, short on top speed.' },
  },
  stats: { grip: 'Grip', life: 'Life', speed: 'Speed', handling: 'Handling' },
  start: 'Start race',
  controls: [
    ['W A S D', 'drive'],
    ['Space', 'handbrake'],
    ['Esc', 'pause'],
    ['R', 'restart'],
  ],
  board: 'Top 3',
  local: 'Saved in this browser',
  lap: 'Lap',
  time: 'Time',
  best: 'Best',
  record: 'Record',
  yourBest: 'Your best',
  beaten: 'New record',
  toRecord: 'to the record',
  savedAs: 'Saved as',
  wear: 'Tyres',
  speedUnit: 'km/h',
  go: 'Go',
  paused: 'Paused',
  resume: 'Resume',
  restart: 'Restart',
  change: 'Change car',
  quit: 'Back to the stage',
  finish: 'Finish',
  podium: 'You made the podium',
  initials: 'Your initials',
  save: 'Save',
  again: 'Race again',
}

/** The cipher terminal, opened by a stray cursor: somewhere in the hero, and after the copyright in the footer. */
export const terminal = {
  /** Accessible name of the hidden trigger */
  trigger: 'A stray cursor',
  title: 'cipher.sys',
  label: 'Cipher terminal',
  intro: 'Write a secret message, send the code to a friend, they open it here.',
  modeLabel: 'Mode',
  modes: { encrypt: 'Encrypt', decrypt: 'Decrypt' },
  keyLabel: 'Key (optional)',
  keyPlaceholder: 'a word you both know',
  keyHint: 'Leave it empty and anyone with this site can open the message.',
  inputLabel: { encrypt: 'Your message', decrypt: 'Code to decrypt' },
  inputPlaceholder: {
    encrypt: 'Type a secret message…',
    decrypt: 'Paste a code that starts with AM:',
  },
  run: { encrypt: 'Encrypt message', decrypt: 'Decrypt code' },
  runHint: '⌘ ↵',
  clear: 'Clear',
  output: 'Result',
  idle: 'The result will appear here.',
  copy: 'Copy',
  copied: 'Copied ✓',
  copyFailed: 'Selected: press ⌘C',
  /** Encrypt mode only: puts the code back in, in decrypt mode, to check it opens */
  check: 'Test it',
  /** Shown in place of the result when something goes wrong */
  errors: {
    empty: 'Nothing to process yet.',
    format: 'Not a valid code: codes start with AM:',
    key: 'Access denied: wrong key.',
  },
  /** Status line when a pasted code switches the mode by itself */
  detected: 'Code detected: switched to Decrypt.',
  disclaimer: 'A toy cipher for notes between friends. Not for passwords.',
  close: 'Close',
}
