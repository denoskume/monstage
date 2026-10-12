import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { TopNav } from '../components/TopNav';
import { Footer } from '../components/Footer';

export function AppShell() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-main"><Outlet /></main>
      <Footer />
      <BottomNav />
    </div>
  );
}
