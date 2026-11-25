import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types/recipe';

type ExportButtonsProps =
  | {
      mode: 'recipe';
      recipe: Recipe;
    }
  | {
      mode: 'cookbook';
      recipes: readonly Recipe[];
      onPrintHere?: () => void;
    };

export function ExportButtons(props: ExportButtonsProps) {
  const navigate = useNavigate();
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePrintPdf = () => {
    setErrorMessage(null);
    if (props.mode === 'recipe') {
      window.print();
      return;
    }

    if (props.onPrintHere) {
      props.onPrintHere();
      return;
    }

    navigate('/tisk?autoprint=1');
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    setErrorMessage(null);

    try {
      const { exportRecipeToDocx, exportCookbookToDocx } = await import(
        '../utils/exportDocx'
      );

      if (props.mode === 'recipe') {
        await exportRecipeToDocx(props.recipe);
      } else {
        await exportCookbookToDocx(props.recipes);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Export do DOCX se nezdařil: ${error.message}`
          : 'Export do DOCX se nezdařil.',
      );
    } finally {
      setIsExportingDocx(false);
    }
  };

  const pdfLabel =
    props.mode === 'recipe' ? 'Tisk / PDF' : 'Celá kuchařka (PDF)';
  const docxLabel =
    props.mode === 'recipe' ? 'Stáhnout DOCX' : 'Celá kuchařka (DOCX)';

  return (
    <div className="no-print">
      <div className="export-actions">
        <button type="button" className="btn btn--primary" onClick={handlePrintPdf}>
          <span aria-hidden="true">🖨️</span>
          <span>{pdfLabel}</span>
        </button>

        <button
          type="button"
          className="btn"
          onClick={handleExportDocx}
          disabled={isExportingDocx}
        >
          <span aria-hidden="true">📄</span>
          <span>{isExportingDocx ? 'Generuji DOCX…' : docxLabel}</span>
        </button>
      </div>

      {errorMessage && (
        <p className="export-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
