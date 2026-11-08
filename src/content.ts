/**
 * Every piece of copy on the site, in one place: components never hard-code text.
 * When the site becomes multilingual, this file is the one to split per language.
 * Fields marked TODO are still waiting for real content.
 */

export const person = {
  name: 'Alessio Mura',
  initials: 'AM',
  /** Service line: the hero title, and the text that transforms on scroll */
  tagline: 'Websites, made to measure.',
  role: 'Web designer & developer',
  lead: '“I listen first, then design and build a website that fits your business, down to the smallest detail.”',
}

export const nav = {
  label: 'Main',
  home: `${person.name}, back to top`,
  links: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ],
}

export const hero = {
  stageLabel: 'Introduction and work',
  meta: 'Lyon, France — 2026',
  hint: 'scroll',
  /** The four steps of the hero sequence, shown bottom left while it plays */
  phases: ['01 — Crumbling', '02 — Code → binary', '03 — Recomposing', '04 — Work'],
}

export type Project = {
  title: string
  description: string
  tags: string[]
  /** Shown on the card in place of the arrow, e.g. "In progress" */
  status?: string
  /** Where the card leads: leave it out and the card is not a link */
  href?: string
}

export const work = {
  heading: 'Selected work',
}

export const projects: Project[] = [
  {
    title: 'Folio',
    description: 'PDF tools that run in your browser. Your files never leave your device.',
    tags: ['React', 'pdf-lib', 'Open source'],
    status: 'In progress',
    // TODO: link to the live app or the repository once it is public
  },
  {
    title: 'This site',
    description: 'My portfolio, built as a playground: particles, scroll stories and a few secrets.',
    tags: ['React', 'TypeScript', 'Canvas'],
  },
  {
    // TODO: once the client agrees, use their name and link the page
    title: 'Case study',
    description: 'A new case-study page for a software consultancy, designed to fit their existing site.',
    tags: ['Web design', 'Front end'],
  },
]

export const about = {
  label: '02 — About',
  heading: 'I’ve run a business. Now I build websites for them.',
  bio: [
    'I studied computer science, then at twenty I took a three-month job in a pizzeria in France. I never left. I went on to open my own restaurant, and running it taught me what every business owner knows: people remember the details.',
    'Then the itch for tech came back. I sold the restaurant, and my partner and I set off on two bikes: fifteen months, thirty countries, fifteen thousand kilometres. Somewhere along the road I decided to become a web developer, and I’ve been learning the best tools of the trade ever since.',
    'Today I’m based near Lyon, with plenty of ideas and the patience of someone who’s been on the other side of the counter. I love two things: the big picture and the small details. Your website deserves both.',
  ],
  /** The film photo beside the bio: opens larger on click */
  photo: {
    src: '/photos/fuji.webp',
    width: 2000,
    height: 1360,
    alt: 'Alessio standing with his loaded touring bike by a lake, Mount Fuji rising above the clouds behind him.',
    caption: 'Mount Fuji, a stop on our ride.',
    film: 'Pentax MX (1976) · Fujifilm 35 mm',
    open: 'Open the photo',
    close: 'Close',
    story: 'I still shoot film: every frame counts, so you take your time with it. I try to build websites the same way.',
  },
}

export type Service = {
  name: string
  text: string
  /** A smaller line under the text */
  note?: string
}

export const services = {
  label: '03 — Services',
  heading: 'What I can build for you.',
  items: [
    {
      name: 'Redesign',
      text: 'Your current site, rebuilt to be modern, fast and easy to find. Same business, a much better first impression.',
    },
    {
      name: 'Showcase websites',
      text: 'A clear, beautiful home for your business online: who you are, what you do, and how to reach you.',
    },
    {
      name: 'Web apps',
      text: 'Custom tools for the way you work: bookings, client areas, dashboards.',
      note: 'For larger projects I team up with a trusted full-stack developer, so timelines stay short and realistic.',
    },
  ] satisfies Service[],
}

export type Step = {
  name: string
  note?: string
  /** One line shown when the layer is lit in the exploded view */
  detail: string
}

/**
 * The scroll sequence between "Services" and "Contact": the way of working,
 * as four stacked layers, from the first call down to launch day.
 */
export const stack = {
  label: 'How I work',
  intro: {
    heading: 'Four steps, no surprises.',
    text: 'From our first call to launch day, you always know where we are and what comes next.',
  },
  skills: [
    {
      name: 'Listen',
      note: 'Call, needs, goals',
      detail: 'We talk about your business, your customers and what your site needs to do. No jargon, no commitment.',
    },
    {
      name: 'Plan',
      note: 'Options, structure, concept',
      detail: 'We weigh the options together and agree on the structure and the key ideas before a single pixel is drawn.',
    },
    {
      name: 'Design',
      note: 'Mockups, revisions included',
      detail: 'You see your site before it’s built, and we refine it until it feels like yours.',
    },
    {
      name: 'Build & launch',
      note: 'Development, launch, care',
      detail: 'I build it fast, accessible and easy to find on Google, put it online, and can keep it up to date afterwards.',
    },
  ] satisfies Step[],
  outro: {
    heading: 'From first call to launch day.',
    text: 'One person you can talk to, all the way through.',
  },
  /** The four steps of the stack sequence, shown bottom left while it plays */
  phases: ['01 — Assembly', '02 — Exploded view', '03 — Compression', '04 — The method'],
  /** Words drawn inside the layer illustrations (LayerArt) */
  art: {
    /** The notes taken during the first call */
    brief: {
      title: 'First call',
      questions: ['Who are your customers?', 'What should the site do?', 'What do you love, what not?'],
      answer: 'More bookings, less phone',
    },
    /** The site map drawn while planning */
    flow: ['Home', 'Services', 'Contact'],
    /** Sample switch label and input value in the design plate */
    toggle: 'on',
    email: 'name@studio.com',
    /** The launch badge on the last plate */
    live: 'Live',
  },
}

export const contact = {
  label: '04 — Contact',
  heading: 'Let’s talk about your website.',
  cta: 'Write to me',
  reply: 'I’ll get back to you quickly.',
  // TODO: switch to an address on your own domain when you have one
  email: 'commerciale.alessiomura@gmail.com',
  /** Profiles: a link with an empty href stays hidden */
  links: [
    { label: 'GitHub', href: 'https://github.com/ale-lded' },
    // TODO: add your Malt and LinkedIn profiles
    { label: 'Malt', href: '' },
    { label: 'LinkedIn', href: '' },
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
