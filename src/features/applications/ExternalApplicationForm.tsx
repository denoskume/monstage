import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/useAuth';
import { addExternalApplication } from '../../api/applications';

export function ExternalApplicationForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setFormError(null);

    try {
      await addExternalApplication(token, {
        company: String(form.get('company') || '').trim(),
        title: String(form.get('title') || '').trim(),
        city: String(form.get('city') || '').trim(),
        applicationUrl: String(form.get('applicationUrl') || '').trim(),
        appliedAt: String(form.get('appliedAt') || '').trim(),
        applicationStatus: String(form.get('applicationStatus') || 'Candidature envoyée'),
        nextAction: String(form.get('nextAction') || '').trim(),
        domain: String(form.get('domain') || '').trim(),
        specialization: String(form.get('specialization') || '').trim(),
      });
      onCreated();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to add this application.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="external-app-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Add external application"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <form className="external-app-modal" onSubmit={submit}>
        <header className="external-app-modal__header">
          <div>
            <span className="external-app-modal__eyebrow">Application tracking</span>
            <h2>Add external application</h2>
            <p>Track an application submitted outside MonStage.</p>
          </div>
          <button type="button" className="external-app-modal__close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="external-app-modal__body">
          <div className="external-app-grid">
            <label className="external-app-field">
              <span>Company <b>*</b></span>
              <input name="company" required autoFocus placeholder="e.g. Alstom" />
            </label>

            <label className="external-app-field">
              <span>Job title <b>*</b></span>
              <input name="title" required placeholder="e.g. Computer Vision Intern" />
            </label>

            <label className="external-app-field">
              <span>City</span>
              <input name="city" placeholder="e.g. Nantes" />
            </label>

            <label className="external-app-field">
              <span>Application date <b>*</b></span>
              <input name="appliedAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>

            <label className="external-app-field">
              <span>Status</span>
              <select name="applicationStatus" defaultValue="Candidature envoyée">
                <option>Candidature envoyée</option>
                <option>Réponse recruteur</option>
                <option>Relance</option>
                <option>Entretien</option>
                <option>Test technique</option>
                <option>Offre reçue</option>
                <option>Refus</option>
                <option>Abandonné</option>
              </select>
            </label>

            <label className="external-app-field">
              <span>Domain</span>
              <input name="domain" placeholder="Machine Learning, Computer Vision..." />
            </label>

            <label className="external-app-field">
              <span>Specialization</span>
              <input name="specialization" placeholder="ML, CV, Image Processing..." />
            </label>

            <label className="external-app-field">
              <span>Job link</span>
              <input name="applicationUrl" type="url" placeholder="https://..." />
            </label>

            <label className="external-app-field external-app-field--wide">
              <span>Next action</span>
              <input name="nextAction" placeholder="Prepare follow-up, interview, technical test..." />
            </label>
          </div>

          {formError ? <div className="external-app-modal__error" role="alert">{formError}</div> : null}
        </div>

        <footer className="external-app-modal__footer">
          <button type="button" className="button button--secondary external-app-modal__button" onClick={onClose}>Cancel</button>
          <button type="submit" className="button button--primary external-app-modal__button" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add application'}
          </button>
        </footer>
      </form>
    </div>
  );
}

