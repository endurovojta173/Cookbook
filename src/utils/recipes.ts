import fm from 'front-matter';
import {
  RECIPE_CATEGORIES,
  isRecipeCategory,
  type Recipe,
  type RecipeCategory,
  type RecipeFilters,
} from '../types/recipe';

const recipeModules = import.meta.glob<string>('../recipes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

let cachedRecipes: readonly Recipe[] | null = null;

function warnInDev(message: string): void {
  if (import.meta.env?.DEV) {
    console.warn(`[cookbook] ${message}`);
  }
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function extractSlugFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() ?? filePath;
  return fileName.replace(/\.md$/i, '');
}

function parseTags(rawTags: unknown, filePath: string): string[] {
  if (rawTags === undefined || rawTags === null) {
    return [];
  }

  if (Array.isArray(rawTags)) {
    return rawTags
      .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
      .filter((item) => item.length > 0);
  }

  if (typeof rawTags === 'string') {
    warnInDev(`Soubor "${filePath}": pole "tags" by mělo být pole, převedeno z řetězce.`);
    return rawTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  warnInDev(`Soubor "${filePath}": neplatné pole "tags", použito prázdné pole.`);
  return [];
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function parseOptionalNumber(value: unknown, fieldName: string, filePath: string): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  warnInDev(`Soubor "${filePath}": neplatná hodnota "${String(value)}" v poli "${fieldName}".`);
  return undefined;
}

export function parseRecipeMarkdown(rawMarkdown: string, filePath: string): Recipe {
  const slug = extractSlugFromPath(filePath);

  let attributes: Record<string, unknown> = {};
  let body = rawMarkdown;

  try {
    const parsed = fm<Record<string, unknown>>(rawMarkdown);
    attributes = parsed.attributes ?? {};
    body = parsed.body.trim();
  } catch (error) {
    warnInDev(
      `Soubor "${filePath}": chyba při parsování YAML hlavičky (${error instanceof Error ? error.message : String(error)}).`,
    );
  }

  const rawTitle = parseOptionalString(attributes.title);
  if (!rawTitle) {
    warnInDev(`Soubor "${filePath}": chybí povinné pole "title", použit slug "${slug}".`);
  }
  const title = rawTitle ?? slug;

  let category: RecipeCategory = 'ostatni';
  if (isRecipeCategory(attributes.category)) {
    category = attributes.category;
  } else {
    warnInDev(
      `Soubor "${filePath}": neplatná nebo chybějící kategorie "${String(attributes.category)}", použita "ostatni".`,
    );
  }

  let healthy = false;
  if (typeof attributes.healthy === 'boolean') {
    healthy = attributes.healthy;
  } else {
    warnInDev(
      `Soubor "${filePath}": pole "healthy" musí být boolean (true/false), použito false.`,
    );
  }

  const tags = parseTags(attributes.tags, filePath);
  const prepTime = parseOptionalString(attributes.prepTime);
  const servings = parseOptionalNumber(attributes.servings, 'servings', filePath);
  const image = parseOptionalString(attributes.image);

  return {
    slug,
    title,
    category,
    healthy,
    tags,
    prepTime,
    servings,
    image,
    content: body,
  };
}

export function sortRecipesAlphabetically(recipes: readonly Recipe[]): Recipe[] {
  return [...recipes].sort((a, b) => a.title.localeCompare(b.title, 'cs'));
}

export function loadRecipesFromModules(modules: Record<string, string>): Recipe[] {
  const parsed = Object.entries(modules).map(([filePath, raw]) =>
    parseRecipeMarkdown(raw, filePath),
  );
  return sortRecipesAlphabetically(parsed);
}

export function getAllRecipes(): readonly Recipe[] {
  if (!cachedRecipes) {
    cachedRecipes = loadRecipesFromModules(recipeModules);
  }
  return cachedRecipes;
}

export function getRecipeBySlug(
  slug: string,
  recipes: readonly Recipe[] = getAllRecipes(),
): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function filterRecipes(
  recipes: readonly Recipe[],
  filters: RecipeFilters,
): Recipe[] {
  const normalizedTag = filters.tag ? normalizeText(filters.tag) : '';
  const queryTokens = filters.query
    ? normalizeText(filters.query)
        .split(/\s+/)
        .filter((token) => token.length > 0)
    : [];

  return recipes.filter((recipe) => {
    if (filters.category && recipe.category !== filters.category) {
      return false;
    }

    if (typeof filters.healthy === 'boolean' && recipe.healthy !== filters.healthy) {
      return false;
    }

    if (normalizedTag) {
      const hasTag = recipe.tags.some((tag) => normalizeText(tag) === normalizedTag);
      if (!hasTag) {
        return false;
      }
    }

    if (queryTokens.length > 0) {
      const haystack = normalizeText(
        `${recipe.title} ${recipe.tags.join(' ')} ${recipe.content}`,
      );
      const matchesAllTokens = queryTokens.every((token) => haystack.includes(token));
      if (!matchesAllTokens) {
        return false;
      }
    }

    return true;
  });
}

export function getAvailableTags(recipes: readonly Recipe[]): string[] {
  const tagMap = new Map<string, string>();

  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      const normalized = normalizeText(tag);
      if (!tagMap.has(normalized)) {
        tagMap.set(normalized, tag);
      }
    }
  }

  return [...tagMap.values()].sort((a, b) => a.localeCompare(b, 'cs'));
}

export function groupRecipesByCategory(
  recipes: readonly Recipe[],
): Record<RecipeCategory, Recipe[]> {
  const grouped: Record<RecipeCategory, Recipe[]> = {
    snidane: [],
    obed: [],
    vecere: [],
    ostatni: [],
  };

  for (const recipe of sortRecipesAlphabetically(recipes)) {
    grouped[recipe.category].push(recipe);
  }

  return grouped;
}

export function getRecipesOrderedForCookbook(recipes: readonly Recipe[]): Recipe[] {
  const grouped = groupRecipesByCategory(recipes);
  return RECIPE_CATEGORIES.flatMap((category) => grouped[category]);
}
