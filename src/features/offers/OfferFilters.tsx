import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';
import { uniqueValues } from './offerSelectors';
import type { OfferFilters } from './offerTypes';

function SelectField({ label, value, onChange, options }: { label: string; value: string | null; onChange: (value: string | null) => void; options: string[] }) {
  return (
    <label className="filter-field"><span>{label}</span><select value={value ?? ''} onChange={(event: { target: { value: string } }) => onChange(event.target.value || null)}><option value="">All</option>{options.map((option) => <option key={option} value={option}>{displayValue(option)}</option>)}</select></label>
  );
}

export function OfferFilters({ offers, filters, onChange, onReset, onClose, mobile = false }: { offers: InternshipOffer[]; filters: OfferFilters; onChange: (next: OfferFilters) => void; onReset: () => void; onClose?: () => void; mobile?: boolean }) {
  return (
    <div className={`filters-panel${mobile ? ' filters-panel--mobile' : ''}`}>
      <div className="filters-panel__header"><div><strong>Filters</strong><span>Refine your results</span></div>{onClose ? <button type="button" aria-label="Close filters" onClick={onClose}>×</button> : null}</div>
      <div className="filters-grid">
        <SelectField label="Specialization" value={filters.specialization} onChange={(value) => onChange({ ...filters, specialization: value })} options={uniqueValues(offers, 'specialization')} />
        <SelectField label="City" value={filters.city} onChange={(value) => onChange({ ...filters, city: value })} options={uniqueValues(offers, 'city')} />
        <SelectField label="Priority" value={filters.priority} onChange={(value) => onChange({ ...filters, priority: value })} options={['A+','A','B+','B']} />
        <label className="filter-field"><span>Minimum score</span><select value={String(filters.minScore)} onChange={(event: { target: { value: string } }) => onChange({ ...filters, minScore: Number(event.target.value) })}>{[0,70,80,85,90,95].map((score) => <option key={score} value={score}>{score === 0 ? 'All' : `${score}+`}</option>)}</select></label>
        <SelectField label="Freshness" value={filters.freshness} onChange={(value) => onChange({ ...filters, freshness: value })} options={uniqueValues(offers, 'freshness')} />
        <SelectField label="M2 2027 fit" value={filters.m2Fit} onChange={(value) => onChange({ ...filters, m2Fit: value })} options={uniqueValues(offers, 'm2Fit')} />
        <SelectField label="Source" value={filters.sourceQuality} onChange={(value) => onChange({ ...filters, sourceQuality: value })} options={uniqueValues(offers, 'sourceQuality')} />
        <SelectField label="Status" value={filters.applicationStatus} onChange={(value) => onChange({ ...filters, applicationStatus: value })} options={uniqueValues(offers, 'applicationStatus')} />
      </div>
      <div className="filters-panel__actions"><button type="button" className="button button--ghost" onClick={onReset}>Reset</button>{onClose ? <button type="button" className="button button--primary" onClick={onClose}>Apply</button> : null}</div>
    </div>
  );
}
