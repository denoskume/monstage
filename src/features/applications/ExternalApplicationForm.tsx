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
    <div className="filters-overlay filters-overlay--active" role="dialog" aria-modal="true" aria-label="Add external application" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="filters-sheet filters-sheet--desktop" onSubmit={submit}>
        <div className="page-header">
          <div><h2>Add external application</h2><p>Track an application submitted outside MonStage.</p></div>
          <button type="button" className="application-row__link" onClick={onClose}>Close</button>
        </div>

        <div className="filter-grid">
          <label><span>Company *</span><input name="company" required autoFocus /></label>
          <label><span>Job title *</span><input name="title" required /></label>
          <label><span>City</span><input name="city" /></label>
          <label><span>Application date *</span><input name="appliedAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label><span>Status</span><select name="applicationStatus" defaultValue="Candidature envoyée"><option>Candidature envoyée</option><option>Réponse recruteur</option><option>Relance</option><option>Entretien</option><option>Test technique</option><option>Offre reçue</option><option>Refus</option><option>Abandonné</option></select></label>
          <label><span>Domain</span><input name="domain" placeholder="Machine Learning, Computer Vision..." /></label>
          <label><span>Specialization</span><input name="specialization" placeholder="ML, CV, Image Processing..." /></label>
          <label><span>Job link</span><input name="applicationUrl" type="url" placeholder="https://..." /></label>
        </div>

        <label><span>Next action</span><input name="nextAction" placeholder="Prepare follow-up, interview, technical test..." /></label>
        {formError ? <div className="stale-banner" role="alert">{formError}</div> : null}

        <div className="application-row__actions">
          <button type="button" className="application-row__link" onClick={onClose}>Cancel</button>
          <button type="submit" className="jobs-filter-button" disabled={submitting}>{submitting ? 'Adding…' : 'Add application'}</button>
        </div>
      </form>
    </div>
  );
}

