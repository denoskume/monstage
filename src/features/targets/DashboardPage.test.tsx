import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../dashboard/DashboardPage';

vi.mock('../../hooks/useOffers', () => ({ useOffers: () => ({ data: {offers: []}, loading: false, error: null, retry: vi.fn() }) }));
vi.mock('../../auth/useAuth', () => ({ useAuth: () => ({ token: 'test' }) }));

describe('company-first dashboard', () => {
  it('shows three transport sectors and exactly fifteen company dossiers', () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<DashboardPage/>}/></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', {name:'Vue d’ensemble'})).toBeInTheDocument();
    expect(screen.getAllByText('5 entreprises')).toHaveLength(3);
    expect(screen.getByRole('heading', {name:'15 entreprises · deux plans'})).toBeInTheDocument();
    expect(screen.getAllByText('Fiche entreprise et préparation d’appel')).toHaveLength(15);
    expect(screen.getByText('Candidatures envoyées').nextElementSibling).toHaveTextContent('0');
  });
  it('shows the exact same companies under A and B, and no B1/B2 tabs', () => {
    const first = render(<MemoryRouter initialEntries={['/dashboard?plan=A']}><Routes><Route path="/dashboard" element={<DashboardPage/>}/></Routes></MemoryRouter>);
    expect(screen.getByRole('link',{name:/Plan A/})).toHaveAttribute('aria-current','page');
    expect(screen.getByRole('heading',{name:'SNCF'})).toBeInTheDocument();
    first.unmount();
    render(<MemoryRouter initialEntries={['/dashboard?plan=B']}><Routes><Route path="/dashboard" element={<DashboardPage/>}/></Routes></MemoryRouter>);
    expect(screen.getByRole('link',{name:/Plan B/})).toHaveAttribute('aria-current','page');
    expect(screen.getByRole('heading',{name:'SNCF'})).toBeInTheDocument();
    expect(screen.queryByRole('link',{name:/Plan B1|Plan B2/})).not.toBeInTheDocument();
  });
  it('supports railway company dossiers for both plans', () => {
    render(<MemoryRouter initialEntries={['/dashboard/ferroviaire?plan=B']}><Routes><Route path="/dashboard/:sectorId" element={<DashboardPage/>}/></Routes></MemoryRouter>);
    for(const name of ['Alstom','SNCF','RATP','Siemens Mobility','Hitachi Rail']) expect(screen.getByRole('heading',{name})).toBeInTheDocument();
    expect(screen.getAllByText('Site carrières')).toHaveLength(5);
    expect(screen.getAllByText('Candidature Plan A')).toHaveLength(5);
    expect(screen.getAllByText('Candidature Plan B')).toHaveLength(5);
  });
});