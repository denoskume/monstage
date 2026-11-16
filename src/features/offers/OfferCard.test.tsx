import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { OfferCard } from './OfferCard';
import { getCvMatch } from '../workspace/intelligence';

const offer: InternshipOffer = {
  id: '1', company: 'Assystem', title: 'Ingénieur Data Science - Vision par ordinateur - Stage H/F', domain: 'Computer Vision', city: 'Courbevoie', region: 'Île-de-France',
  m2Fit: 'Oui probable', start: 'PFE / à confirmer', duration: '6 mois', compensation: '1 300 €/mois', skills: ['Python','Computer Vision'], publishedAt: '2026-09-15', offerStatus: 'Active', applicationStatus: 'À candidater', nextAction: 'Candidater', applicationUrl: 'https://example.com', shortlist: true, appliedAt: null, followUpAt: null, specialization: 'Computer Vision / 3D', technicalFit: 98, decisionScore: 100, priority: 'A+', freshness: 'Vérifié <24h', verifiedAt: '15/09/2026 05:16:28', sourceQuality: 'Officiel / direct', actionLevel: 'CANDIDATER 24H', calendarFit: '✅ Probable', confidence: 'Haute', relevance: null, gaps: null,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-12T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

test('renders a concise job-card summary and actions', () => {
  render(
    <OfferCard
      offer={offer}
      selected={false}
      saved
      onSelect={() => undefined}
      onToggleSave={() => undefined}
      onHide={() => undefined}
      onShare={() => undefined}
    />,
  );
  expect(screen.getByText('Assystem')).toBeInTheDocument();
  expect(screen.getByText(offer.title)).toBeInTheDocument();
  expect(screen.getByText(/Courbevoie/)).toBeInTheDocument();
  expect(screen.getByText('1 300 €/mois')).toBeInTheDocument();
  expect(screen.getByText(`${getCvMatch(offer).score}% CV match`)).toBeInTheDocument();
  expect(screen.getByText('Verified <24h')).toBeInTheDocument();
  expect(screen.getByText(/Il y a 3 semaines · 15 sept. 2026/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Remove from saved jobs' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Not interested' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Share job' })).toBeInTheDocument();
});


test('supports French publication dates and shows a fallback when missing', () => {
  const frenchDateOffer = { ...offer, publishedAt: '11/10/2026' };
  const { rerender } = render(
    <OfferCard
      offer={frenchDateOffer}
      selected={false}
      saved={false}
      onSelect={() => undefined}
      onToggleSave={() => undefined}
      onHide={() => undefined}
      onShare={() => undefined}
    />,
  );
  expect(screen.getByText(/Hier · 11 oct. 2026/)).toBeInTheDocument();

  rerender(
    <OfferCard
      offer={{ ...offer, publishedAt: null }}
      selected={false}
      saved={false}
      onSelect={() => undefined}
      onToggleSave={() => undefined}
      onHide={() => undefined}
      onShare={() => undefined}
    />,
  );
  expect(screen.getByText('Date non communiquée')).toBeInTheDocument();
});

test('shows insertion and actual update separately from the publication date', () => {
  render(
    <OfferCard offer={{ ...offer, publishedAt: '2026-10-01',
      addedAt: '2026-11-16', updatedAt: '2026-11-16T11:30:00Z' }}
      selected={false} saved={false}
      onSelect={() => undefined} onToggleSave={() => undefined}
      onHide={() => undefined} onShare={() => undefined} />,
  );
  expect(screen.getByText(/Ajoutée le 16 nov. 2026/)).toBeInTheDocument();
  expect(screen.getByText(/Mise à jour le 16 nov. 2026/)).toBeInTheDocument();
});

test('legacy offers with missing insertion/update dates show no empty date placeholders', () => {
  render(
    <OfferCard offer={{ ...offer, addedAt: null, updatedAt: null }}
      selected={false} saved={false}
      onSelect={() => undefined} onToggleSave={() => undefined}
      onHide={() => undefined} onShare={() => undefined} />,
  );
  expect(screen.queryByText(/historique · date inconnue/)).not.toBeInTheDocument();
  expect(screen.queryByText(/non renseignée/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Ajoutée le/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Mise à jour le/)).not.toBeInTheDocument();
});
