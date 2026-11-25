import { useMemo } from 'react';
import { CATEGORY_LABELS, type Recipe } from '../types/recipe';
import { resolveAssetUrl } from '../utils/assets';
import { renderMarkdownToSafeHtml } from '../utils/markdown';

interface RecipeArticleProps {
  recipe: Recipe;
}

export function RecipeArticle({ recipe }: RecipeArticleProps) {
  const imageUrl = recipe.image ? resolveAssetUrl(recipe.image) : '';
  const safeHtml = useMemo(
    () => renderMarkdownToSafeHtml(recipe.content),
    [recipe.content],
  );

  return (
    <article className="recipe-article">
      <header>
        <h1 className="recipe-article__title">{recipe.title}</h1>

        <div className="recipe-meta recipe-article__meta">
          <span className="badge badge--tag">{CATEGORY_LABELS[recipe.category]}</span>
          <span className={`badge ${recipe.healthy ? 'badge--healthy' : 'badge--indulgent'}`}>
            {recipe.healthy ? 'Zdravé' : 'Nezdravé'}
          </span>
          {recipe.prepTime && <span>⏱ {recipe.prepTime}</span>}
          {recipe.servings && <span>🍽 {recipe.servings} porce</span>}
        </div>

        {recipe.tags.length > 0 && (
          <div className="recipe-article__tags">
            {recipe.tags.map((tag) => (
              <span key={tag} className="badge badge--tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={recipe.title}
          className="recipe-article__image"
        />
      )}

      <div
        className="recipe-markdown"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </article>
  );
}
