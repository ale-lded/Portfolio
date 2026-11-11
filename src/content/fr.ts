/**
 * Le texte en français : même forme que en.ts, champ par champ (TypeScript signale ce qui manque).
 * On tutoie, comme en italien : un ton chaleureux et direct. Typographie française : espace insécable ( ) avant : ; ? ! et dans les « ».
 * Les noms des outils de Folio restent en anglais, comme dans l'application.
 */
import type { Content } from '../content'

const person: Content['person'] = {
  name: 'Alessio Mura',
  initials: 'AM',
  tagline: 'Des sites web **sur mesure.**',
  role: 'Web designer et développeur',
  lead: '« J’écoute d’abord, puis je conçois et je développe un site qui correspond à ton activité, jusque dans les moindres détails. »',
}

export const fr: Content = {
  person,

  nav: {
    label: 'Principal',
    links: [
      { label: 'À propos', href: '#about' },
      { label: 'Projets', href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
  },

  hero: {
    stageLabel: 'Présentation et projets',
    meta: 'Lyon, France — 2026',
    hint: 'défiler',
    status: 'Disponible pour de nouveaux projets',
    cta: 'Parlons de ton projet',
    phases: ['1/4 · Effritement', '2/4 · Code → binaire', '3/4 · Recomposition', '4/4 · Projets'],
  },

  code: {
    file: 'ton-site.ts',
    lang: 'TS',
    name: 'tonSite',
    fields: [
      ['activité', "'la tienne'"],
      ['objectif', "'plus de clients'"],
      ['design', "'sur mesure'"],
      ['mobile', 'true'],
      ['rapide', 'true'],
      ['seo', "'trouvé sur Google'"],
    ],
    comment: 'chaque détail compte',
  },

  work: {
    heading: '01 — Derniers projets',
  },

  projects: [
    {
      title: 'Folio',
      description: 'Fusionne, divise, compresse et signe tes PDF. Gratuit, sans publicité, directement dans ton navigateur.',
      tags: ['React', 'WebAssembly', 'Open source'],
      href: 'https://folio.alessiomura.fr',
      details: {
        open: 'Découvrir',
        image: {
          src: '/projects/folio.webp',
          width: 2000,
          height: 1050,
          alt: 'La page d’accueil de Folio : une bibliothèque d’outils PDF, avec l’outil Split sorti et ouvert.',
        },
        story: [
          'Un de mes derniers projets. Je l’ai pensé pour avoir toujours sous la main un outil PDF facile : gratuit, sans publicité et sans inscription.',
          'Tout se passe dans ton navigateur : tes fichiers ne sont jamais envoyés sur un serveur, ni vus par personne d’autre que toi. Si tu en as besoin, utilise-le toi aussi.',
        ],
        progress: 'Fusionner · Diviser · Réorganiser · Compresser · Signer · Protéger par mot de passe',
        cta: 'Utiliser Folio gratuitement',
        href: 'https://folio.alessiomura.fr',
        soon: 'Bientôt en ligne',
        close: 'Fermer',
      },
    },
    {
      title: 'Ce site',
      description: 'Le site que tu regardes, conçu et développé par moi, avec deux secrets cachés à dénicher.',
      tags: ['React', 'TypeScript', 'Canvas'],
      back: {
        open: 'Découvre les 2 easter eggs cachés',
        heading: 'Fait sur mesure, jusque dans les détails.',
        intro: 'Construit avec des outils modernes, avec des animations dessinées à la main. Et deux surprises :',
        items: [
          {
            name: 'Un pixel déplacé',
            text: 'Clique dessus, près du projecteur sur le premier écran, pour un tour de piste en coulisses. Bats le record.',
          },
          {
            name: 'Un curseur égaré',
            text: 'Il se cache en haut et en bas de la page, et ouvre un terminal pour messages secrets.',
          },
        ],
        outro: 'Chaque idée ou envie pour ton site peut devenir réelle. Il suffit d’en parler.',
        cta: { label: 'Parlons-en', href: '#contact' },
        note: '(uniquement sur ordinateur)',
        close: 'Retourner',
      },
    },
    {
      title: 'Nouveau site',
      description: 'Un site en préparation pour un client, en cours de développement. Bientôt visible ici.',
      tags: ['Web design', 'Front end'],
      status: 'Disponible bientôt',
    },
  ],

  about: {
    label: '02 — À propos',
    heading: 'J’ai été chef d’entreprise. Aujourd’hui, je crée des sites pour la tienne.',
    stats: [
      { value: '15', label: 'mois sur la route' },
      { value: '30', label: 'pays traversés' },
      { value: '15 000', label: 'km à vélo, de la France au Japon' },
      { value: '1', label: 'restaurant, tenu puis vendu' },
    ],
    chapters: [
      {
        label: 'Avant',
        place: 'Italie → France',
        title: 'Derrière le comptoir',
        text: 'Je suis italien. J’ai étudié l’**informatique** en Italie, puis à vingt ans j’ai accepté un travail de trois mois dans une pizzeria en France. Je ne suis jamais reparti. J’ai ouvert mon propre restaurant, et le diriger m’a appris ce que tout chef d’entreprise sait : **même les plus petits détails comptent**.',
      },
      {
        label: 'La route',
        place: 'France → Japon',
        title: 'Quinze mois sur deux roues',
        text: 'Ma passion pour la programmation ne m’avait jamais quitté. Alors j’ai vendu le restaurant, ma compagne et moi avons acheté deux vélos et nous sommes partis. Quelque part sur la route, j’ai décidé de devenir **développeur web**, et depuis je me forme aux meilleures technologies pour rester en phase avec le marché d’aujourd’hui.',
      },
      {
        label: 'Aujourd’hui',
        place: 'Lyon',
        title: 'Des sites web sur mesure',
        text: 'Aujourd’hui, je crée des **sites web sur mesure** **près de Lyon**, avec plein d’idées et la patience de quelqu’un qui a été de l’autre côté du comptoir. J’aime la vue d’ensemble et les petits détails. Ton site mérite les deux.',
      },
    ],
    photo: {
      src: '/photos/fuji.webp',
      width: 2000,
      height: 1360,
      alt: 'Alessio debout à côté de son vélo de voyage chargé, au bord d’un lac, le mont Fuji au-dessus des nuages derrière lui.',
      caption: 'Le mont Fuji, une étape de notre voyage.',
      film: 'Pentax MX (1976) · Fujifilm 35 mm',
      open: 'Ouvrir la photo',
      close: 'Fermer',
      story: 'Je photographie encore en argentique : chaque image compte, alors on prend son temps. J’essaie de créer des sites de la même façon.',
    },
  },

  services: {
    label: '03 — Services',
    heading: 'Ce que je peux créer pour toi.',
    card: {
      open: 'Ce qui est inclus',
      close: 'Retourner',
      ideal: 'Idéal pour',
      includes: 'Inclus',
      cta: { label: 'Parlons-en', href: '#contact' },
    },
    items: [
      {
        name: 'Refonte',
        text: 'Ton site actuel, refait pour être moderne, rapide et facile à trouver. La même entreprise, une bien meilleure première impression.',
        ideal: 'Ceux qui ont déjà un site, mais lent, daté ou difficile à trouver.',
        includes: ['Analyse du site actuel', 'Nouveau design, moderne et sur mesure', 'Plus rapide et parfait sur mobile', 'SEO de base, pour être trouvé sur Google'],
      },
      {
        name: 'Sites vitrines',
        text: 'Une vitrine en ligne claire et soignée pour ton entreprise : qui tu es, ce que tu fais et comment te joindre.',
        ideal: 'Ceux qui lancent leur activité ou n’ont pas encore de site.',
        includes: ['Design sur mesure, pas de template', 'Des pages claires : qui tu es, ce que tu fais, contact', 'Textes et photos soignés ensemble', 'En ligne avec ton domaine et l’hébergement'],
      },
      {
        name: 'Applications web',
        text: 'Des outils sur mesure pour ta façon de travailler : réservations, espaces clients, tableaux de bord.',
        note: 'Pour les projets plus importants, je travaille avec un développeur full-stack de confiance, pour garder des délais courts et réalistes.',
        ideal: 'Un processus à simplifier ou une idée à construire.',
        includes: ['Réservations et calendriers', 'Espaces clients avec connexion', 'Tableaux de bord et gestion des données', 'Outils sur mesure, comme Folio'],
      },
    ],
  },

  stack: {
    label: '04 — Ma méthode',
    intro: {
      heading: 'Quatre étapes, aucune surprise.',
      text: 'Du premier appel au jour du lancement, tu sais toujours où on en est et ce qui vient ensuite.',
    },
    skills: [
      {
        name: 'Écoute',
        note: 'Appel, besoins, objectifs',
        detail: 'On parle de ton entreprise, de tes clients et de ce que ton site doit accomplir. Sans jargon, sans engagement.',
      },
      {
        name: 'Conception',
        note: 'Options, structure, concept',
        detail: 'On étudie ensemble les options et on fixe la structure et les idées clés avant de dessiner le moindre pixel.',
      },
      {
        name: 'Design',
        note: 'Maquettes, retouches incluses',
        detail: 'Tu vois ton site avant qu’il soit construit, et on l’affine jusqu’à ce qu’il te ressemble.',
      },
      {
        name: 'Mise en ligne',
        note: 'Code, mise en ligne, suivi',
        detail: 'Je le construis rapide, accessible et facile à trouver sur Google, je le mets en ligne et je peux le tenir à jour ensuite.',
      },
    ],
    outro: {
      heading: 'Du premier appel au lancement.',
      text: 'Un seul interlocuteur, du début à la fin.',
    },
    phases: ['1/4 · Assemblage', '2/4 · Vue éclatée', '3/4 · Compression', '4/4 · La méthode'],
    art: {
      brief: {
        title: 'Premier appel',
        questions: ['Qui sont tes clients ?', 'Que doit faire le site ?', 'Ce que tu aimes, ou pas ?'],
        answer: 'Plus de réservations, moins d’appels',
      },
      flow: ['Accueil', 'Services', 'Contact'],
      toggle: 'on',
      email: 'nom@studio.fr',
      live: 'En ligne',
    },
  },

  contact: {
    label: '05 — Contact',
    heading: 'Parlons de ton site.',
    cta: 'Écris-moi',
    reply: 'Je te réponds rapidement.',
    email: 'contact@alessiomura.fr',
    subject: 'Un site pour mon activité',
    body: [
      'Bonjour Alessio,',
      '',
      'je m’appelle … et j’ai une activité de … à … .',
      '',
      'Je suis intéressé par : un nouveau site / refaire mon site actuel / une application web.',
      '',
      'Le projet en bref :',
      '',
      '',
      'Mon site actuel (s’il y en a un) :',
      '',
      'Merci !',
    ].join('\n'),
    links: [
      { label: 'GitHub', href: 'https://github.com/ale-lded' },
      { label: 'Malt', href: '' },
      { label: 'LinkedIn', href: '' },
    ],
    backToTop: 'Haut de page',
  },

  backstage: {
    bug: 'Un pixel déplacé',
    label: 'Coulisses',
    back: 'Retour sur scène',
  },

  race: {
    title: 'Backstage GP',
    subtitle: '// 1 tour · contre-la-montre',
    tyresLabel: 'Pneus',
    setupLabel: 'Réglages',
    tyres: {
      soft: { name: 'Tendres', text: 'Le plus d’adhérence. S’usent avant l’arrivée.' },
      medium: { name: 'Médiums', text: 'Un peu de tout.' },
      hard: { name: 'Durs', text: 'Moins d’adhérence, tiennent toute la course.' },
    },
    setups: {
      speed: { name: 'Vitesse', text: 'Vole en ligne droite, paresseuse en virage.' },
      balanced: { name: 'Équilibré', text: 'Aucune surprise.' },
      corner: { name: 'Virages', text: 'Vive en virage, courte en vitesse.' },
    },
    stats: { grip: 'Adhérence', life: 'Durée', speed: 'Vitesse', handling: 'Maniabilité' },
    start: 'Lancer la course',
    controls: [
      ['W A S D · ↑ ← ↓ →', 'conduire'],
      ['Espace', 'frein à main'],
      ['Esc', 'pause'],
      ['R', 'recommencer'],
    ],
    board: 'Top 3',
    local: 'Enregistré dans ce navigateur',
    lap: 'Tour',
    time: 'Temps',
    best: 'Meilleur',
    record: 'Record',
    yourBest: 'Ton meilleur',
    beaten: 'Nouveau record',
    toRecord: 'du record',
    savedAs: 'Enregistré sous',
    wear: 'Pneus',
    speedUnit: 'km/h',
    go: 'Partez',
    paused: 'Pause',
    resume: 'Reprendre',
    restart: 'Recommencer',
    change: 'Changer de voiture',
    quit: 'Retour sur scène',
    finish: 'Arrivée',
    podium: 'Tu es sur le podium',
    initials: 'Tes initiales',
    save: 'Enregistrer',
    again: 'Encore une course',
  },

  terminal: {
    trigger: 'Un curseur égaré',
    title: 'cipher.sys',
    label: 'Terminal chiffré',
    intro: 'Écris un message secret, envoie le code à un ami, il l’ouvre ici.',
    modeLabel: 'Mode',
    modes: { encrypt: 'Chiffrer', decrypt: 'Déchiffrer' },
    keyLabel: 'Clé (facultative)',
    keyPlaceholder: 'un mot que vous connaissez tous les deux',
    keyHint: 'Laisse-la vide et n’importe qui ayant ce site pourra ouvrir le message.',
    inputLabel: { encrypt: 'Ton message', decrypt: 'Code à déchiffrer' },
    inputPlaceholder: {
      encrypt: 'Tape un message secret…',
      decrypt: 'Colle un code qui commence par AM:',
    },
    run: { encrypt: 'Chiffrer le message', decrypt: 'Déchiffrer le code' },
    runHint: '⌘ ↵',
    clear: 'Effacer',
    output: 'Résultat',
    idle: 'Le résultat apparaîtra ici.',
    copy: 'Copier',
    copied: 'Copié ✓',
    copyFailed: 'Sélectionné : appuie sur ⌘C',
    check: 'Tester',
    errors: {
      empty: 'Rien à traiter pour l’instant.',
      format: 'Code invalide : les codes commencent par AM:',
      key: 'Accès refusé : mauvaise clé.',
    },
    detected: 'Code détecté : passage en Déchiffrer.',
    disclaimer: 'Un chiffrement pour jouer entre amis. Pas pour les mots de passe.',
    close: 'Fermer',
  },

  dial: {
    label: 'Langue',
    switchTo: 'Passer à',
  },
}
