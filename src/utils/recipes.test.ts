import { describe, expect, it } from 'vitest';
import {
  extractSlugFromPath,
  filterRecipes,
  getAllRecipes,
  getAvailableTags,
  groupRecipesByCategory,
  loadRecipesFromModules,
  normalizeText,
  parseRecipeMarkdown,
} from './recipes';

const VALID_MD = `---
title: Svíčková na smetaně
category: obed
healthy: false
tags:
  - česká kuchyně
  - maso
prepTime: 120 min
servings: 4
image: images/svickova.webp
---

## Suroviny
- Hovězí zadní
- Kořenová zelenina
`;

const HEALTHY_MD = `---
title: Ovesná kaše s borůvkami
category: snidane
healthy: true
tags:
  - sladké
  - rychlé
prepTime: 10 min
servings: 2
---

## Postup
Vař vločky s mlékem a přidej borůvky.
`;

describe('normalizeText', () => {
  it('removes Czech diacritics and lowercases text', () => {
    expect(normalizeText('  Svíčková na SMETANĚ — řeřicha  ')).toBe(
      'svickova na smetane — rericha',
    );
  });
});

describe('extractSlugFromPath', () => {
  it('derives slug from markdown filename', () => {
    expect(extractSlugFromPath('../recipes/svickova-na-smetane.md')).toBe(
      'svickova-na-smetane',
    );
    expect(extractSlugFromPath('domaci-hummus.md')).toBe('domaci-hummus');
  });
});

describe('parseRecipeMarkdown', () => {
  it('parses valid frontmatter and body cleanly', () => {
    const recipe = parseRecipeMarkdown(VALID_MD, '../recipes/svickova-na-smetane.md');

    expect(recipe.slug).toBe('svickova-na-smetane');
    expect(recipe.title).toBe('Svíčková na smetaně');
    expect(recipe.category).toBe('obed');
    expect(recipe.healthy).toBe(false);
    expect(recipe.tags).toEqual(['česká kuchyně', 'maso']);
    expect(recipe.prepTime).toBe('120 min');
    expect(recipe.servings).toBe(4);
    expect(recipe.image).toBe('images/svickova.webp');
    expect(recipe.content).toContain('## Suroviny');
  });

  it('safely falls back when frontmatter fields are missing or invalid', () => {
    const brokenMd = `---
category: neexistujici
healthy: "ano"
servings: -5
---

Jen text bez titulku.`;

    const recipe = parseRecipeMarkdown(brokenMd, '../recipes/zalozni-recept.md');

    expect(recipe.slug).toBe('zalozni-recept');
    expect(recipe.title).toBe('zalozni-recept');
    expect(recipe.category).toBe('ostatni');
    expect(recipe.healthy).toBe(false);
    expect(recipe.tags).toEqual([]);
    expect(recipe.servings).toBeUndefined();
    expect(recipe.content).toBe('Jen text bez titulku.');
  });
});

describe('loadRecipesFromModules & filterRecipes', () => {
  const recipes = loadRecipesFromModules({
    '../recipes/svickova-na-smetane.md': VALID_MD,
    '../recipes/ovesna-kase.md': HEALTHY_MD,
  });

  it('sorts loaded recipes alphabetically with Czech collation', () => {
    expect(recipes.map((r) => r.slug)).toEqual(['ovesna-kase', 'svickova-na-smetane']);
  });

  it('filters by category, healthy flag, tag, and diacritics-insensitive query without mutating input', () => {
    const snapshot = [...recipes];

    expect(filterRecipes(recipes, { category: 'obed' }).map((r) => r.slug)).toEqual([
      'svickova-na-smetane',
    ]);

    expect(filterRecipes(recipes, { healthy: true }).map((r) => r.slug)).toEqual([
      'ovesna-kase',
    ]);

    expect(filterRecipes(recipes, { tag: 'ceska kuchyne' }).map((r) => r.slug)).toEqual([
      'svickova-na-smetane',
    ]);

    expect(filterRecipes(recipes, { query: 'svickova zelenina' }).map((r) => r.slug)).toEqual([
      'svickova-na-smetane',
    ]);

    expect(filterRecipes(recipes, { query: 'BORUVKY mlekem' }).map((r) => r.slug)).toEqual([
      'ovesna-kase',
    ]);

    expect(recipes).toEqual(snapshot);
  });

  it('extracts sorted unique tags and groups by category', () => {
    expect(getAvailableTags(recipes)).toEqual([
      'česká kuchyně',
      'maso',
      'rychlé',
      'sladké',
    ]);

    const grouped = groupRecipesByCategory(recipes);
    expect(grouped.snidane).toHaveLength(1);
    expect(grouped.obed).toHaveLength(1);
    expect(grouped.vecere).toHaveLength(0);
    expect(grouped.ostatni).toHaveLength(0);
  });

  it('loads bundled sample recipes from src/recipes/*.md', () => {
    const bundled = getAllRecipes();
    expect(bundled.length).toBeGreaterThanOrEqual(4);
    expect(bundled.some((r) => r.slug === 'svickova-na-smetane')).toBe(true);
  });
});
