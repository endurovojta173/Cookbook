import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CATEGORY_LABELS, RECIPE_CATEGORIES } from '../types/recipe';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header no-print">
        <div className="site-header__inner">
          <Link to="/" className="site-brand" aria-label="Kuchařka – úvodní stránka">
            <span aria-hidden="true">🍳</span>
            <span>Kuchařka</span>
          </Link>

          <nav className="site-nav" aria-label="Hlavní kategorie">
            {RECIPE_CATEGORIES.map((category) => (
              <NavLink
                key={category}
                to={`/kategorie/${category}`}
                className={({ isActive }) =>
                  isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'
                }
              >
                {CATEGORY_LABELS[category]}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer no-print">
        Kuchařka SPA · Recepty v Markdownu · Export do PDF a DOCX
      </footer>
    </div>
  );
}
