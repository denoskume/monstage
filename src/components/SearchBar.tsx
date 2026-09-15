interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Rechercher un stage, une entreprise, une ville…' }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span aria-hidden="true" className="search-bar__icon">⌕</span>
      <span className="sr-only">Rechercher dans les offres</span>
      <input value={value} onChange={(event: { target: { value: string } }) => onChange(event.target.value)} placeholder={placeholder} type="search" />
      {value ? <button type="button" aria-label="Effacer la recherche" onClick={() => onChange('')}>×</button> : null}
    </label>
  );
}
