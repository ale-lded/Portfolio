/**
 * Tutti i testi del sito in un unico posto.
 * I campi marcati TODO sono provvisori: sostituiscili con i tuoi contenuti reali.
 */

export const person = {
  name: 'Alessio Mura',
  initials: 'AM',
  /** Frase di servizio: è il titolo della hero e il testo che si trasforma allo scroll */
  tagline: 'Disegno prodotti digitali e li costruisco davvero.',
  role: 'Designer e sviluppatore full stack',
  // TODO: riga di presentazione provvisoria
  lead: 'Progetto interfacce chiare e le costruisco, dal pixel al database.',
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
  skills: [
    { name: 'Design di prodotto' },
    { name: 'Design system' },
    { name: 'Front-end', note: 'React, TypeScript' },
    { name: 'Back-end e database' },
  ],
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
