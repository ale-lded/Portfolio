/**
 * Il testo in italiano: stessa forma di en.ts, campo per campo (TypeScript segnala ciò che manca).
 * Si dà del tu. I nomi degli strumenti di Folio restano in inglese, come nell'app.
 */
import type { Content } from '../content'

const person: Content['person'] = {
  name: 'Alessio Mura',
  initials: 'AM',
  tagline: 'Siti web su misura.',
  role: 'Web designer e sviluppatore',
  lead: '“Prima ascolto, poi progetto e realizzo un sito che si adatta alla tua attività, fin nei minimi dettagli.”',
}

export const it: Content = {
  person,

  nav: {
    label: 'Principale',
    links: [
      { label: 'Chi sono', href: '#about' },
      { label: 'Lavori', href: '#work' },
      { label: 'Servizi', href: '#services' },
      { label: 'Contatti', href: '#contact' },
    ],
  },

  hero: {
    stageLabel: 'Presentazione e lavori',
    meta: 'Lione, Francia — 2026',
    hint: 'scorri',
    phases: ['1/4 · Sgretolamento', '2/4 · Codice → binario', '3/4 · Ricomposizione', '4/4 · Lavori'],
  },

  work: {
    heading: '01 — Lavori scelti',
  },

  projects: [
    {
      title: 'Folio',
      description: 'Strumenti PDF che funzionano nel browser. I tuoi file non lasciano mai il tuo dispositivo.',
      tags: ['React', 'pdf-lib', 'Open source'],
      status: 'In corso',
      details: {
        open: 'Apri',
        image: {
          src: '/projects/folio.webp',
          width: 2000,
          height: 1050,
          alt: 'La home di Folio: una libreria di strumenti PDF, con lo strumento Split estratto e aperto.',
        },
        story: [
          'Lavoro con i PDF di continuo, e ogni strumento online mi chiedeva di caricare i miei file, sopportare la pubblicità o pagare per togliere un limite. Così ho creato il mio.',
          'Folio è semplice, gratuito e senza pubblicità. Tutto succede nel tuo browser: i tuoi file non vengono mai caricati, mai salvati in un database, mai visti da nessuno oltre a te.',
        ],
        progress: 'Lavori in corso: Merge funziona già, Split è in arrivo, Compress e Sign sono anteprime.',
        cta: 'Modifica il tuo PDF',
        href: '',
        soon: 'Presto online',
        close: 'Chiudi',
      },
    },
    {
      title: 'Questo sito',
      description: 'Un esempio creativo: quello che immagini per il tuo sito può diventare reale, e funzionare davvero.',
      tags: ['React', 'TypeScript', 'Canvas'],
      back: {
        open: 'Hai trovato i due easter egg?',
        heading: 'Due segreti, sotto gli occhi.',
        items: [
          {
            name: 'Un pixel fuori posto',
            text: 'Cliccalo, in cima alla pagina, per un giro di pista dietro le quinte. Batti il record.',
          },
          {
            name: 'Un cursore smarrito',
            text: 'Si nasconde in cima e in fondo alla pagina, e apre un terminale per messaggi segreti.',
          },
        ],
        close: 'Rigira',
      },
    },
    {
      title: 'Caso studio',
      description: 'Una nuova pagina case study per una società di consulenza software, disegnata per il loro sito.',
      tags: ['Web design', 'Front end'],
    },
  ],

  about: {
    label: '02 — Chi sono',
    heading: 'Ho gestito un’attività. Ora creo siti web per chi ne ha una.',
    bio: [
      'Sono italiano. Ho studiato informatica in Italia, poi a vent’anni ho accettato un lavoro di tre mesi in una pizzeria in Francia. Non me ne sono più andato. Ho aperto il mio ristorante, e gestirlo mi ha insegnato quello che ogni imprenditore sa: le persone ricordano i dettagli.',
      'Poi è tornata la voglia di tecnologia. Ho venduto il ristorante e con la mia compagna siamo partiti su due bici: quindici mesi, trenta paesi, quindicimila chilometri. Da qualche parte lungo la strada ho deciso di diventare sviluppatore web, e da allora studio i migliori strumenti del mestiere.',
      'Oggi vivo vicino a Lione, con tante idee e la pazienza di chi è stato dall’altra parte del bancone. Amo due cose: il quadro generale e i piccoli dettagli. Il tuo sito merita entrambi.',
    ],
    photo: {
      src: '/photos/fuji.webp',
      width: 2000,
      height: 1360,
      alt: 'Alessio in piedi accanto alla sua bici da viaggio carica, in riva a un lago, con il monte Fuji che spunta sopra le nuvole.',
      caption: 'Il monte Fuji, una tappa del nostro viaggio.',
      film: 'Pentax MX (1976) · Fujifilm 35 mm',
      open: 'Apri la foto',
      close: 'Chiudi',
      story: 'Scatto ancora in pellicola: ogni fotogramma conta, quindi ti prendi il tuo tempo. Cerco di costruire i siti allo stesso modo.',
    },
  },

  services: {
    label: '03 — Servizi',
    heading: 'Cosa posso realizzare per te.',
    items: [
      {
        name: 'Redesign',
        text: 'Il tuo sito attuale, rifatto per essere moderno, veloce e facile da trovare. Stessa attività, una prima impressione molto migliore.',
      },
      {
        name: 'Siti vetrina',
        text: 'Una casa online chiara e curata per la tua attività: chi sei, cosa fai e come raggiungerti.',
      },
      {
        name: 'Web app',
        text: 'Strumenti su misura per il tuo modo di lavorare: prenotazioni, aree clienti, dashboard.',
        note: 'Per i progetti più grandi lavoro con uno sviluppatore full-stack di fiducia, così i tempi restano brevi e realistici.',
      },
    ],
  },

  stack: {
    label: '04 — Come lavoro',
    intro: {
      heading: 'Quattro passi, nessuna sorpresa.',
      text: 'Dalla prima chiamata al giorno del lancio, sai sempre a che punto siamo e cosa viene dopo.',
    },
    skills: [
      {
        name: 'Ascolto',
        note: 'Chiamata, bisogni, obiettivi',
        detail: 'Parliamo della tua attività, dei tuoi clienti e di cosa deve fare il tuo sito. Niente gergo, nessun impegno.',
      },
      {
        name: 'Progetto',
        note: 'Opzioni, struttura, concept',
        detail: 'Valutiamo insieme le opzioni e decidiamo struttura e idee chiave prima di disegnare un solo pixel.',
      },
      {
        name: 'Design',
        note: 'Bozze, modifiche incluse',
        detail: 'Vedi il tuo sito prima che sia costruito, e lo rifiniamo finché non lo senti tuo.',
      },
      {
        name: 'Sviluppo e lancio',
        note: 'Sviluppo, lancio, assistenza',
        detail: 'Lo costruisco veloce, accessibile e facile da trovare su Google, lo metto online e posso tenerlo aggiornato dopo.',
      },
    ],
    outro: {
      heading: 'Dalla prima chiamata al lancio.',
      text: 'Una sola persona con cui parlare, dall’inizio alla fine.',
    },
    phases: ['1/4 · Assemblaggio', '2/4 · Vista esplosa', '3/4 · Compressione', '4/4 · Il metodo'],
    art: {
      brief: {
        title: 'Prima chiamata',
        questions: ['Chi sono i tuoi clienti?', 'Cosa deve fare il sito?', 'Cosa ti piace, cosa no?'],
        answer: 'Più prenotazioni, meno telefono',
      },
      flow: ['Home', 'Servizi', 'Contatti'],
      toggle: 'on',
      email: 'nome@studio.it',
      live: 'Online',
    },
  },

  contact: {
    label: '05 — Contatti',
    heading: 'Parliamo del tuo sito.',
    cta: 'Scrivimi',
    reply: 'Ti risponderò in fretta.',
    email: 'commerciale.alessiomura@gmail.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/ale-lded' },
      { label: 'Malt', href: '' },
      { label: 'LinkedIn', href: '' },
    ],
    backToTop: 'Torna su',
  },

  backstage: {
    bug: 'Un pixel fuori posto',
    label: 'Dietro le quinte',
    back: 'Torna sul palco',
  },

  race: {
    title: 'Backstage GP',
    subtitle: '// 1 giro · cronometro',
    tyresLabel: 'Gomme',
    setupLabel: 'Assetto',
    tyres: {
      soft: { name: 'Morbide', text: 'Il massimo del grip. Calano prima del traguardo.' },
      medium: { name: 'Medie', text: 'Un po’ di tutto.' },
      hard: { name: 'Dure', text: 'Meno grip, durano tutta la gara.' },
    },
    setups: {
      speed: { name: 'Velocità', text: 'Vola sui rettilinei, pigra in curva.' },
      balanced: { name: 'Bilanciato', text: 'Nessuna sorpresa.' },
      corner: { name: 'Curve', text: 'Precisa in curva, corta di velocità.' },
    },
    stats: { grip: 'Grip', life: 'Durata', speed: 'Velocità', handling: 'Guida' },
    start: 'Via alla gara',
    controls: [
      ['W A S D', 'guida'],
      ['Spazio', 'freno a mano'],
      ['Esc', 'pausa'],
      ['R', 'ricomincia'],
    ],
    board: 'Top 3',
    local: 'Salvato in questo browser',
    lap: 'Giro',
    time: 'Tempo',
    best: 'Migliore',
    record: 'Record',
    yourBest: 'Il tuo migliore',
    beaten: 'Nuovo record',
    toRecord: 'dal record',
    savedAs: 'Salvato come',
    wear: 'Gomme',
    speedUnit: 'km/h',
    go: 'Via',
    paused: 'In pausa',
    resume: 'Riprendi',
    restart: 'Ricomincia',
    change: 'Cambia auto',
    quit: 'Torna sul palco',
    finish: 'Traguardo',
    podium: 'Sei sul podio',
    initials: 'Le tue iniziali',
    save: 'Salva',
    again: 'Corri ancora',
  },

  terminal: {
    trigger: 'Un cursore smarrito',
    title: 'cipher.sys',
    label: 'Terminale cifrato',
    intro: 'Scrivi un messaggio segreto, manda il codice a un amico, lui lo apre qui.',
    modeLabel: 'Modalità',
    modes: { encrypt: 'Cifra', decrypt: 'Decifra' },
    keyLabel: 'Chiave (facoltativa)',
    keyPlaceholder: 'una parola che conoscete entrambi',
    keyHint: 'Lasciala vuota e chiunque abbia questo sito potrà aprire il messaggio.',
    inputLabel: { encrypt: 'Il tuo messaggio', decrypt: 'Codice da decifrare' },
    inputPlaceholder: {
      encrypt: 'Scrivi un messaggio segreto…',
      decrypt: 'Incolla un codice che inizia con AM:',
    },
    run: { encrypt: 'Cifra il messaggio', decrypt: 'Decifra il codice' },
    runHint: '⌘ ↵',
    clear: 'Pulisci',
    output: 'Risultato',
    idle: 'Il risultato apparirà qui.',
    copy: 'Copia',
    copied: 'Copiato ✓',
    copyFailed: 'Selezionato: premi ⌘C',
    check: 'Provalo',
    errors: {
      empty: 'Ancora niente da elaborare.',
      format: 'Codice non valido: i codici iniziano con AM:',
      key: 'Accesso negato: chiave sbagliata.',
    },
    detected: 'Codice rilevato: passato a Decifra.',
    disclaimer: 'Un cifrario giocattolo per messaggi tra amici. Non per le password.',
    close: 'Chiudi',
  },

  dial: {
    label: 'Lingua',
    switchTo: 'Passa a',
  },
}
