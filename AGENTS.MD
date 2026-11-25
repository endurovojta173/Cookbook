# AGENTS.md

Instrukce a technický kontrakt pro AI agenty pracující na tomto repozitáři.

## 1. Přehled projektu
- **Typ:** 100% klientská SPA (`Vite` + `React` + `TypeScript`) hostovaná na **GitHub Pages**.
- **Backend / DB:** Žádný. Veškerý obsah tvoří Markdown soubory v `src/recipes/*.md` zabalené staticky při buildu.
- **Primární použití:** Mobilní telefon v kuchyni během vaření (mobile-first UX).
- **Jazyk UI a obsahu:** Čeština (kód, identifikátory a commity v angličtině).

---

## 2. Příkazy & Ověření (Definition of Done)

```bash
npm run dev          # lokální vývojový server
npx tsc --noEmit     # přísná typová kontrola
npm run test         # unit testy (Vitest)
npm run build        # produkční build
npm run preview      # náhled produkčního buildu
```

Před dokončením každé změny ověř:
1. `npx tsc --noEmit` projde bez chyb.
2. `npm run test` projde bez chyb (nová logika v `src/utils/` musí mít unit testy).
3. `npm run build` projde bez chyb a bez Node.js polyfill varování.
4. Mobilní responsivita (`375×667` a `390×844`):
   - Landing page (`/#/`) se celá vejde do `100dvh` **bez vertikálního scrollu** (`scrollHeight <= innerHeight`).
   - Žádná obrazovka nemá horizontální overflow (`scrollWidth <= innerWidth`).

---

## 3. Struktura adresářů a pojmenování

```text
├── .github/workflows/deploy.yml  # GitHub Pages deploy (Node 20+, Actions)
├── public/images/                # Statické fotky receptů (WebP, kebab-case)
├── src/
│   ├── recipes/                  # Zdrojové recepty (<slug>.md, kebab-case)
│   ├── types/                    # Sdílené TS typy (camelCase.ts, např. recipe.ts)
│   ├── utils/                    # Čisté funkce + testy (*.ts, *.test.ts)
│   │   ├── recipes.ts            # Načítání, parsování, normalizace, filtrování
│   │   ├── assets.ts             # Resolve cest k public/ přes BASE_URL
│   │   └── exportDocx.ts         # Generování .docx z marked tokenů (lazy-loaded)
│   ├── components/               # Znovupoužitelné UI komponenty (PascalCase.tsx)
│   ├── pages/                    # Stránky pro router (PascalCase.tsx)
│   └── styles/                   # Globální styly a print.css
└── vite.config.ts
```

---

## 4. Tvrdé invarianty (Neporušuj)

1. **GitHub Pages & Routing:**
   - Vždy používej `HashRouter` (nikdy `BrowserRouter` — GitHub Pages nemá server-side fallback).
   - `vite.config.ts` musí nastavit `base` kompatibilní s GitHub Pages (např. `base: './'` nebo `base: '/Cookbook/'` podle prostředí).
   - Cesty k souborům v `public/` nikdy nepiš natvrdo s úvodním `/` (rozbije se na subpathech). Vždy je prožeň helperem `resolveAssetUrl(path)` s `import.meta.env.BASE_URL`.
2. **Čistě prohlížečový kód:**
   - Žádné Node.js API (`fs`, `path`, `Buffer`, `process`) v `src/`.
   - **Nikdy nepoužívej `gray-matter`** (vyžaduje Node `Buffer`). Používej `front-matter` (nebo lehký browser-safe parser).
3. **Bezpečný rendering Markdownu:**
   - HTML z `marked` sanitizuj přes `dompurify` před vložením do DOM, aby aplikace byla imunní vůči XSS.
4. **Výkon & Bundle:**
   - `exportDocx.ts` (závislost `docx` + `file-saver`) **vždy načítej dynamicky** (`await import('../utils/exportDocx')`) až při kliknutí na export, aby nezvětšoval počáteční bundle pro mobil.
5. **Stylování & Mobile-First UX (kuchyně na mobilu):**
   - Používej čisté CSS (CSS proměnné / CSS Modules) nebo Tailwind CSS. Nepřidávej těžké UI knihovny (MUI, Ant Design, Chakra).
   - **Landing page (`/#/`) bez scrollu:** Hlavní stránka musí vyplnit přesně `100dvh` bez vertikálního scrollu na mobilu na výšku (`360×640` až `430×932`) i na desktopu — kompaktní hlavička, **2×2 mřížka kategorií** roztažená přes `flex: 1; min-height: 0` a kompaktní spodní lišta s exporty celé kuchařky (PDF / DOCX). Vertikální scroll povol pouze jako fallback na extrémně nízkých displejích (`@media (max-height: 540px)`, např. mobil na šířku).
   - **Safe-area & dotykové ovládání:** `viewport-fit=cover` v `index.html` a respektuj `env(safe-area-inset-bottom)` na spodních prvcích. Interaktivní prvky musí mít dotykovou plochu alespoň `44×44 px`.
   - **Vstupy a filtry na mobilu:** `<input>` musí mít `font-size >= 16px` (zabrání iOS Safari auto-zoomu při focusu). Tagové čipy ve `FilterBar` se na mobilu zobrazují v jednom horizontálně scrollovatelném pásu (`flex-wrap: nowrap; overflow-x: auto`), aby nezabíraly polovinu obrazovky.
   - **Čitelnost receptu:** Základní písmo receptu alespoň `16 px` s řádkováním `line-height >= 1.6`; na malém mobilu minimalizuj boční okraje (edge-to-edge článek) pro maximální využití šířky displeje.

---

## 5. Programátorské principy

- **KISS:** Přímočará řešení. Nepřidávej state management knihovny (Redux, Zustand), dokud stačí React state a URL query parametry.
- **DRY:** Parsování, filtrování, normalizaci a export centralizuj do `src/utils/`. Opakované UI prvky do `src/components/`.
- **YAGNI:** Neimplementuj funkce ani abstrakce do zásoby.
- **SRP:** Odděluj čistou datovou/byznys logiku (`src/utils/`) od prezentačních React komponent (`src/components/`, `src/pages/`).
- **Immutability:** Funkce pro filtrování a řazení musí být pure functions (nikdy nemutuj vstupní pole).
- **Strict TypeScript:** `strict: true`, žádné `any` ani `@ts-ignore`.
- **Fail-fast parsování:** Nevalidní nebo chybějící povinná pole v YAML frontmatteru musí ve vývojovém režimu (`import.meta.env.DEV`) vypsat jasné varování/chybu s názvem souboru a v produkci bezpečně fallbackovat, aby nerozbila celou aplikaci.

---

## 6. Routing a URL kontrakt

| Cesta | Stránka | Zodpovědnost |
| --- | --- | --- |
| `/#/` | `HomePage` | Rozcestník kategorií (`Snídaně`, `Obědy`, `Večeře`, `Ostatní`) s počtem receptů + export celé kuchařky (PDF, DOCX). |
| `/#/kategorie/:category` | `CategoryPage` | Výpis receptů v kategorii + filtrační lišta (Vše / Zdravé / Nezdravé, tagy, fulltext). |
| `/#/recept/:slug` | `RecipeDetailPage` | Vyrenderovaný detail receptu + export jednoho receptu (PDF, DOCX). |
| `/#/tisk` | `PrintCookbookPage` | Tiskový pohled celé kuchařky (všechny recepty za sebou s `break-after: page`) pro `window.print()`. |

### URL query parametry na `/#/kategorie/:category`
Stav filtrů drž v URL přes `useSearchParams`, aby fungovalo tlačítko Zpět a sdílení odkazů:
- `healthy`: `'true'` | `'false'` (chybí = vše)
- `tag`: konkrétní vybraný tag (nebo opakovaný parametr při více tazích)
- `q`: fulltextový dotaz

### Mapování kategorií
```ts
export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  snidane: 'Snídaně',
  obed: 'Obědy',
  vecere: 'Večeře',
  ostatni: 'Ostatní',
};
```

---

## 7. Datový model, načítání a vyhledávání

### Načítání receptů
Staticky přes Vite glob:
```ts
const recipeModules = import.meta.glob<string>('../recipes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
```
- **Slug:** Odvozuj z názvu souboru bez přípony (`../recipes/svickova-na-smetane.md` → `svickova-na-smetane`).
- **Řazení:** Výchozí řazení receptů abecedně podle `title` s českým kolátorem (`localeCompare(b, 'cs')`).

### TypeScript typy (`src/types/recipe.ts`)
```ts
export type RecipeCategory = 'snidane' | 'obed' | 'vecere' | 'ostatni';

export interface RecipeMeta {
  title: string;
  category: RecipeCategory;
  healthy: boolean;
  tags: string[];
  prepTime?: string;
  servings?: number;
  image?: string; // relativní cesta vůči public/, např. "images/svickova.webp"
}

export interface Recipe extends RecipeMeta {
  slug: string;
  content: string; // surový Markdown bez YAML frontmatteru
}

export interface RecipeFilters {
  category?: RecipeCategory;
  healthy?: boolean | null; // null/undefined = vše
  tag?: string | null;
  query?: string;
}
```

### České vyhledávání (diakritika)
Fulltextové vyhledávání (`q`) musí ignorovat diakritiku i velikost písmen:
```ts
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
```
Hledá se napříč `title`, `tags` a `content` (např. `svickova` najde `Svíčková na smetaně`).

---

## 8. Exporty (PDF & DOCX)

Veškerá logika exportů běží 100% na klientovi:

### PDF (`src/styles/print.css` + `window.print()`)
- Navigační lištu, filtry a ovládací tlačítka skryj třídou `.no-print` (`@media print { .no-print { display: none !important; } }`).
- Nadpisy a obrázky chraň proti zalomení (`break-after: avoid` na nadpisech, `break-inside: avoid` na blocích).
- **Jeden recept:** tiskne přímo `RecipeDetailPage`.
- **Celá kuchařka:** naviguje na `/#/tisk` (nebo renderuje všechny recepty seřazené podle kategorií s `break-after: page` za každým receptem kromě posledního) a zavolá `window.print()`.

### DOCX (`src/utils/exportDocx.ts`)
- Knihovny: `docx` + `file-saver` (načítané dynamicky přes `import()`).
- Markdown obsah parsuj přes `marked.lexer(recipe.content)` a mapuj tokeny:
  - `heading` → `Paragraph` s příslušným `HeadingLevel`
  - `paragraph` → `Paragraph` s inline tokeny (`strong`, `em`, `codespan`, `link`, `text`)
  - `list` → odrážkový / číslovaný seznam (`bullet` / `numbering`)
  - `blockquote`, `hr`, `space` → odpovídající `Paragraph` / oddělovač
- **DRY:** Sdílená čistá funkce `buildRecipeDocxBlocks(recipe: Recipe)` vrací pole bloků pro jeden recept.
  - `exportRecipeToDocx(recipe)` vytvoří dokument z jedné sady bloků (`<slug>.docx`).
  - `exportCookbookToDocx(recipes)` ji zavolá v cyklu s `pageBreakBefore: true` od druhého receptu (`kucharka.docx`).

---

## 9. Testování (Vitest)
Každá čistá logika v `src/utils/` musí mít unit testy (`*.test.ts`):
- `recipes.test.ts`: parsování validního/nevalidního frontmatteru, odvození slugu, české filtrování bez diakritiky, kombinace filtrů (`category` + `healthy` + `tag` + `q`), neměnnost vstupního pole.
- `assets.test.ts`: korektní skládání `BASE_URL` s relativní i lomítkovou cestou obrázku.
- `exportDocx.test.ts`: mapování `marked.lexer()` tokenů na `docx` struktury a hromadný export.
