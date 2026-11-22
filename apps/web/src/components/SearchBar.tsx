interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search internships, companies, cities…' }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span aria-hidden="true" className="search-bar__icon">⌕</span>
      <span className="sr-only">Search job opportunities</span>
      <input value={value} onChange={(event: { target: { value: string } }) => onChange(event.target.value)} placeholder={placeholder} type="search" />
      {value ? <button type="button" aria-label="Clear search" onClick={() => onChange('')}>×</button> : null}
    </label>
  );
}
