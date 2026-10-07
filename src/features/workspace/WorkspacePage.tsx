import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';
import { getCvMatch, getFollowUpAdvice } from './intelligence';
import { ApplyCenter } from '../offers/ApplyCenter';
import {
  getWorkspaceState,
  loadWorkspace,
  packageProgress,
  updateWorkspaceState,
  type ApplicationWorkspaceState,
  type WorkspaceStore,
} from './workspaceStorage';

function PackageCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="workspace-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function WorkspaceCard({
  offer,
  state,
  selected,
  onUpdate,
}: {
  offer: InternshipOffer;
  state: ApplicationWorkspaceState;
  selected: boolean;
  onUpdate: (patch: Partial<ApplicationWorkspaceState>) => void;
}) {
  const match = getCvMatch(offer);
  const progress = packageProgress(state);
  const followUp = getFollowUpAdvice(offer, state.followUpDate);
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <>
    <article className={`workspace-card card${selected ? ' workspace-card--selected' : ''}`}>
      <header className="workspace-card__header">
        <div>
          <p>{offer.company}</p>
          <h2>{offer.title}</h2>
          <span>{[offer.city, offer.specialization].filter(Boolean).map((value) => displayValue(String(value))).join(' · ')}</span>
        </div>
        <div className="workspace-score">
          <strong>{match.score}</strong>
          <span>CV match</span>
        </div>
      </header>

      <div className="workspace-summary">
        <Badge tone={offer.priority === 'A+' ? 'success' : 'accent'}>{offer.priority || '—'}</Badge>
        <Badge>{progress}% package</Badge>
        {offer.applicationStatus ? <Badge>{displayValue(offer.applicationStatus)}</Badge> : null}
        {offer.autonomy?.source ? <Badge tone="success">Auto · {offer.autonomy.source}</Badge> : null}
      </div>

      {offer.autonomy ? <section className="workspace-section autonomy-evidence">
        <div className="workspace-section__heading"><h3>Autonomy evidence</h3><span>{offer.autonomy.confidence !== null ? Math.round(offer.autonomy.confidence * 100) + '% confidence' : 'confidence n/a'}</span></div>
        <p><strong>{offer.autonomy.type}</strong> detected from {offer.autonomy.source}.</p>
        {offer.autonomy.evidence ? <p>{offer.autonomy.evidence}</p> : null}
        {offer.autonomy.detectedAt ? <small>{new Date(offer.autonomy.detectedAt).toLocaleString()}</small> : null}
      </section> : null}

      <section className="workspace-section">
        <div className="workspace-section__heading">
          <h3>Application package</h3>
          <span>{progress}% ready</span>
        </div>
        <div className="workspace-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="workspace-checks">
          <PackageCheck label="Tailored CV" checked={state.cvReady} onChange={(cvReady) => onUpdate({ cvReady })} />
          <PackageCheck label="Cover letter / message" checked={state.coverLetterReady} onChange={(coverLetterReady) => onUpdate({ coverLetterReady })} />
          <PackageCheck label="Interview prep" checked={state.interviewPrepReady} onChange={(interviewPrepReady) => onUpdate({ interviewPrepReady })} />
          <PackageCheck label="Local package complete" checked={state.submitted} onChange={(submitted) => onUpdate({ submitted })} />
        </div>
        <p className="workspace-note">External application status is evidence-driven. Opening the employer page never marks an application as submitted.</p>
      </section>

      <section className="workspace-section workspace-grid">
        <div>
          <h3>CV intelligence</h3>
          {match.matched.length ? <p className="workspace-positive">Matched: {match.matched.slice(0, 6).join(', ')}</p> : <p>No explicit skills were provided by the source.</p>}
          {match.missing.length ? <p className="workspace-warning">Strengthen or prepare: {match.missing.slice(0, 5).join(', ')}</p> : null}
          {offer.gaps ? <p className="workspace-note">To confirm: {offer.gaps}</p> : null}
        </div>
        <div>
          <h3>Company / role intelligence</h3>
          <p><strong>Source:</strong> {displayValue(offer.sourceQuality) ?? 'Needs verification'}</p>
          <p><strong>Verified:</strong> {offer.verifiedAt ?? '—'}</p>
          <p><strong>Compensation:</strong> {offer.compensation ?? 'Not specified'}</p>
          {offer.relevance ? <p>{offer.relevance}</p> : null}
        </div>
      </section>

      <section className="workspace-section workspace-grid">
        <label className="workspace-field">
          <span>Manual fallback follow-up date</span>
          <input type="date" value={state.followUpDate} onChange={(event) => onUpdate({ followUpDate: event.target.value })} />
          <small>{followUp}</small>
        </label>
        <label className="workspace-field">
          <span>Private notes</span>
          <textarea rows={3} value={state.notes} onChange={(event) => onUpdate({ notes: event.target.value })} placeholder="Recruiter, interview focus, decision notes…" />
        </label>
      </section>

      <footer className="workspace-actions">
        {offer.applicationUrl ? <button className="button button--primary" type="button" onClick={() => setApplyOpen(true)}>Apply in MonStage</button> : null}
        <span>Status changes only after a successful submission or verified evidence.</span>
      </footer>
    </article>
      {applyOpen ? <ApplyCenter offer={offer} onClose={() => setApplyOpen(false)} /> : null}
    </>
  );
}

export function WorkspacePage() {
  const { data, loading, error, retry } = useOffers();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('offer');
  const [store, setStore] = useState<WorkspaceStore>(() => loadWorkspace());

  const offers = useMemo(() => {
    const all = data?.offers ?? [];
    return all
      .filter((offer) => offer.shortlist || (offer.applicationStatus && offer.applicationStatus !== 'À candidater') || ['A+', 'A'].includes(offer.priority))
      .sort((a, b) => {
        if (a.id === selectedId) return -1;
        if (b.id === selectedId) return 1;
        return (b.decisionScore ?? 0) - (a.decisionScore ?? 0);
      });
  }, [data, selectedId]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page workspace-page">
      <div className="page-header"><div><h1>Workspace</h1></div></div>

      {offers.length === 0 ? <EmptyState title="No priority applications yet." /> : (
        <div className="workspace-list">
          {offers.map((offer) => (
            <WorkspaceCard
              key={offer.id || `${offer.company}-${offer.title}`}
              offer={offer}
              state={{ ...getWorkspaceState(offer.id), ...(store[offer.id] ?? {}) }}
              selected={offer.id === selectedId}
              onUpdate={(patch) => setStore((current) => updateWorkspaceState(current, offer.id, patch))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
