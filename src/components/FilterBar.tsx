import { normalizeText } from '../utils/recipes';

export type HealthyFilterValue = 'all' | 'true' | 'false';

interface FilterBarProps {
  query: string;
  healthy: HealthyFilterValue;
  selectedTag: string | null;
  availableTags: readonly string[];
  onQueryChange: (query: string) => void;
  onHealthyChange: (healthy: HealthyFilterValue) => void;
  onTagToggle: (tag: string) => void;
  onReset: () => void;
}

const HEALTHY_OPTIONS: readonly { value: HealthyFilterValue; label: string }[] = [
  { value: 'all', label: 'Vše' },
  { value: 'true', label: 'Zdravé' },
  { value: 'false', label: 'Nezdravé' },
];

export function FilterBar({
  query,
  healthy,
  selectedTag,
  availableTags,
  onQueryChange,
  onHealthyChange,
  onTagToggle,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(query.trim() || healthy !== 'all' || selectedTag);
  const normalizedSelectedTag = selectedTag ? normalizeText(selectedTag) : '';

  return (
    <section className="filter-bar no-print" aria-label="Filtrování receptů">
      <div className="filter-bar__row">
        <div className="search-input-wrap">
          <input
            type="search"
            className="search-input"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Hledat podle názvu nebo surovin…"
            aria-label="Hledat recepty podle názvu nebo surovin"
          />
        </div>

        <div
          className="segmented-control"
          role="group"
          aria-label="Filtr podle zdravosti"
        >
          {HEALTHY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                healthy === option.value
                  ? 'segmented-control__btn segmented-control__btn--active'
                  : 'segmented-control__btn'
              }
              aria-pressed={healthy === option.value}
              onClick={() => onHealthyChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="tag-list" role="group" aria-label="Filtrování podle tagů">
          {availableTags.map((tag) => {
            const isActive = normalizedSelectedTag === normalizeText(tag);
            return (
              <button
                key={tag}
                type="button"
                className={isActive ? 'tag-chip tag-chip--active' : 'tag-chip'}
                aria-pressed={isActive}
                onClick={() => onTagToggle(tag)}
              >
                #{tag}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Vymazat filtry
            </button>
          )}
        </div>
      )}
    </section>
  );
}
