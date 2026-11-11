import { FilterChips } from './FilterChips';

/** Search box plus filter chips above a table. */
export function Toolbar({ query, onQuery, placeholder, searchLabel, filters, filter, onFilter, filterLabel }) {
  return (
    <div className="tools">
      <input
        className="search"
        type="search"
        placeholder={placeholder}
        aria-label={searchLabel}
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <FilterChips options={filters} value={filter} onChange={onFilter} label={filterLabel} />
    </div>
  );
}
