/**
 * Tutti i testi del sito in un unico posto.
 * I campi marcati TODO sono provvisori: sostituiscili con i tuoi contenuti reali.
 */

export const person = {
  name: 'Alessio Mura',
  initials: 'AM',
  /** Frase di servizio: è il titolo della hero e il testo che si trasforma allo scroll */
  tagline: 'Creatore di prodotti digitali',
  role: 'Designer e sviluppatore full stack',
  // TODO: riga di presentazione provvisoria
  lead: '“Progetto interfacce chiare e le costruisco, dal pixel al database.”',
}

export const nav = [
  { label: 'Chi sono', href: '#chi-sono' },
  { label: 'Progetti', href: '#progetti' },
  { label: 'Contatti', href: '#contatti' },
]

export type Project = {
  title: string
  description: string
  tags: string[]
}

/** Progetti di esempio. */
export const projects: Project[] = [
  {
    title: 'Atlas',
    description: 'App per la gestione del budget personale, dal prototipo al rilascio.',
    tags: ['Figma', 'React Native'],
  },
  {
    title: 'Nerina',
    description: 'Identità visiva e sito per una piccola cantina.',
    tags: ['Branding', 'HTML, CSS'],
  },
  {
    title: 'Orbita',
    description: 'Dashboard per la logistica urbana con dati in tempo reale.',
    tags: ['Design system', 'TypeScript'],
  },
]

export const about = {
  // TODO: titolo e bio provvisori, da riscrivere con la tua voce
  heading: 'Disegno prodotti digitali e li porto fino in produzione.',
  bio: [
    'TODO — Bio provvisoria. Sono Alessio, designer e sviluppatore full stack: lavoro dove prodotto e codice si incontrano, dai prototipi alle interfacce fino ai dati che le alimentano.',
  ],
}

export type Skill = {
  name: string
  note?: string
  /** One line shown when the layer is lit in the exploded view */
  detail: string
}

/**
 * The stack sequence between "Chi sono" and "Contatti": the skills become four
 * stacked layers, from the interface on top down to the data.
 * TODO: intro, dettagli e chiusura sono provvisori, da riscrivere con la tua voce.
 */
export const stack = {
  label: 'Lo stack',
  intro: {
    heading: 'Quattro livelli, un solo prodotto.',
    text: 'Ogni progetto attraversa gli stessi strati. Li seguo tutti, dal primo schizzo ai dati.',
  },
  skills: [
    {
      name: 'Design di prodotto',
      note: 'Ricerca, prototipi',
      detail: 'Flussi, wireframe e prototipi: capire cosa costruire, e perché.',
    },
    {
      name: 'Design system',
      note: 'Token, componenti',
      detail: 'Regole e componenti condivisi che tengono coerente ogni schermata.',
    },
    {
      name: 'Front-end',
      note: 'React, TypeScript',
      detail: 'Interfacce veloci e accessibili, curate fino all’ultimo pixel.',
    },
    {
      name: 'Back-end e database',
      note: 'API, SQL',
      detail: 'API e dati solidi, che reggono il prodotto quando cresce.',
    },
  ] satisfies Skill[],
  outro: {
    heading: 'Dal pixel al database.',
    text: 'Un unico interlocutore per tutto lo stack.',
  },
}

export const contact = {
  heading: 'Hai un progetto in mente?',
  // TODO: inserisci la tua email reale
  email: 'ciao@example.com',
  // TODO: inserisci i tuoi profili reali (lascia l'array vuoto per nasconderli)
  links: [
    { label: 'LinkedIn', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
}
