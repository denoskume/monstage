import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { TopNav } from '../components/TopNav';
import { Footer } from '../components/Footer';

export function AppShell() {
  const { pathname } = useLocation();
  const dashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  return (
    <div className={dashboard ? 'app-shell app-shell--dashboard' : 'app-shell'}>
      {!dashboard && <TopNav />}
      <main className="app-main"><Outlet /></main>
      {!dashboard && <Footer />}
      {!dashboard && <BottomNav />}
    </div>
  );
}
