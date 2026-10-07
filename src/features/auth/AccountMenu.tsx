import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="account-menu" aria-label="Signed-in account">
      <button className="top-nav__icon-link account-menu__trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Account" title="Account">
        <UserIcon />
      </button>
      {open ? (
        <div className="account-menu__popover" role="menu">
          <div className="account-menu__identity">
            <strong>{user.name || 'Account'}</strong>
            {user.email ? <span>{user.email}</span> : null}
          </div>
          <button className="account-menu__signout" type="button" onClick={signOut}>Sign out</button>
        </div>
      ) : null}
    </div>
  );
}
