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

  return (
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
      </div>

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
          <PackageCheck label="Application submitted" checked={state.submitted} onChange={(submitted) => onUpdate({ submitted })} />
        </div>
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
          <span>Follow-up date</span>
          <input type="date" value={state.followUpDate} onChange={(event) => onUpdate({ followUpDate: event.target.value })} />
          <small>{followUp}</small>
        </label>
        <label className="workspace-field">
          <span>Private notes</span>
          <textarea rows={3} value={state.notes} onChange={(event) => onUpdate({ notes: event.target.value })} placeholder="Recruiter, interview focus, decision notes…" />
        </label>
      </section>

      <footer className="workspace-actions">
        {offer.applicationUrl ? <a className="button button--primary" href={offer.applicationUrl} target="_blank" rel="noreferrer">Apply ↗</a> : null}
        <span>Saved only in this browser.</span>
      </footer>
    </article>
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
      <div className="page-header">
        <div>
          <p className="eyebrow">Application operating system</p>
          <h1>Workspace</h1>
          <p>Evaluate, prepare, apply, follow up and defend each high-value internship from one place.</p>
        </div>
      </div>

      <div className="workspace-principles card">
        <strong>Flow</strong>
        <span>Discover → Evaluate → Prioritize → Prepare → Apply → Follow up → Interview → Learn</span>
      </div>

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
