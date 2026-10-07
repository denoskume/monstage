import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InternshipOffer } from '../../api/contract';
import { filterOffers } from './offerSelectors';
import type { OfferFilters as OfferFilterState } from './offerTypes';
import { OfferFilters as OfferFiltersComponent } from './OfferFilters';

const base: InternshipOffer = {
  id: 'base',
  company: 'Acme',
  title: 'Computer Vision Intern',
  domain: 'AI',
  city: 'Nantes',
  region: 'Pays de la Loire',
  m2Fit: 'Oui',
  start: 'Janvier 2027',
  duration: '6 mois',
  compensation: null,
  skills: ['Python', 'OpenCV'],
  publishedAt: '2026-09-10',
  offerStatus: 'Active',
  applicationStatus: 'À candidater',
  nextAction: null,
  applicationUrl: 'https://example.com',
  shortlist: false,
  appliedAt: null,
  followUpAt: null,
  specialization: 'Computer Vision / 3D',
  technicalFit: 95,
  decisionScore: 96,
  priority: 'A+',
  freshness: 'Vérifié <24h',
  verifiedAt: '2026-09-15T06:00:00Z',
  sourceQuality: 'Officiel / direct',
  actionLevel: 'CANDIDATER 24H',
  calendarFit: '✅ Aligné',
  confidence: 'Haute',
  relevance: null,
  gaps: null,
};

const offers: InternshipOffer[] = [
  { ...base, id: 'nantes', company: 'Nantes Co', city: 'Nantes' },
  { ...base, id: 'paris', company: 'Paris Co', city: 'Paris' },
  { ...base, id: 'grenoble', company: 'Grenoble Co', city: 'Grenoble' },
];

const emptyFilters: OfferFiltersComponent = {
  query: '',
  specialization: null,
  city: null,
  priority: null,
  minScore: 0,
  freshness: null,
  m2Fit: null,
  sourceQuality: null,
  applicationStatus: null,
  onlyForMe: false,
};

function Harness() {
  const [draft, setDraft] = useState<OfferFiltersComponent>(emptyFilters);
  const [applied, setApplied] = useState<OfferFiltersComponent>(emptyFilters);
  const visible = filterOffers(offers, applied);

  return (
    <>
      <OfferFiltersComponent
        offers={offers}
        filters={draft}
        onChange={setDraft}
        onReset={() => setDraft(emptyFilters)}
        onApply={setApplied}
      />
      <div data-testid="results">{visible.map((offer) => <span key={offer.id}>{offer.city}</span>)}</div>
    </>
  );
}

test('applying a city from the filter form renders only that city', async () => {
  const user = userEvent.setup();
  render(<Harness />);

  await user.selectOptions(screen.getByLabelText('City'), 'Nantes');
  await user.click(screen.getByRole('button', { name: 'Apply filters' }));

  expect(screen.getByTestId('results')).toHaveTextContent('Nantes');
  expect(screen.getByTestId('results')).not.toHaveTextContent('Paris');
  expect(screen.getByTestId('results')).not.toHaveTextContent('Grenoble');
});

test('applies multiple selected criteria together from the submitted form', async () => {
  const user = userEvent.setup();
  render(<Harness />);

  await user.selectOptions(screen.getByLabelText('City'), 'Nantes');
  await user.selectOptions(screen.getByLabelText('Priority'), 'A+');
  await user.click(screen.getByRole('button', { name: 'Apply filters' }));

  expect(screen.getByTestId('results').textContent).toBe('Nantes');
});
