import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Badge } from '../../components/Badge';
import { useOffers } from '../../hooks/useOffers';
import { useAuth } from '../../auth/useAuth';
import { addExternalApplication } from '../../api/applications';
import { displayValue } from '../../i18n/display';
import type { InternshipOffer } from '../../api/contract';
import { getFollowUpAdvice } from '../workspace/intelligence';
import { getWorkspaceState } from '../workspace/workspaceStorage';

const statusOrder = ['Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus', 'Abandonné'];

function ApplicationRow({ offer }: { offer: InternshipOffer }) {
  const local = getWorkspaceState(offer.id);
  const followUp = getFollowUpAdvice(offer, local.followUpDate);

  return (
    <article className="application-row card">
      <div className="application-row__main"><p>{offer.company}</p><h2>{offer.title}</h2><span>{offer.city ?? 'City not specified'}</span></div>
      <div className="application-row__badges">
        <Badge tone={offer.priority === 'A+' ? 'success' : 'accent'}>{offer.priority}</Badge>
        {offer.decisionScore !== null ? <Badge>Score {offer.decisionScore}</Badge> : null}
        {offer.autonomy?.source ? <Badge tone="success">Auto · {offer.autonomy.source}</Badge> : null}
      </div>
      <dl className="application-row__meta">
        <div><dt>Applied</dt><dd>{offer.appliedAt ?? 'Not provided'}</dd></div>
        <div><dt>Follow-up</dt><dd>{local.followUpDate || offer.followUpAt || '—'}</dd></div>
        <div><dt>Next action</dt><dd>{displayValue(offer.nextAction ?? offer.actionLevel) ?? '—'}</dd></div>
        <div><dt>Assistant</dt><dd>{followUp}</dd></div>
      </dl>
      {offer.autonomy ? <div className="application-evidence">
        <strong>Auto-detected</strong>
        <span>{offer.autonomy.type} · {offer.autonomy.confidence !== null ? Math.round(offer.autonomy.confidence * 100) + '% confidence' : 'confidence n/a'}</span>
      </div> : null}
      <div className="application-row__actions">
        <Link className="application-row__link" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Workspace →</Link>
        {offer.applicationUrl ? <a className="application-row__link" href={offer.applicationUrl} target="_blank" rel="noreferrer">View job ↗</a> : null}
      </div>
    </article>
  );
}

function ExternalApplicationForm({
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

export function ApplicationsPage() {
  const { data, loading, error, retry } = useOffers();
  const [externalFormOpen, setExternalFormOpen] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(false);
  const grouped = useMemo(() => {
    const all = (data?.offers ?? []).filter((offer) => offer.applicationStatus && offer.applicationStatus !== 'À candidater');
    return statusOrder.map((status) => ({ status, offers: all.filter((offer) => offer.applicationStatus === status) })).filter((group) => group.offers.length > 0);
  }, [data]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;
  const total = grouped.reduce((sum, group) => sum + group.offers.length, 0);

  return (
    <section className="page applications-page">
      <div className="page-header"><div><h1>Applications</h1><p>Track every application, including those submitted outside MonStage.</p></div><button type="button" className="jobs-filter-button" onClick={() => setExternalFormOpen(true)}>+ Add external application</button></div>
      {createdNotice ? <div className="offer-action-notice" role="status"><span>External application added.</span><button type="button" onClick={() => setCreatedNotice(false)}>×</button></div> : null}
      {externalFormOpen ? <ExternalApplicationForm onClose={() => setExternalFormOpen(false)} onCreated={() => { setExternalFormOpen(false); setCreatedNotice(true); retry(); }} /> : null}
      {data?.autonomyLastSync ? <div className="autonomy-sync card"><span>Autonomy engine</span><strong>Last sync: {new Date(data.autonomyLastSync).toLocaleString()}</strong></div> : null}
      {total === 0 ? <EmptyState title="No active applications yet." /> : grouped.map((group) => (
        <section className="application-group" key={group.status}><div className="application-group__heading"><h2>{displayValue(group.status)}</h2><span>{group.offers.length}</span></div><div className="application-group__list">{group.offers.map((offer) => <ApplicationRow key={offer.id || `${offer.company}-${offer.title}`} offer={offer} />)}</div></section>
      ))}
    </section>
  );
}
