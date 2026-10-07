import { useAuth } from '../../auth/useAuth';

export function AccountMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="account-menu" aria-label="Signed-in account">
      <button className="account-menu__signout" type="button" onClick={signOut}>Sign out</button>
    </div>
  );
}
