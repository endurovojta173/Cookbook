export type RecipeCategory = 'snidane' | 'obed' | 'vecere' | 'ostatni';

export const RECIPE_CATEGORIES: readonly RecipeCategory[] = [
  'snidane',
  'obed',
  'vecere',
  'ostatni',
] as const;

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  snidane: 'Snídaně',
  obed: 'Obědy',
  vecere: 'Večeře',
  ostatni: 'Ostatní',
};

export const CATEGORY_DESCRIPTIONS: Record<RecipeCategory, string> = {
  snidane: 'Rychlý i vydatný start do nového dne',
  obed: 'Hlavní jídla, česká klasika i lehké talíře',
  vecere: 'Teplé i studené večeře bez zbytečné složitosti',
  ostatni: 'Pomazánky, svačiny, dezerty a doplňky',
};

export interface RecipeMeta {
  title: string;
  category: RecipeCategory;
  healthy: boolean;
  tags: string[];
  prepTime?: string;
  servings?: number;
  image?: string;
}

export interface Recipe extends RecipeMeta {
  slug: string;
  content: string;
}

export interface RecipeFilters {
  category?: RecipeCategory;
  healthy?: boolean | null;
  tag?: string | null;
  query?: string;
}

export function isRecipeCategory(value: unknown): value is RecipeCategory {
  return (
    typeof value === 'string' &&
    (RECIPE_CATEGORIES as readonly string[]).includes(value)
  );
}
