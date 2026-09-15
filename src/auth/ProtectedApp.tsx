import { AppRoutes } from '../app/routes';
import { LoginPage } from '../features/auth/LoginPage';
import { useAuth } from './useAuth';

function AuthLoadingScreen() {
  return (
    <main className="auth-page" aria-busy="true">
      <section className="auth-card">
        <div className="auth-brand" aria-hidden="true">MS</div>
        <h1>MonStage</h1>
        <p className="auth-subtitle">Verifying your session…</p>
      </section>
    </main>
  );
}

export function ProtectedApp() {
  const { status } = useAuth();

  if (status === 'checking') return <AuthLoadingScreen />;
  if (status === 'authenticated') return <AppRoutes />;
  return <LoginPage denied={status === 'denied'} />;
}
