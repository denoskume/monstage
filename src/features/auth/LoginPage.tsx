import { useEffect, useRef, useState } from 'react';
import { renderGoogleSignInButton } from '../../auth/googleIdentity';
import { useAuth } from '../../auth/useAuth';

export function LoginPage({ denied }: { denied: boolean }) {
  const { signInWithCredential, status } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const target = buttonRef.current;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!target) return;
    if (!clientId) {
      setError('Google Sign-In is temporarily unavailable.');
      return;
    }

    target.replaceChildren();
    setError(null);
    void renderGoogleSignInButton(target, clientId, (credential) => {
      void signInWithCredential(credential);
    }).catch(() => {
      setError('Google Sign-In is temporarily unavailable.');
    });
  }, [signInWithCredential]);

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title" className="auth-brand-wordmark" aria-label="MonStage">
          MonSt<span className="brand__at" aria-hidden="true">@</span>ge
        </h1>
        <p className="eyebrow">Private workspace</p>
        <p className="auth-subtitle">Private internship intelligence workspace</p>

        {denied ? (
          <div className="auth-message auth-message--denied" role="alert">
            Access denied — This MonSt@ge workspace is private.
          </div>
        ) : null}

        {error ? <div className="auth-message" role="alert">{error}</div> : null}

        <div className="auth-google-button" ref={buttonRef} aria-busy={status === 'checking'} />
        {status === 'checking' ? <p className="auth-status">Verifying your Google account…</p> : null}
        <p className="auth-footnote">Access is restricted to the authorized MonSt@ge owner account.</p>
      </section>
    </main>
  );
}
