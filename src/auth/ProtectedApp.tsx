import { AppRoutes } from '../app/routes';
import { LoginPage } from '../features/auth/LoginPage';
import { useAuth } from './useAuth';

function AuthLoadingScreen() {
  return (
    <main className="auth-page" aria-busy="true">
      <section className="auth-card">
        <h1 className="auth-brand-wordmark" aria-label="MonStage">
          MonSt<span className="brand__at" aria-hidden="true">@</span>ge
        </h1>
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
