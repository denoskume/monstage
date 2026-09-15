import { render, screen } from '@testing-library/react';
import type { InternshipOffer } from '../../api/contract';
import { OfferCard } from './OfferCard';

const offer: InternshipOffer = {
  id: '1', company: 'Assystem', title: 'Ingénieur Data Science - Vision par ordinateur - Stage H/F', domain: 'Computer Vision', city: 'Courbevoie', region: 'Île-de-France',
  m2Fit: 'Oui probable', start: 'PFE / à confirmer', duration: '6 mois', compensation: '1 300 €/mois', skills: ['Python','Computer Vision'], publishedAt: '2026-09-15', offerStatus: 'Active', applicationStatus: 'À candidater', nextAction: 'Candidater', applicationUrl: 'https://example.com', shortlist: true, appliedAt: null, followUpAt: null, specialization: 'Computer Vision / 3D', technicalFit: 98, decisionScore: 100, priority: 'A+', freshness: 'Vérifié <24h', verifiedAt: '15/09/2026 05:16:28', sourceQuality: 'Officiel / direct', actionLevel: 'CANDIDATER 24H', calendarFit: '✅ Probable', confidence: 'Haute', relevance: null, gaps: null,
};

test('renders decision-critical offer information in English while preserving the official title', () => {
  render(<OfferCard offer={offer} selected={false} onSelect={() => undefined} />);
  expect(screen.getByText('Assystem')).toBeInTheDocument();
  expect(screen.getByText(offer.title)).toBeInTheDocument();
  expect(screen.getByText('Courbevoie')).toBeInTheDocument();
  expect(screen.getByText('Computer Vision / 3D')).toBeInTheDocument();
  expect(screen.getByText('A+')).toBeInTheDocument();
  expect(screen.getByText('Score 100/100')).toBeInTheDocument();
  expect(screen.getByText('Likely yes')).toBeInTheDocument();
  expect(screen.getByText('Verified <24h')).toBeInTheDocument();
  expect(screen.getByText('Official / direct')).toBeInTheDocument();
  expect(screen.getByLabelText('In shortlist')).toBeInTheDocument();
});
