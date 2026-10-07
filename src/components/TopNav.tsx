import { NavLink } from 'react-router-dom';
import { AccountMenu } from '../features/auth/AccountMenu';

const links = [
  ['/offers', 'Jobs'],
  ['/applications', 'Applications'],
  ['/workspace', 'Workspace'],
  ['/studio', 'Studio'],
  ['/dashboard', 'Insights'],
] as const;

function BookmarkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.55L6 21V4.75Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M7.5 9h9M7.5 12.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

function BellIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 21h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/offers" className="brand" aria-label="MonStage — Jobs home">
          <span className="brand__name" aria-hidden="true">MonStage</span>
        </NavLink>

        <nav className="top-nav__links" aria-label="Primary navigation">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className="nav-link" aria-label={to === '/dashboard' ? 'Dashboard' : label}>{label}</NavLink>
          ))}
        </nav>

        <span className="top-nav__spacer" aria-hidden="true" />

        <nav className="top-nav__icon-links" aria-label="Quick actions">
          <NavLink to="/shortlist" className="top-nav__icon-link" aria-label="Saved jobs" title="Saved jobs">
            <BookmarkIcon />
          </NavLink>
          <NavLink to="/messages" className="top-nav__icon-link" aria-label="Recruiter activity" title="Recruiter activity">
            <MessageIcon />
          </NavLink>
          <NavLink to="/notifications" className="top-nav__icon-link" aria-label="Notifications" title="Notifications">
            <BellIcon />
          </NavLink>
        </nav>

        <AccountMenu />
      </div>
    </header>
  );
}
