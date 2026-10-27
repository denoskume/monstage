import { NavLink } from 'react-router-dom';

const links = [
  ['/offers', '⌕', 'Offres'],
  ['/shortlist', '☆', 'Sélection'],
  ['/studio', '▣', 'Préparer'],
  ['/prospection', '▦', 'Prospection'],
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {links.map(([to, icon, label]) => (
        <NavLink key={to} to={to} className="nav-link" aria-label={to === '/shortlist' ? 'Shortlist' : label}>
          <span className="bottom-nav__icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
