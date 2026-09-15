import type { InternshipOffer } from '../../api/contract';
import { uniqueValues } from './offerSelectors';
import type { OfferFilters } from './offerTypes';

function SelectField({ label, value, onChange, options }: { label: string; value: string | null; onChange: (value: string | null) => void; options: string[] }) {
  return (
    <label className="filter-field"><span>{label}</span><select value={value ?? ''} onChange={(event: { target: { value: string } }) => onChange(event.target.value || null)}><option value="">Tous</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  );
}

export function OfferFilters({ offers, filters, onChange, onReset, onClose, mobile = false }: { offers: InternshipOffer[]; filters: OfferFilters; onChange: (next: OfferFilters) => void; onReset: () => void; onClose?: () => void; mobile?: boolean }) {
  return (
    <div className={`filters-panel${mobile ? ' filters-panel--mobile' : ''}`}>
      <div className="filters-panel__header"><div><strong>Filtres</strong><span>Affinez les résultats</span></div>{onClose ? <button type="button" aria-label="Fermer les filtres" onClick={onClose}>×</button> : null}</div>
      <div className="filters-grid">
        <SelectField label="Spécialisation" value={filters.specialization} onChange={(value) => onChange({ ...filters, specialization: value })} options={uniqueValues(offers, 'specialization')} />
        <SelectField label="Ville" value={filters.city} onChange={(value) => onChange({ ...filters, city: value })} options={uniqueValues(offers, 'city')} />
        <SelectField label="Priorité" value={filters.priority} onChange={(value) => onChange({ ...filters, priority: value })} options={['A+','A','B+','B']} />
        <label className="filter-field"><span>Score minimum</span><select value={String(filters.minScore)} onChange={(event: { target: { value: string } }) => onChange({ ...filters, minScore: Number(event.target.value) })}>{[0,70,80,85,90,95].map((score) => <option key={score} value={score}>{score === 0 ? 'Tous' : `${score}+`}</option>)}</select></label>
        <SelectField label="Fraîcheur" value={filters.freshness} onChange={(value) => onChange({ ...filters, freshness: value })} options={uniqueValues(offers, 'freshness')} />
        <SelectField label="M2 2027" value={filters.m2Fit} onChange={(value) => onChange({ ...filters, m2Fit: value })} options={uniqueValues(offers, 'm2Fit')} />
        <SelectField label="Source" value={filters.sourceQuality} onChange={(value) => onChange({ ...filters, sourceQuality: value })} options={uniqueValues(offers, 'sourceQuality')} />
        <SelectField label="Statut" value={filters.applicationStatus} onChange={(value) => onChange({ ...filters, applicationStatus: value })} options={uniqueValues(offers, 'applicationStatus')} />
      </div>
      <div className="filters-panel__actions"><button type="button" className="button button--ghost" onClick={onReset}>Réinitialiser</button>{onClose ? <button type="button" className="button button--primary" onClick={onClose}>Appliquer</button> : null}</div>
    </div>
  );
}
