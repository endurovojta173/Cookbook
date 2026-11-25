import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FilterBar, type HealthyFilterValue } from '../components/FilterBar';
import { RecipeCard } from '../components/RecipeCard';
import { CATEGORY_LABELS, isRecipeCategory } from '../types/recipe';
import {
  filterRecipes,
  getAllRecipes,
  getAvailableTags,
  normalizeText,
} from '../utils/recipes';

function parseHealthyParam(raw: string | null): HealthyFilterValue {
  if (raw === 'true' || raw === 'false') {
    return raw;
  }
  return 'all';
}

export function CategoryPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const validCategory = isRecipeCategory(category) ? category : null;

  const query = searchParams.get('q') ?? '';
  const healthyParam = parseHealthyParam(searchParams.get('healthy'));
  const selectedTag = searchParams.get('tag');

  const allRecipes = getAllRecipes();

  const categoryRecipes = useMemo(() => {
    if (!validCategory) {
      return [];
    }
    return filterRecipes(allRecipes, { category: validCategory });
  }, [allRecipes, validCategory]);

  const availableTags = useMemo(
    () => getAvailableTags(categoryRecipes),
    [categoryRecipes],
  );

  const filteredRecipes = useMemo(() => {
    if (!validCategory) {
      return [];
    }
    return filterRecipes(categoryRecipes, {
      healthy:
        healthyParam === 'all' ? null : healthyParam === 'true',
      tag: selectedTag,
      query,
    });
  }, [categoryRecipes, healthyParam, query, selectedTag, validCategory]);

  if (!validCategory) {
    return (
      <section className="empty-state">
        <h1 className="empty-state__title">Kategorie nebyla nalezena</h1>
        <p className="empty-state__text">
          Požadovaná kategorie v kuchařce neexistuje.
        </p>
        <Link to="/" className="btn btn--primary">
          Zpět na úvod
        </Link>
      </section>
    );
  }

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next, { replace: true });
  };

  const handleQueryChange = (nextQuery: string) => {
    updateParams({ q: nextQuery || null });
  };

  const handleHealthyChange = (nextHealthy: HealthyFilterValue) => {
    updateParams({ healthy: nextHealthy === 'all' ? null : nextHealthy });
  };

  const handleTagToggle = (tag: string) => {
    const isSame =
      selectedTag !== null && normalizeText(selectedTag) === normalizeText(tag);
    updateParams({ tag: isSame ? null : tag });
  };

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header__top">
          <Link to="/" className="back-link">
            ← Zpět na kategorie
          </Link>
        </div>

        <h1 className="page-header__title">{CATEGORY_LABELS[validCategory]}</h1>
        <p className="page-header__count">
          Zobrazeno {filteredRecipes.length} z {categoryRecipes.length} receptů
        </p>
      </div>

      <FilterBar
        query={query}
        healthy={healthyParam}
        selectedTag={selectedTag}
        availableTags={availableTags}
        onQueryChange={handleQueryChange}
        onHealthyChange={handleHealthyChange}
        onTagToggle={handleTagToggle}
        onReset={handleResetFilters}
      />

      {filteredRecipes.length === 0 ? (
        <section className="empty-state">
          <h2 className="empty-state__title">Žádný recept neodpovídá filtru</h2>
          <p className="empty-state__text">
            Zkus upravit hledaný výraz nebo zrušit aktivní filtry.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleResetFilters}
          >
            Zobrazit všechny recepty v kategorii
          </button>
        </section>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      )}
    </>
  );
}
