import { NavLink } from 'react-router-dom';
import { AccountMenu } from '../features/auth/AccountMenu';

const links = [
  ['/offers', 'Jobs'],
  ['/shortlist', 'Saved'],
  ['/applications', 'Applications'],
  ['/workspace', 'Workspace'],
  ['/dashboard', 'Insights'],
] as const;

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/offers" className="brand" aria-label="MonStage — Jobs home">
          <span className="brand__mark" aria-hidden="true">M</span>
          <span className="brand__name">MonStage</span>
        </NavLink>
        <nav className="top-nav__links" aria-label="Primary navigation">
          {links.map(([to, label]) => <NavLink key={to} to={to} className="nav-link" aria-label={to === '/shortlist' ? 'Shortlist' : to === '/dashboard' ? 'Dashboard' : label}>{label}</NavLink>)}
        </nav>
        <span className="top-nav__meta">Internships · France · 2027</span>
        <AccountMenu />
      </div>
    </header>
  );
}
