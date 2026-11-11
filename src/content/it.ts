/**
 * Il testo in italiano: stessa forma di en.ts, campo per campo (TypeScript segnala ciò che manca).
 * Si dà del tu. I nomi degli strumenti di Folio restano in inglese, come nell'app.
 */
import type { Content } from '../content'

const person: Content['person'] = {
  name: 'Alessio Mura',
  initials: 'AM',
  tagline: 'Siti web **su misura.**',
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
    status: 'Disponibile per nuovi progetti',
    cta: 'Parliamo del tuo progetto',
    phases: ['1/4 · Sgretolamento', '2/4 · Codice → binario', '3/4 · Ricomposizione', '4/4 · Lavori'],
  },

  code: {
    file: 'tuo-sito.ts',
    lang: 'TS',
    name: 'tuoSito',
    fields: [
      ['attività', "'la tua'"],
      ['obiettivo', "'più clienti'"],
      ['design', "'su misura'"],
      ['mobile', 'true'],
      ['veloce', 'true'],
      ['seo', "'trovato su Google'"],
    ],
    comment: 'ogni dettaglio conta',
  },

  work: {
    heading: '01 — Ultimi lavori',
  },

  projects: [
    {
      title: 'Folio',
      description: 'Unisci, dividi, comprimi e firma i tuoi PDF. Gratis, senza pubblicità, direttamente nel browser.',
      tags: ['React', 'WebAssembly', 'Open source'],
      href: 'https://folio.alessiomura.fr',
      details: {
        open: 'Scopri',
        image: {
          src: '/projects/folio.webp',
          width: 2000,
          height: 1050,
          alt: 'La home di Folio: una libreria di strumenti PDF, con lo strumento Split estratto e aperto.',
        },
        story: [
          'Uno dei miei ultimi progetti. L’ho pensato per avere sempre a portata di mano uno strumento facile per i PDF: gratis, senza pubblicità e senza registrazione.',
          'Tutto succede nel tuo browser: i file non vengono mai caricati su un server, né visti da nessuno oltre a te. Se ti serve, usalo anche tu.',
        ],
        progress: 'Unisci · Dividi · Riordina · Comprimi · Firma · Proteggi con password',
        cta: 'Usa Folio gratis',
        href: 'https://folio.alessiomura.fr',
        soon: 'Presto online',
        close: 'Chiudi',
      },
    },
    {
      title: 'Questo sito',
      description: 'Il sito che stai guardando, progettato e sviluppato da me, con due segreti nascosti da scovare.',
      tags: ['React', 'TypeScript', 'Canvas'],
      back: {
        open: 'Scopri i 2 easter egg nascosti',
        heading: 'Fatto su misura, fin nei dettagli.',
        intro: 'Costruito con strumenti moderni, con animazioni disegnate a mano. E due sorprese:',
        items: [
          {
            name: 'Un pixel fuori posto',
            text: 'Cliccalo, vicino al faro nella prima schermata, per un giro di pista dietro le quinte. Batti il record.',
          },
          {
            name: 'Un cursore smarrito',
            text: 'Si nasconde in alto e in fondo alla pagina, e apre un terminale per messaggi segreti.',
          },
        ],
        outro: 'Ogni idea o desiderio per il tuo sito si può realizzare. Basta parlarne.',
        cta: { label: 'Parliamone', href: '#contact' },
        note: '(solo su desktop)',
        close: 'Rigira',
      },
    },
    {
      title: 'Nuovo sito',
      description: 'Un sito in preparazione per un cliente, in fase di sviluppo. Presto lo vedrai qui.',
      tags: ['Web design', 'Front end'],
      status: 'Disponibile a breve',
    },
  ],

  about: {
    label: '02 — Chi sono',
    heading: 'Ho gestito un’attività. Ora creo siti web per chi ne ha una.',
    stats: [
      { value: '15', label: 'mesi in viaggio' },
      { value: '30', label: 'paesi attraversati' },
      { value: '15.000', label: 'km in bici, dalla Francia al Giappone' },
      { value: '1', label: 'ristorante, gestito e venduto' },
    ],
    // Le parole tra **doppi asterischi** vengono evidenziate
    chapters: [
      {
        label: 'Prima',
        place: 'Italia → Francia',
        title: 'Dietro il bancone',
        text: 'Sono italiano. Ho studiato **informatica** in Italia, poi a vent’anni ho accettato un lavoro di tre mesi in una pizzeria in Francia. Non me ne sono più andato. Ho aperto il mio ristorante, e gestirlo mi ha insegnato quello che ogni imprenditore sa: **anche i dettagli più piccoli contano**.',
      },
      {
        label: 'La strada',
        place: 'Francia → Giappone',
        title: 'Quindici mesi su due ruote',
        text: 'La passione per la programmazione non se n’era mai andata. Così ho venduto il ristorante, e io e la mia compagna ci siamo presi una lunga pausa: volevamo capire come ricostruire il nostro lavoro, e cosa fare davvero. Abbiamo comprato due bici e siamo partiti. Da qualche parte lungo la strada ho deciso di diventare **sviluppatore web**, e da allora studio le migliori tecnologie per stare al passo con il mercato di oggi.',
      },
      {
        label: 'Oggi',
        place: 'Lione',
        title: 'Siti web su misura',
        text: 'Oggi vivo **vicino a Lione** e creo **siti web su misura**, con tante idee e la pazienza di chi è stato dall’altra parte del bancone. Amo il quadro generale e i piccoli dettagli. Il tuo sito merita entrambi.',
      },
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
    card: {
      open: 'Cosa include',
      close: 'Rigira',
      ideal: 'Ideale per',
      includes: 'Cosa include',
      cta: { label: 'Parliamone', href: '#contact' },
    },
    items: [
      {
        name: 'Redesign',
        text: 'Il tuo sito attuale, rifatto per essere moderno, veloce e facile da trovare. Stessa attività, una prima impressione molto migliore.',
        ideal: 'Chi ha già un sito, ma è lento, datato o difficile da trovare.',
        includes: ['Analisi del sito attuale', 'Nuovo design, moderno e su misura', 'Più veloce e perfetto su mobile', 'SEO di base, per farti trovare su Google'],
      },
      {
        name: 'Siti vetrina',
        text: 'Una casa online chiara e curata per la tua attività: chi sei, cosa fai e come raggiungerti.',
        ideal: 'Chi apre un’attività o non ha ancora un sito.',
        includes: ['Design su misura, niente template', 'Pagine chiare: chi sei, cosa fai, contatti', 'Testi e foto curati insieme', 'Online con il tuo dominio e l’hosting'],
      },
      {
        name: 'Web app',
        text: 'Strumenti su misura per il tuo modo di lavorare: prenotazioni, aree clienti, dashboard.',
        note: 'Per i progetti più grandi lavoro con uno sviluppatore full-stack di fiducia, così i tempi restano brevi e realistici.',
        ideal: 'Chi ha un processo da semplificare o un’idea da costruire.',
        includes: ['Prenotazioni e calendari', 'Aree clienti con accesso', 'Dashboard e gestione dei dati', 'Strumenti su misura, come Folio'],
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
    email: 'contact@alessiomura.fr',
    // Precompilano l'email che si apre con "Scrivimi"
    subject: 'Un sito per la mia attività',
    body: [
      'Ciao Alessio,',
      '',
      'mi chiamo … e ho un’attività di … a … .',
      '',
      'Mi interessa: un nuovo sito / rifare il sito attuale / una web app.',
      '',
      'Il progetto in breve:',
      '',
      '',
      'Il mio sito attuale (se c’è):',
      '',
      'Grazie!',
    ].join('\n'),
    links: [
      { label: 'GitHub', href: 'https://github.com/ale-lded' },
      { label: 'Malt', href: '' },
      { label: 'LinkedIn', href: '' },
    ],
    backToTop: 'Torna su',
    legal: 'Note legali (FR)',
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
      ['W A S D · ↑ ← ↓ →', 'guida'],
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
