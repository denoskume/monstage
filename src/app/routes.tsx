import { Navigate, Route, Routes } from 'react-router-dom';
import { OffersPage } from '../features/offers/OffersPage';
import { ShortlistPage } from '../features/shortlist/ShortlistPage';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AppShell } from './AppShell';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/offers" replace />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/shortlist" element={<ShortlistPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/offers" replace />} />
      </Route>
    </Routes>
  );
}
