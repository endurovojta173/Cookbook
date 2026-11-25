import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { PrintCookbookPage } from './pages/PrintCookbookPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';

export function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kategorie/:category" element={<CategoryPage />} />
          <Route path="/recept/:slug" element={<RecipeDetailPage />} />
          <Route path="/tisk" element={<PrintCookbookPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
