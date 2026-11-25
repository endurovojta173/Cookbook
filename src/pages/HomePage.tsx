import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExportButtons } from '../components/ExportButtons';
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  RECIPE_CATEGORIES,
} from '../types/recipe';
import { getAllRecipes, groupRecipesByCategory } from '../utils/recipes';

function formatRecipeCount(count: number): string {
  if (count === 1) {
    return '1 recept';
  }
  if (count >= 2 && count <= 4) {
    return `${count} recepty`;
  }
  return `${count} receptů`;
}

export function HomePage() {
  const recipes = getAllRecipes();
  const grouped = useMemo(() => groupRecipesByCategory(recipes), [recipes]);

  return (
    <>
      <section className="hero">
        <h1 className="hero__title">Osobní kuchařka</h1>
        <p className="hero__subtitle">
          Vyber si kategorii a vař pohodlně z mobilu. Celkem obsahuje{' '}
          <strong>{formatRecipeCount(recipes.length)}</strong> s možností exportu do PDF
          nebo Wordu.
        </p>
        <ExportButtons mode="cookbook" recipes={recipes} />
      </section>

      <section aria-label="Kategorie receptů">
        <div className="category-grid">
          {RECIPE_CATEGORIES.map((category) => {
            const count = grouped[category].length;
            return (
              <Link
                key={category}
                to={`/kategorie/${category}`}
                className="category-card"
              >
                <div className="category-card__header">
                  <h2 className="category-card__title">{CATEGORY_LABELS[category]}</h2>
                  <span className="category-card__badge" aria-label={formatRecipeCount(count)}>
                    {count}
                  </span>
                </div>
                <p className="category-card__description">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
