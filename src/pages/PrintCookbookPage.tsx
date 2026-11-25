import { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExportButtons } from '../components/ExportButtons';
import { RecipeArticle } from '../components/RecipeArticle';
import { getAllRecipes, getRecipesOrderedForCookbook } from '../utils/recipes';

export function PrintCookbookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasPrintedRef = useRef(false);

  const recipes = useMemo(
    () => getRecipesOrderedForCookbook(getAllRecipes()),
    [],
  );

  useEffect(() => {
    if (searchParams.get('autoprint') === '1' && !hasPrintedRef.current) {
      hasPrintedRef.current = true;
      const timerId = window.setTimeout(() => {
        window.print();
        setSearchParams({}, { replace: true });
      }, 250);

      return () => window.clearTimeout(timerId);
    }
    return undefined;
  }, [searchParams, setSearchParams]);

  return (
    <>
      <div className="print-toolbar no-print">
        <Link to="/" className="back-link">
          ← Zpět na úvod
        </Link>

        <ExportButtons
          mode="cookbook"
          recipes={recipes}
          onPrintHere={() => window.print()}
        />
      </div>

      <div className="print-cookbook-header print-recipe-section">
        <h1>Kuchařka</h1>
        <p>Celkem {recipes.length} receptů</p>
      </div>

      <div className="print-cookbook-list">
        {recipes.map((recipe) => (
          <section key={recipe.slug} className="print-recipe-section">
            <RecipeArticle recipe={recipe} />
          </section>
        ))}
      </div>
    </>
  );
}
