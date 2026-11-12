/**
 * The English copy: the reference the other languages (it.ts, fr.ts) must match, field
 * for field. Components never import this file: they import ../content, which picks
 * the language of the page. Fields marked TODO are still waiting for real content.
 */

export const person = {
  name: 'Alessio Mura',
  initials: 'AM',
  /** Service line: the hero title, and the text that transforms on scroll.
   *  The words between **double asterisks** take the light accent */
  tagline: 'Websites, **made to measure.**',
  role: 'Web designer & developer',
  lead: '“I listen first, then design and build a website that fits your business, down to the smallest detail.”',
}

export const nav = {
  label: 'Main',
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
  /** The small line above the title, with a pulsing dot */
  status: 'Available for new projects',
  /** The button under the title, down to the contact section */
  cta: 'Let’s talk about your project',
  /** The four steps of the hero sequence, shown bottom left while it plays.
   *  Counted as 1/4…4/4, so they never read like the section numbers (01 — …) */
  phases: ['1/4 · Crumbling', '2/4 · Code → binary', '3/4 · Recomposing', '4/4 · Work'],
}

/**
 * The code window the title crumbles into: the client's website, written as a TypeScript
 * object. Keep the lines short (about 30 characters), the window is sized on the longest.
 */
export const code = {
  file: 'your-site.ts',
  lang: 'TS',
  /** The client's website as a class, line by line (scene/code.ts colours it). Keep lines short: phones shrink the font to fit the longest */
  lines: [
    '// every detail counts',
    'class YourSite extends Web {',
    "  design = 'made to measure'",
    "  build = 'solid'",
    '  fast = true',
    '  mobile = true',
    '',
    '  onGoogle() {',
    "    return 'page one'",
    '  }',
    '}',
  ],
}

export type Project = {
  title: string
  description: string
  tags: string[]
  /** Shown on the card in place of the arrow, e.g. "In progress" */
  status?: string
  /** Where the card leads: leave it out and the card is not a link */
  href?: string
  /** A button on the card that opens a larger look at the project.
   *  progress: one line under the story (for Folio, the list of its tools) */
  details?: {
    open: string
    image: { src: string; width: number; height: number; alt: string }
    story: string[]
    progress: string
    cta: string
    /** The live app: while empty, the button waits with the "soon" line */
    href: string
    soon: string
    close: string
  }
  /** A button on the card that flips it over, with something written on the back */
  back?: {
    open: string
    heading: string
    /** A line before the secrets */
    intro: string
    items: { name: string; text: string }[]
    /** A line after the secrets, with a link (to the contact section) */
    outro: string
    cta: { label: string; href: string }
    close: string
    /** A note in brackets after the secrets, e.g. where they can be found */
    note: string
  }
}

export const work = {
  heading: '01 — Latest work',
}

export const projects: Project[] = [
  {
    title: 'Folio',
    description: 'Merge, split, compress and sign your PDFs. Free, ad-free, right in your browser.',
    tags: ['React', 'WebAssembly', 'Open source'],
    href: 'https://folio.alessiomura.fr',
    details: {
      open: 'Discover',
      image: {
        src: '/projects/folio.webp',
        width: 2000,
        height: 1050,
        alt: 'The Folio home page: a bookshelf of PDF tools, with the Split tool pulled out and open.',
      },
      story: [
        'One of my latest projects. I built it to always have an easy PDF tool at hand: free, ad-free and with no sign-up.',
        'Everything happens in your browser: your files are never uploaded to a server, never seen by anyone but you. If you need it, use it too.',
      ],
      progress: 'Merge · Split · Reorder · Compress · Sign · Password-protect',
      cta: 'Use Folio for free',
      href: 'https://folio.alessiomura.fr',
      soon: 'Online soon',
      close: 'Close',
    },
  },
  {
    title: 'This site',
    description: 'The site you are looking at, designed and built by me, with two hidden secrets to find.',
    tags: ['React', 'TypeScript', 'Canvas'],
    back: {
      open: 'Find the 2 hidden easter eggs',
      heading: 'Made to measure, down to the details.',
      intro: 'Built with modern tools, with hand-drawn animations. And two surprises:',
      items: [
        {
          name: 'A pixel out of place',
          text: 'Click it, near the spotlight on the first screen, for a one-lap race backstage. Beat the record.',
        },
        {
          name: 'A stray cursor',
          text: 'It hides at the top and bottom of the page, and opens a terminal for secret notes.',
        },
      ],
      outro: 'Any idea or wish for your website can be built. We just need to talk about it.',
      cta: { label: 'Let’s talk', href: '#contact' },
      note: '(desktop only)',
      close: 'Flip back',
    },
  },
  {
    title: 'New site',
    description: 'A site in the works for a client, in development. You will see it here soon.',
    tags: ['Web design', 'Front end'],
    status: 'Coming soon',
  },
]

export const about = {
  label: '02 — About',
  heading: 'I’ve run a business. Now I build websites for them.',
  /** The ride in numbers: each value decodes out of binary when the strip comes into view */
  stats: [
    { value: '15', label: 'months on the road' },
    { value: '30', label: 'countries crossed' },
    { value: '15,000', label: 'km by bike, France to Japan' },
    { value: '1', label: 'restaurant, run and sold' },
  ],
  /**
   * The bio as three stops on a route that draws itself on scroll.
   * Words between **double asterisks** are highlighted: the phrases a skimming reader should catch.
   */
  chapters: [
    {
      label: 'Before',
      place: 'Italy → France',
      title: 'Behind the counter',
      text: 'I’m Italian. I studied **computer science** back home, then at twenty I took a three-month job in a pizzeria in France. I never left. I went on to open my own restaurant, and running it taught me what every business owner knows: **even the smallest details matter**.',
    },
    {
      label: 'The road',
      place: 'France → Japan',
      title: 'Fifteen months on two wheels',
      text: 'My passion for programming had never gone away. So I sold the restaurant, and my partner and I took a long break: we wanted to work out how to rebuild our working life, and what we really wanted to do. We bought two bikes and set off. Somewhere along the road I decided to become a **web developer**, and since then I’ve been learning the best technologies, to keep pace with today’s market.',
    },
    {
      label: 'Today',
      place: 'Lyon',
      title: 'Websites, made to measure',
      text: 'Today I live **near Lyon** and build **websites made to measure**, with plenty of ideas and the patience of someone who’s been on the other side of the counter. I love the big picture and the small details. Your website deserves both.',
    },
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
  /** The back of the card: who it is for, and what it includes */
  ideal: string
  includes: string[]
}

export const services = {
  label: '03 — Services',
  heading: 'What I can build for you.',
  /** The words on the card's buttons and back, shared by the three offers */
  card: {
    open: 'What’s included',
    close: 'Flip back',
    ideal: 'Ideal for',
    includes: 'Included',
    cta: { label: 'Let’s talk', href: '#contact' },
  },
  items: [
    {
      name: 'Redesign',
      text: 'Your current site, rebuilt to be modern, fast and easy to find. Same business, a much better first impression.',
      ideal: 'Businesses that already have a site, but it is slow, dated or hard to find.',
      includes: ['A review of your current site', 'A new design, modern and made to measure', 'Faster, and perfect on mobile', 'Basic SEO, to be found on Google'],
    },
    {
      name: 'Showcase websites',
      text: 'A clear, beautiful home for your business online: who you are, what you do, and how to reach you.',
      ideal: 'A new business, or one that has no website yet.',
      includes: ['A custom design, no templates', 'Clear pages: who you are, what you do, contact', 'Copy and photos, polished together', 'Online with your domain and hosting'],
    },
    {
      name: 'Web apps',
      text: 'Custom tools for the way you work: bookings, client areas, dashboards.',
      note: 'For larger projects I team up with a trusted full-stack developer, so timelines stay short and realistic.',
      ideal: 'A process to simplify, or an idea to build.',
      includes: ['Bookings and calendars', 'Client areas with a login', 'Dashboards and data management', 'Custom tools, like Folio'],
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
  label: '04 — How I work',
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
  phases: ['1/4 · Assembly', '2/4 · Exploded view', '3/4 · Compression', '4/4 · The method'],
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
  label: '05 — Contact',
  heading: 'Let’s talk about your website.',
  cta: 'Write to me',
  reply: 'I’ll get back to you quickly.',
  // TODO: switch to an address on your own domain when you have one
  email: 'contact@alessiomura.fr',
  /** Fill in the email that opens from the button: a subject and a short form to complete */
  subject: 'A website for my business',
  body: [
    'Hi Alessio,',
    '',
    'my name is … and I run a … business in … .',
    '',
    'I’m interested in: a new website / redoing my current site / a web app.',
    '',
    'The project in short:',
    '',
    '',
    'My current website (if any):',
    '',
    'Thanks!',
  ].join('\n'),
  /** Profiles: a link with an empty href stays hidden */
  links: [
    { label: 'GitHub', href: 'https://github.com/ale-lded' },
    // TODO: add your Malt and LinkedIn profiles
    { label: 'Malt', href: '' },
    { label: 'LinkedIn', href: '' },
  ],
  backToTop: 'Back to top',
  /** The legal notice is in French only: it is the version French law asks for */
  legal: 'Legal notice (FR)',
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
    ['W A S D · ↑ ← ↓ →', 'drive'],
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

/** The language dial in the top bar (LangDial) */
export const dial = {
  label: 'Language',
  switchTo: 'Switch to',
}
