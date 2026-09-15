import { NavLink } from 'react-router-dom';
import { AccountMenu } from '../features/auth/AccountMenu';

const links = [
  ['/offers', 'Jobs'],
  ['/shortlist', 'Shortlist'],
  ['/applications', 'Applications'],
  ['/dashboard', 'Dashboard'],
] as const;

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/offers" className="brand" aria-label="MonStage — Jobs home">
          <span className="brand__mark" aria-hidden="true">MS</span>
          <span>MonStage</span>
        </NavLink>
        <nav className="top-nav__links" aria-label="Primary navigation">
          {links.map(([to, label]) => <NavLink key={to} to={to} className="nav-link">{label}</NavLink>)}
        </nav>
        <span className="top-nav__meta">Internship Intelligence France · M2 2027</span>
        <AccountMenu />
      </div>
    </header>
  );
}
