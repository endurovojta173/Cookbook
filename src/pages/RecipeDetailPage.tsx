import { Link, useParams } from 'react-router-dom';
import { ExportButtons } from '../components/ExportButtons';
import { RecipeArticle } from '../components/RecipeArticle';
import { CATEGORY_LABELS } from '../types/recipe';
import { getRecipeBySlug } from '../utils/recipes';

export function RecipeDetailPage() {
  const { slug } = useParams();
  const recipe = slug ? getRecipeBySlug(slug) : undefined;

  if (!recipe) {
    return (
      <section className="empty-state">
        <h1 className="empty-state__title">Recept nebyl nalezen</h1>
        <p className="empty-state__text">
          Tento recept v kuchařce neexistuje nebo byl přesunut.
        </p>
        <Link to="/" className="btn btn--primary">
          Zpět na úvod
        </Link>
      </section>
    );
  }

  return (
    <>
      <div className="page-header no-print">
        <div className="page-header__top">
          <Link to={`/kategorie/${recipe.category}`} className="back-link">
            ← Zpět na {CATEGORY_LABELS[recipe.category]}
          </Link>
          <ExportButtons mode="recipe" recipe={recipe} />
        </div>
      </div>

      <RecipeArticle recipe={recipe} />
    </>
  );
}
