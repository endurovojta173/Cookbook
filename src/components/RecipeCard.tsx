import { Link } from 'react-router-dom';
import type { Recipe } from '../types/recipe';
import { resolveAssetUrl } from '../utils/assets';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.image ? resolveAssetUrl(recipe.image) : '';

  return (
    <Link to={`/recept/${recipe.slug}`} className="recipe-card">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={recipe.title}
          className="recipe-card__image"
          loading="lazy"
        />
      )}

      <div className="recipe-card__body">
        <h2 className="recipe-card__title">{recipe.title}</h2>

        <div className="recipe-meta">
          <span className={`badge ${recipe.healthy ? 'badge--healthy' : 'badge--indulgent'}`}>
            {recipe.healthy ? 'Zdravé' : 'Nezdravé'}
          </span>
          {recipe.prepTime && <span>⏱ {recipe.prepTime}</span>}
          {recipe.servings && <span>🍽 {recipe.servings} porce</span>}
        </div>

        {recipe.tags.length > 0 && (
          <div className="recipe-meta">
            {recipe.tags.map((tag) => (
              <span key={tag} className="badge badge--tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
