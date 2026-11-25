# Kuchařka SPA

Statická webová aplikace (SPA) pro správu a prohlížení receptů psaných v Markdownu s podporou exportu do PDF a Wordu (`.docx`). Běží 100% v prohlížeči na GitHub Pages bez backendu a bez databáze, navržená především pro pohodlné čtení na mobilu v kuchyni.

> **Pro AI agenty a vývojáře:** Technický kontrakt, architektonická pravidla a verifikační postupy jsou v [AGENTS.MD](./AGENTS.MD).

---

## Funkce
- **Mobilní rozcestník bez scrollu:** Hlavní stránka je navržená přesně na výšku obrazovky (`100dvh`) jako 2×2 mřížka kategorií (`Snídaně`, `Obědy`, `Večeře`, `Ostatní`) + rychlý export celé kuchařky jednou rukou.
- **Chytré filtrování:** Přepínač `Vše / Zdravé / Nezdravé`, kompaktní pás tagů a české fulltextové vyhledávání bez ohledu na diakritiku. Aktivní filtry se ukládají do URL.
- **Pohodlné čtení při vaření:** Plně responzivní detail receptu s velkým písmem, dotykovými prvky (`≥ 44 px`) a podporou safe-area okrajů na mobilech.
- **Recepty v Markdownu:** Každý recept je samostatný `.md` soubor s YAML hlavičkou.
- **Export do PDF a DOCX:** Stažení jednotlivého receptu i celé kuchařky přímo v prohlížeči.
- **Automatický deploy:** Publikace na GitHub Pages přes GitHub Actions.

---

## Tech Stack
- **Core:** Vite, React, TypeScript (`strict: true`)
- **Routing:** React Router (`HashRouter`)
- **Markdown:** `front-matter`, `marked`, `dompurify`
- **Exporty:** CSS `@media print` (PDF), `docx` + `file-saver` (DOCX, lazy-loaded)
- **Testy:** Vitest

---

## Struktura projektu
```text
├── .github/workflows/deploy.yml  # Automatický deploy na GitHub Pages
├── public/images/                # Komprimované fotky receptů (WebP)
├── src/
│   ├── recipes/                  # Zdrojové .md soubory receptů
│   ├── pages/                    # HomePage, CategoryPage, RecipeDetailPage, PrintCookbookPage
│   ├── components/               # Znovupoužitelné UI komponenty (filtry, karty, export tlačítka)
│   ├── utils/
│   │   ├── recipes.ts            # Načítání, parsování a filtrování receptů
│   │   ├── assets.ts             # Resolve cest k public/ přes BASE_URL
│   │   └── exportDocx.ts         # Generování .docx z Markdown tokenů
│   ├── types/recipe.ts           # Sdílené TypeScript typy
│   └── styles/print.css          # Tiskové styly pro PDF export
└── vite.config.ts
```

---

## Lokální vývoj

```bash
npm install          # instalace závislostí
npm run dev          # spuštění vývojového serveru
npx tsc --noEmit     # kontrola TypeScript typů
npm run test         # spuštění unit testů (Vitest)
npm run build        # produkční build do dist/
npm run preview      # lokální náhled produkčního buildu
```

---

## Jak přidat nový recept

1. Vytvoř soubor `src/recipes/<nazev-receptu>.md` (používej `kebab-case` bez diakritiky — název souboru tvoří URL slug).
2. Případnou fotku ulož do `public/images/<nazev-receptu>.webp` a v hlavičce uveď relativní cestu `images/<nazev-receptu>.webp` (bez úvodního `/`).
3. Vyplň YAML hlavičku a text receptu v Markdownu:

```markdown
---
title: Svíčková na smetaně
category: obed
healthy: false
tags:
  - česká kuchyně
  - maso
prepTime: 120 min
servings: 4
image: images/svickova-na-smetane.webp
---

## Suroviny
- 800 g hovězí zadní
- 200 g kořenové zeleniny (mrkev, celer, petržel)
- 1 velká cibule
- 250 ml smetany ke šlehání
- sůl, pepř, nové koření, bobkový list, tymián

## Postup
1. Maso osol, opepři a zprudka opeč ze všech stran.
2. Na výpeku orestuj zeleninu a cibuli dozlatova, přidej koření a podlij vývarem.
3. Dus doměkka, poté maso vyjmi, omáčku rozmixuj a zjemni smetanou.
```

### Pole v YAML hlavičce

| Pole | Povinné | Typ / Hodnoty | Popis |
| --- | --- | --- | --- |
| `title` | Ano | `string` | Název receptu |
| `category` | Ano | `snidane` \| `obed` \| `vecere` \| `ostatni` | Hlavní kategorie |
| `healthy` | Ano | `boolean` | `true` (zdravé) / `false` (nezdravé) |
| `tags` | Ano | `string[]` | Štítky pro filtrování (může být prázdné `[]`) |
| `prepTime` | Ne | `string` | Doba přípravy (např. `30 min`) |
| `servings` | Ne | `number` | Počet porcí |
| `image` | Ne | `string` | Relativní cesta k fotce v `public/` (např. `images/foto.webp`) |

---

## Deploy na GitHub Pages

1. V nastavení repozitáře na GitHubu (**Settings → Pages**) nastav **Source** na **GitHub Actions**.
2. Push do větve `main` automaticky spustí workflow `.github/workflows/deploy.yml`, které sestaví `dist/` a nasadí aplikaci na GitHub Pages.
