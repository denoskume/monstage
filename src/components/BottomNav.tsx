import { NavLink } from 'react-router-dom';

const links = [
  ['/offers', '⌕', 'Jobs'],
  ['/shortlist', '★', 'Shortlist'],
  ['/applications', '✓', 'Applications'],
  ['/dashboard', '▥', 'Dashboard'],
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {links.map(([to, icon, label]) => (
        <NavLink key={to} to={to} className="nav-link" aria-label={label}>
          <span className="bottom-nav__icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
