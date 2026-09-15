import { NavLink } from 'react-router-dom';

const links = [
  ['/offers', 'Offres'],
  ['/shortlist', 'Shortlist'],
  ['/applications', 'Candidatures'],
  ['/dashboard', 'Dashboard'],
] as const;

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/offers" className="brand" aria-label="MonStage — Accueil des offres">
          <span className="brand__mark" aria-hidden="true">MS</span>
          <span>MonStage</span>
        </NavLink>
        <nav className="top-nav__links" aria-label="Navigation principale">
          {links.map(([to, label]) => <NavLink key={to} to={to} className="nav-link">{label}</NavLink>)}
        </nav>
        <span className="top-nav__meta">Stage Intelligence France · M2 2027</span>
      </div>
    </header>
  );
}
