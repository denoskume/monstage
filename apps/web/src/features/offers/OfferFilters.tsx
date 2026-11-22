import type { FormEvent } from 'react';
import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';
import { industryOptions, offerIndustry, uniqueValues } from './offerSelectors';
import type { OfferFilters } from './offerTypes';

function SelectField({ name, label, value, onChange, options }: { name: string; label: string; value: string | null; onChange: (value: string | null) => void; options: string[] }) {
  return (
    <label className="filter-field"><span>{label}</span><select name={name} value={value ?? ''} onChange={(event: { target: { value: string } }) => onChange(event.target.value || null)}><option value="">All</option>{options.map((option) => <option key={option} value={option}>{displayValue(option)}</option>)}</select></label>
  );
}

function IndustryField({ offers, value, onChange }: { offers: InternshipOffer[]; value: string | null; onChange: (value: string | null) => void }) {
  const counts = new Map<string, number>();
  offers.forEach((offer) => {
    const industry = offerIndustry(offer);
    counts.set(industry, (counts.get(industry) ?? 0) + 1);
  });

  const options = industryOptions
    .map((industry) => ({ industry, count: counts.get(industry) ?? 0 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <label className="filter-field filter-field--industry">
      <span>Industry</span>
      <select name="industry" value={value ?? ''} onChange={(event: { target: { value: string } }) => onChange(event.target.value || null)}>
        <option value="">All industries ({offers.length})</option>
        {options.map(({ industry, count }) => (
          <option key={industry} value={industry}>{industry} ({count})</option>
        ))}
      </select>
    </label>
  );
}

export function OfferFilters({ offers, filters, onChange, onReset, onClose, onApply, mobile = false }: { offers: InternshipOffer[]; filters: OfferFilters; onChange: (next: OfferFilters) => void; onReset: () => void; onClose?: () => void; onApply?: (filters: OfferFilters) => void; mobile?: boolean }) {
  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onApply) return;

    const form = new FormData(event.currentTarget);
    const valueOrNull = (name: string) => {
      const value = String(form.get(name) ?? '').trim();
      return value || null;
    };

    onApply({
      ...filters,
      specialization: valueOrNull('specialization'),
      industry: valueOrNull('industry'),
      city: valueOrNull('city'),
      priority: valueOrNull('priority'),
      minScore: Number(form.get('minScore') ?? 0),
      freshness: valueOrNull('freshness'),
      m2Fit: valueOrNull('m2Fit'),
      sourceQuality: valueOrNull('sourceQuality'),
      applicationStatus: valueOrNull('applicationStatus'),
    });
  }

  return (
    <form className={`filters-panel${mobile ? ' filters-panel--mobile' : ''}`} onSubmit={submitFilters}>
      <div className="filters-panel__header"><div><strong>Filters</strong><span>Refine your results</span></div>{onClose ? <button type="button" aria-label="Close filters" onClick={onClose}>×</button> : null}</div>
      <div className="filters-grid">
        <IndustryField offers={offers} value={filters.industry} onChange={(value) => onChange({ ...filters, industry: value })} />
        <SelectField name="specialization" label="Specialization" value={filters.specialization} onChange={(value) => onChange({ ...filters, specialization: value })} options={uniqueValues(offers, 'specialization')} />
        <SelectField name="city" label="City" value={filters.city} onChange={(value) => onChange({ ...filters, city: value })} options={uniqueValues(offers, 'city')} />
        <SelectField name="priority" label="Priority" value={filters.priority} onChange={(value) => onChange({ ...filters, priority: value })} options={['A+','A','B+','B']} />
        <label className="filter-field"><span>Minimum score</span><select name="minScore" value={String(filters.minScore)} onChange={(event: { target: { value: string } }) => onChange({ ...filters, minScore: Number(event.target.value) })}>{[0,70,80,85,90,95].map((score) => <option key={score} value={score}>{score === 0 ? 'All' : `${score}+`}</option>)}</select></label>
        <SelectField name="freshness" label="Freshness" value={filters.freshness} onChange={(value) => onChange({ ...filters, freshness: value })} options={uniqueValues(offers, 'freshness')} />
        <SelectField name="m2Fit" label="M2 2027 fit" value={filters.m2Fit} onChange={(value) => onChange({ ...filters, m2Fit: value })} options={uniqueValues(offers, 'm2Fit')} />
        <SelectField name="sourceQuality" label="Source" value={filters.sourceQuality} onChange={(value) => onChange({ ...filters, sourceQuality: value })} options={uniqueValues(offers, 'sourceQuality')} />
        <SelectField name="applicationStatus" label="Status" value={filters.applicationStatus} onChange={(value) => onChange({ ...filters, applicationStatus: value })} options={uniqueValues(offers, 'applicationStatus')} />
      </div>
      <div className="filters-panel__actions"><button type="button" className="button button--ghost" onClick={onReset}>Reset</button>{onApply ? <button type="submit" className="button button--primary">Apply filters</button> : null}</div>
    </form>
  );
}
