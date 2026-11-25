import { Packer } from 'docx';
import { describe, expect, it } from 'vitest';
import type { Recipe } from '../types/recipe';
import { buildRecipeDocxBlocks, createCookbookDocument } from './exportDocx';

const SAMPLE_RECIPE: Recipe = {
  slug: 'svickova-na-smetane',
  title: 'Svíčková na smetaně',
  category: 'obed',
  healthy: false,
  tags: ['česká kuchyně', 'maso'],
  prepTime: '120 min',
  servings: 4,
  content: `Poctivá omáčka s **výraznou** chutí a *jemnou* smetanou.

## Suroviny
- 800 g hovězí zadní
- 250 ml smetany

## Postup
1. Maso zatáhni na másle.
2. Zeleninu rozmixuj dohladka.

> Tip: Nech uležet do druhého dne.
`,
};

const SECOND_RECIPE: Recipe = {
  slug: 'ovesna-kase',
  title: 'Ovesná kaše',
  category: 'snidane',
  healthy: true,
  tags: ['rychlé'],
  content: '## Suroviny\n- Vločky\n- Mléko',
};

describe('exportDocx', () => {
  it('converts markdown recipe tokens into docx paragraph blocks', () => {
    const blocks = buildRecipeDocxBlocks(SAMPLE_RECIPE);

    // Title + metadata + intro paragraph + 2 headings + 2 bullets + 2 ordered steps + blockquote = 10
    expect(blocks.length).toBe(10);
  });

  it('generates a valid .docx binary buffer for single and multi-recipe cookbooks', async () => {
    const singleDoc = createCookbookDocument([SAMPLE_RECIPE], SAMPLE_RECIPE.title);
    const singleBuffer = await Packer.toBuffer(singleDoc);
    // DOCX files are ZIP archives starting with "PK" (0x50, 0x4B)
    expect(singleBuffer.byteLength).toBeGreaterThan(1000);
    expect(singleBuffer[0]).toBe(0x50);
    expect(singleBuffer[1]).toBe(0x4b);

    const multiDoc = createCookbookDocument([SAMPLE_RECIPE, SECOND_RECIPE], 'Kuchařka');
    const multiBuffer = await Packer.toBuffer(multiDoc);
    expect(multiBuffer.byteLength).toBeGreaterThan(singleBuffer.byteLength);
    expect(multiBuffer[0]).toBe(0x50);
    expect(multiBuffer[1]).toBe(0x4b);
  });
});
