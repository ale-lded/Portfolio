# Alessio Mura — Web designer e sviluppatore

Il mio portfolio, online su **[alessiomura.fr](https://alessiomura.fr)**: siti web su misura per le aziende, vicino a Lione.

Una sequenza legata allo scroll: il titolo si sgretola in pixel, diventa il codice del sito del cliente, poi binario, e infine si ricompone nei progetti. In tre lingue (inglese su `/`, italiano su `/it/`, francese su `/fr/`), con un minigioco nascosto e un terminale cifrato per chi li trova.

## Sviluppo

```bash
npm install
npm run dev
```

## Build

```bash
SITE_URL=https://alessiomura.fr npm run build
npm run preview
```

- `SITE_URL` scrive canonical, hreflang e l'immagine di condivisione con l'indirizzo completo.
- `HIDDEN=1` crea una build di anteprima che i motori di ricerca non indicizzano.

I testi sono in `src/content/` (`en.ts`, `it.ts`, `fr.ts`); le mentions légales in `mentions-legales/index.html`.

Stack: Vite, React, TypeScript. Le animazioni sono scritte a mano su canvas 2D, senza librerie esterne. Ospitato su Cloudflare Pages: ogni push su `main` va in produzione.
