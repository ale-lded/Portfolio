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
  /** The three steps of the hero sequence, shown bottom left while it plays.
   *  Counted as 1/3…3/3, so they never read like the section numbers (01 — …) */
  phases: ['1/3 · Idea', '2/3 · Code', '3/3 · Work'],
}

/**
 * The code window the title crumbles into: the example site's home page, written as HTML.
 * Its lines are made from work.demo.page (scene/code.ts), so they always say what the page says.
 */
export const code = {
  file: 'index.html',
  lang: 'HTML',
}

/**
 * The work: one browser window, and under it a picker with a block per page. The code
 * writes the first one, an example site for a local business; then Folio and this site.
 */
export const work = {
  heading: '01 — Latest work',
  /** The picker under the window, for screen readers */
  tabsLabel: 'Projects',
  folio: {
    tab: 'Folio',
    kind: 'PDF tool',
    url: 'folio.alessiomura.fr',
    href: 'https://folio.alessiomura.fr',
    description: 'Merge, split, compress and sign your PDFs. Free, ad-free, right in your browser.',
    tags: ['Free', 'No ads', 'Private'],
    cta: 'Use Folio for free',
    /** A second line on its card: why it exists, and that it's free to use */
    story: 'I built it to always have a simple PDF tool at hand. Now you can use it too: no sign-up, and your files never leave your device.',
    /** Folio's own home page, in English like the app */
    page: {
      badge: 'Your files never leave your device',
      title: ['Everything your', 'PDFs need.'],
      lead: ['Merge, split,', 'compress and sign.'],
      drop: 'Drop your PDFs here',
      button: 'Upload a PDF',
      alt: 'Folio’s bookshelf of PDF tools, with the Split tool pulled out and open.',
    },
  },
  site: {
    tab: 'This site',
    kind: 'Portfolio',
    url: 'alessiomura.fr',
    description: 'The site you are looking at, designed and built by me, with care in every detail.',
    alt: 'The first screen of this site.',
    heading: 'Two surprises hidden here',
    items: [
      {
        name: 'A pixel out of place',
        text: 'Click it, near the spotlight on the first screen, for a one-lap race backstage. Beat the record.',
      },
      {
        name: 'A dead pixel',
        text: 'Grey, top right on the first screen and at the bottom of the page after the copyright. It opens a terminal for secret notes.',
      },
    ],
    note: '(desktop only)',
  },
  demo: {
    tab: 'Bistro',
    kind: 'Example',
    url: 'your-bistro.fr',
    status: 'Open slot',
    description: 'An example site for a restaurant: menu, opening hours, bookings. The next one could be yours.',
    cta: { label: 'Book the slot', href: '#contact' },
    /** An example page for a local business, made up to show the idea: not a real client.
     *  The code window writes brand, title, lead, book and photoFile: keep each title and lead
     *  line short (about 22 characters), phones shrink the code to fit the longest */
    page: {
      label: 'Example',
      brand: 'Your bistro',
      links: ['Menu', 'Hours', 'Contact'],
      kicker: 'Seasonal cooking · Lyon',
      title: ['Home cooking,', 'around the corner.'],
      lead: ['Market produce and', 'a weekly menu.'],
      book: 'Book a table',
      menu: 'See the menu',
      alt: 'A seasonal lunch plate on a wooden table (example photo).',
      photoFile: 'your-photo.jpg',
      info: [
        { label: 'Open', value: 'Tue–Sat · 12–2 pm · 7–10 pm' },
        { label: 'Where', value: 'Your street, Lyon' },
        { label: 'Call', value: '04 00 00 00 00' },
      ],
    },
  },
  carpenter: {
    tab: 'Carpenter',
    kind: 'Example',
    url: 'your-workshop.fr',
    status: 'Open slot',
    description: 'An example site for a craftsman: the work up front, and an easy way to ask for a quote.',
    /** A second example, for a craftsman: the work in photos up front */
    page: {
      label: 'Example',
      brand: 'Your workshop',
      links: ['Work', 'Workshop', 'Contact'],
      kicker: 'Made-to-measure furniture · Lyon',
      title: ['Made by hand,', 'made for your home.'],
      lead: 'Tables, kitchens and bookcases in solid wood, drawn and built for the room they live in.',
      quote: 'Ask for a quote',
      works: 'See the work',
      photos: [
        { src: '/examples/workshop.jpg', alt: 'A carpenter hand-planing an oak board on the workbench (example photo).', caption: 'In the workshop' },
        { src: '/examples/bookcase.jpg', alt: 'A made-to-measure oak bookcase in a living room (example photo).', caption: 'Oak bookcase' },
        { src: '/examples/joint.jpg', alt: 'Hands fitting a dovetail joint in walnut (example photo).', caption: 'Dovetail, by hand' },
      ],
    },
  },
}

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
    /** A 1040px copy for the page itself (520px wide at most, on 2x screens); the lightbox keeps the original */
    small: '/photos/fuji-1040.webp',
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
  /** Where the offer is available, for search engines (src/lib/structuredData.ts):
   *  the whole country when it is done remotely, the Rhône when it means being there */
  area: 'country' | 'region'
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
      note: 'Remotely too, anywhere in France.',
      area: 'country',
      ideal: 'Businesses that already have a site, but it is slow, dated or hard to find.',
      includes: ['A review of your current site', 'A new design, modern and made to measure', 'Faster, and perfect on mobile', 'Basic SEO, to be found on Google'],
    },
    {
      name: 'Showcase websites',
      text: 'A clear, beautiful home for your business online: who you are, what you do, and how to reach you.',
      note: 'Remotely too, anywhere in France.',
      area: 'country',
      ideal: 'A new business, or one that has no website yet.',
      includes: ['A custom design, no templates', 'Clear pages: who you are, what you do, contact', 'Copy and photos, polished together', 'Online with your domain and hosting'],
    },
    {
      name: 'Photo & video',
      text: 'I come to you to photograph and film your business: real images for your website, your ads and your social media.',
      note: 'On location anywhere in the Rhône.',
      area: 'region',
      ideal: 'Businesses that want to show themselves as they really are, not with stock photos.',
      includes: ['On-location photo shoots', 'Video for your website and ads', 'Short edits for social media', 'Professional cameras, mics and lights'],
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
  phases: ['1/4 · The steps', '2/4 · One by one', '3/4 · All together', '4/4 · The method'],
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
    'I’m interested in: a new website / redoing my current site / photos and video.',
    '',
    'The project in short:',
    '',
    '',
    'My current website (if any):',
    '',
    'Thanks!',
  ].join('\n'),
  /** The WhatsApp button beside the email one: the chat opens with this message already typed
   *  (the number itself is in Contact.tsx, the same for every language) */
  whatsapp: {
    label: 'WhatsApp',
    message: 'Hi Alessio, I’d like to talk about a project for my business.',
  },
  /** Profiles next to the buttons: a link with an empty href stays hidden */
  links: [
    // TODO: add your Instagram profile when it is ready
    { label: 'Instagram', href: '' },
  ],
  /** Smaller links in the footer, for the curious */
  footerLinks: [{ label: 'GitHub', href: 'https://github.com/ale-lded' }],
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

/** The cipher terminal, opened by a dead pixel: top right in the hero, and after the copyright in the footer. */
export const terminal = {
  /** Accessible name of the hidden trigger */
  trigger: 'A dead pixel',
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
