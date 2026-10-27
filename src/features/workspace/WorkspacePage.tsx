import { useEffect, useState } from 'react';
import { listApplicationDocuments, saveApplicationDocument, type ApplicationDocument, type ApplicationDocumentKind } from './documentVault';
import { useAuth } from '../../auth/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';
import { getFollowUpAdvice } from './intelligence';
import {
  getWorkspaceState,
  loadWorkspace,
  updateWorkspaceState,
  type ApplicationWorkspaceState,
  type WorkspaceStore,
} from './workspaceStorage';

function ApplicationDocuments({ offerId, company }: { offerId: string; company: string }) {
  const { token } = useAuth();
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    void listApplicationDocuments(offerId, token).then(result => { if (live) { setDocuments(result.documents); setFolderUrl(result.folderUrl); } }).catch(() => { if (live) setError('Impossible de lire les documents enregistrés.'); });
    return () => { live = false; };
  }, [offerId, token]);

  async function attach(file: File | undefined, kind: ApplicationDocumentKind) {
    if (!file) return;
    setBusy(true);
    try {
      await saveApplicationDocument(offerId, kind, file, token, company);
      { const result = await listApplicationDocuments(offerId, token); setDocuments(result.documents); setFolderUrl(result.folderUrl); }
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.'); }
    finally { setBusy(false); }
  }
  function openPdf(document: ApplicationDocument) {
    window.open(document.url, '_blank', 'noopener,noreferrer');
  }
  return <section className="workspace-section">
    <div className="workspace-section__heading"><h3>Documents de candidature</h3><span>{documents.length} fichier{documents.length > 1 ? 's' : ''}</span></div>
    {folderUrl ? <a href={folderUrl} target="_blank" rel="noreferrer">Ouvrir le dossier GitHub privé ↗</a> : null}
    <p className="workspace-note">Conservez ici les PDF réellement envoyés. Chaque version reste associée à cette offre et peut être retrouvée lors d'une relance ou d'un entretien.</p>
    <div className="workspace-actions">
      {([['cv', '+ Joindre le CV envoyé'], ['letter', '+ Joindre la lettre envoyée'], ['other', '+ Autre document']] as const).map(([kind, label]) =>
        <label key={kind} className="button button--secondary" style={{ cursor: busy ? 'wait' : 'pointer' }}>
          {label}<input type="file" accept=".pdf,application/pdf" disabled={busy} style={{ display: 'none' }} onChange={event => { void attach(event.currentTarget.files?.[0], kind); event.currentTarget.value = ''; }} />
        </label>
      )}
    </div>
    {documents.length ? <div className="my-jobs-saved-list">{documents.map(doc =>
      <div key={doc.id} className="my-jobs-saved-row">
        <div className="my-jobs-saved-row__main">
          <strong>{doc.kind === 'cv' ? 'CV' : doc.kind === 'letter' ? 'Lettre de motivation' : 'Pièce jointe'}</strong>
          <p>{doc.name}</p>{doc.createdAt ? <small>Ajouté le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</small> : null}
        </div>
        <div className="my-jobs-saved-row__actions">
          <button className="button button--secondary" type="button" onClick={() => openPdf(doc)}>Ouvrir le PDF</button>

        </div>
      </div>
    )}</div> : <p className="workspace-note">Aucun document archivé pour cette candidature.</p>}
    {error ? <p role="alert" className="workspace-warning">{error}</p> : null}
    <small>Documents enregistrés dans le dépôt GitHub privé Stage_2027. Les versions générées sont des brouillons tant que vous ne confirmez pas l’envoi.</small>
  </section>;
}

function WorkspaceCard({ offer, state, onUpdate }: {
  offer: InternshipOffer;
  state: ApplicationWorkspaceState;
  onUpdate: (patch: Partial<ApplicationWorkspaceState>) => void;
}) {
  const progress = Math.round(([state.cvReady, state.coverLetterReady].filter(Boolean).length / 2) * 100);
  const followUp = getFollowUpAdvice(offer, state.followUpDate);
  return (
    <article className="workspace-card card" style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>
      <header className="workspace-card__header">
        <div>
          <p style={{ fontWeight: 700 }}>{offer.company}</p>
          <h2>{offer.title}</h2>
          <span>{[offer.city, offer.specialization].filter(Boolean).map(value => displayValue(String(value))).join(' · ')}</span>
        </div>
        <Badge>{offer.applicationStatus ? displayValue(offer.applicationStatus) : 'En préparation'}</Badge>
      </header>

      <section className="workspace-section">
        <div className="workspace-section__heading"><h3>1. Préparer les documents</h3><span>{progress}% prêts</span></div>
        <p className="workspace-note">Les documents sont propres à cette offre. Tu peux les adapter, les relire et les enregistrer avant de postuler.</p>
        <div className="workspace-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="workspace-actions" style={{ marginTop: 14, flexWrap: 'wrap' }}>
          <Link className="button button--primary" to={`/cv?offer=${encodeURIComponent(offer.id)}`}>Préparer le CV</Link>
          <Link className="button button--secondary" to={`/cl?offer=${encodeURIComponent(offer.id)}`}>Préparer la lettre</Link>
          <Link className="button button--secondary" to={`/studio?offer=${encodeURIComponent(offer.id)}`}>Voir le dossier de préparation</Link>
        </div>
        <div className="workspace-checks" style={{ marginTop: 16 }}>
          <label className="workspace-check"><input type="checkbox" checked={state.cvReady} onChange={event => onUpdate({ cvReady: event.target.checked })}/><span>CV vérifié</span></label>
          <label className="workspace-check"><input type="checkbox" checked={state.coverLetterReady} onChange={event => onUpdate({ coverLetterReady: event.target.checked })}/><span>Lettre vérifiée</span></label>
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-section__heading"><h3>2. Enregistrer les PDF</h3></div>
        <ApplicationDocuments offerId={offer.id} company={offer.company}/>
      </section>

      <section className="workspace-section">
        <div className="workspace-section__heading"><h3>3. Postuler et suivre</h3></div>
        <p className="workspace-note">Le clic sur le site de l'employeur n'enregistre pas une candidature envoyée. Confirme l'envoi uniquement après avoir réellement postulé.</p>
        <div className="workspace-actions" style={{ flexWrap: 'wrap' }}>
          {offer.applicationUrl ? <a className="button button--primary" href={offer.applicationUrl} target="_blank" rel="noreferrer">Ouvrir l'offre et postuler ↗</a> : null}
          <Link className="button button--secondary" to={`/studio?offer=${encodeURIComponent(offer.id)}`}>Confirmer l'envoi dans Studio</Link>
        </div>
        <div className="workspace-grid" style={{ marginTop: 18 }}>
          <label className="workspace-field"><span>Date de relance</span><input type="date" value={state.followUpDate} onChange={event => onUpdate({ followUpDate: event.target.value })}/><small>{followUp}</small></label>
          <label className="workspace-field"><span>Notes privées</span><textarea rows={3} value={state.notes} onChange={event => onUpdate({ notes: event.target.value })} placeholder="Réponse du recruteur, entretien, prochaines actions…"/></label>
        </div>
      </section>
    </article>
  );
}

export function WorkspacePage() {
  const { data, loading, error, retry } = useOffers();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('offer');
  const [store, setStore] = useState<WorkspaceStore>(() => loadWorkspace());

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  const offer = selectedId ? data?.offers.find(item => item.id === selectedId) : undefined;
  return (
    <section className="page workspace-page">
      <div className="page-header" style={{ maxWidth: 1080, margin: '0 auto 20px' }}>
        <div><h1>Dossier de candidature</h1><p>Une seule offre, un seul dossier : prépare, enregistre et suis ta candidature.</p></div>
        <Link className="button button--secondary" to="/offers">← Retour aux offres</Link>
      </div>
      {!selectedId ? (
        <div style={{ maxWidth: 1080, margin: '0 auto' }}><EmptyState title="Sélectionne une offre puis clique sur Préparer la candidature."/><Link className="button button--primary" to="/offers">Voir les offres</Link></div>
      ) : !offer ? (
        <div style={{ maxWidth: 1080, margin: '0 auto' }}><EmptyState title="Cette offre n'est pas disponible actuellement."/><Link className="button button--secondary" to="/offers">Retour aux offres</Link></div>
      ) : (
        <WorkspaceCard key={offer.id} offer={offer} state={{ ...getWorkspaceState(offer.id), ...(store[offer.id] ?? {}) }} onUpdate={patch => setStore(current => updateWorkspaceState(current, offer.id, patch))}/>
      )}
    </section>
  );
}
