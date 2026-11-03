import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../dashboard/DashboardPage';
vi.mock('../../hooks/useOffers', () => ({ useOffers: () => ({ data: {offers: []}, loading: false, error: null, retry: vi.fn() }) }));
vi.mock('../../auth/useAuth', () => ({ useAuth: () => ({ token: 'test' }) }));
describe('target dashboard navigation', () => {
  it('shows four linked sectors and zero real applications for an empty workspace', () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<DashboardPage/>}/></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', {name: 'Vue d’ensemble'})).toBeInTheDocument();
    expect(screen.getAllByText('5 entreprises')).toHaveLength(4);
    expect(screen.getByText('Candidatures envoyées').nextElementSibling).toHaveTextContent('0');
  });
  it('shows the five healthcare companies on its sector route', () => {
    render(<MemoryRouter initialEntries={['/dashboard/sante']}><Routes><Route path="/dashboard/:sectorId" element={<DashboardPage/>}/></Routes></MemoryRouter>);
    for (const name of ['GE HealthCare','Siemens Healthineers','Philips','Canon Medical Systems','Dassault Systèmes']) expect(screen.getByRole('heading', {name})).toBeInTheDocument();
    expect(screen.getAllByText('Site carrières ↗')).toHaveLength(5);
  });
});
