import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { useAuth } from '../../auth/useAuth';
import { saveApplicationStatus } from '../../api/applications';
import { ExternalApplicationForm } from '../applications/ExternalApplicationForm';
import { sectors, targetOffers, matchesCompany, statuses, editableStatuses, dateKey, wasSent, followUpDue } from '../targets/targets';
import '../targets/targets.css';
import { readProspectionOffers, combineDossiers, PROSPECTION_EVENT } from '../targets/prospectionAdapter';

export function DashboardPage() {
  const { sectorId } = useParams();
  const { data, loading, error, retry } = useOffers();
  const { token } = useAuth();
  const [now, setNow] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [localOffers, setLocalOffers] = useState(readProspectionOffers);
  useEffect(() => {
    const read = () => setLocalOffers(readProspectionOffers());
    window.addEventListener('storage', read); window.addEventListener('focus', read); window.addEventListener(PROSPECTION_EVENT, read);
    return () => { window.removeEventListener('storage', read); window.removeEventListener('focus', read); window.removeEventListener(PROSPECTION_EVENT, read); };
  }, []);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    const refresh = () => { setNow(new Date()); retry(); };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [retry]);
  const sector = sectors.find(item => item.id === sectorId);
  const dossiers = combineDossiers(data?.offers || [], localOffers);
  const dossierLink = (id: string) => id.startsWith('prospection:') ? '/prospection?lead=' + encodeURIComponent(id.slice(12)) : '/workspace?offer=' + encodeURIComponent(id);
  const groups = sectors.map(item => ({ ...item, offers: targetOffers(dossiers, item) }));
  const all = groups.flatMap(item => item.offers);
  const offers = sector ? targetOffers(dossiers, sector) : all;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const sent = offers.filter(wasSent).length;
  const interviews = offers.filter(o => ['Entretien', 'Test technique', 'Offre reçue'].includes(o.applicationStatus || '')).length;
  const due = offers.filter(o => followUpDue(o, today));
  const visible = offers.filter(o => (!status || o.applicationStatus === status) && `${o.company} ${o.title}`.toLowerCase().includes(query.toLowerCase()));
  async function update(id: string, value: string) {
    setBusy(id); setNotice('');
    try { await saveApplicationStatus(token, id, value); retry(); }
    catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Enregistrement impossible.'); }
    finally { setBusy(null); }
  }
  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;
  return <section className="page target-page">
    <header className="target-header"><h1 className={sector ? undefined : 'sr-only'}>{sector?.name || 'Mes candidatures ciblées'}</h1><button className="button button--primary" onClick={() => setShowForm(true)}>Enregistrer un envoi</button></header>
    <nav className="target-tabs" aria-label="Secteurs ciblés"><Link aria-current={!sector ? 'page' : undefined} to="/dashboard">Vue d’ensemble</Link>{sectors.map(s => <Link key={s.id} aria-current={sector?.id === s.id ? 'page' : undefined} to={'/dashboard/' + s.id}>{s.name}</Link>)}</nav>
    {error && <p role="alert">Actualisation indisponible. Les dernières données restent affichées. <button onClick={retry}>Réessayer</button></p>}
    <div className="kpi-grid">{[['Dossiers CV / images', offers.length], ['Candidatures envoyées', sent], ['Entretiens et suites', interviews], ['Relances à faire', due.length]].map(([label, value]) => <article className="kpi-card card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
    {!sector && <div className="target-sectors">{groups.map(s => <Link className="card target-sector" to={'/dashboard/' + s.id} key={s.id}><span>5 entreprises</span><h2>{s.name} ↗</h2><strong>{s.offers.filter(wasSent).length} envois <small>/ {s.offers.length} dossiers</small></strong><progress aria-label={'Entreprises avec envoi — ' + s.name} max={5} value={s.companies.filter(c => s.offers.some(o => matchesCompany(o, c[2]) && wasSent(o))).length}/><p>{s.companies.map(c => c[0]).join(' · ')}</p></Link>)}</div>}
    {sector && <div className="target-companies">{sector.companies.map(c => <article className="card" key={c[0]}><h2>{c[0]}</h2><p>{offers.filter(o => matchesCompany(o, c[2])).length} dossier(s)</p><p><Link to={'/prospection?company=' + encodeURIComponent(c[0])}>Préparer une spontanée →</Link></p><a href={'https://' + c[1]} target="_blank" rel="noreferrer">Site carrières ↗</a></article>)}</div>}
    <div className="target-visual card"><h2>Avancement des candidatures</h2>{['À candidater', 'Candidature envoyée', 'Entretien', 'Offre reçue', 'Refus'].map(label => { const count = offers.filter(o => (o.applicationStatus || 'À candidater') === label).length; return <div key={label}><span>{label}</span><progress max={Math.max(offers.length, 1)} value={count} aria-label={label}/><strong>{count}</strong></div>; })}</div>
    {due.length > 0 && <aside className="card target-alert"><h2>Relances à faire</h2>{due.map(o => <p key={o.id}><Link to={dossierLink(o.id)}>{o.company} — {o.title}</Link> · {dateKey(o.followUpAt)}</p>)}</aside>}
    <div className="target-header"><h2>Suivi des dossiers</h2><div className="target-filters"><input aria-label="Rechercher un dossier" placeholder="Entreprise ou mission…" value={query} onChange={e => setQuery(e.target.value)}/><select aria-label="Filtrer les dossiers" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tous les statuts</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div></div>
    {notice && <p role="alert">{notice}</p>}
    <div className="target-table"><table><thead><tr><th>Entreprise / mission</th><th>Statut</th><th>Envoi</th><th>Relance</th><th>Dossier</th></tr></thead><tbody>{visible.map(o => <tr key={o.id}><td><strong>{o.company}</strong><br/>{o.title}{o.id.startsWith('prospection:') && <small> · Spontanée</small>}</td><td><select aria-label={'Statut — ' + o.company + ' — ' + o.title} disabled={busy === o.id || o.id.startsWith('prospection:')} value={o.applicationStatus || 'À candidater'} onChange={e => void update(o.id, e.target.value)}>{!editableStatuses.includes(o.applicationStatus || 'À candidater') && <option value={o.applicationStatus || 'À candidater'}>{o.applicationStatus || 'À candidater'}</option>}{editableStatuses.map(s => <option key={s}>{s}</option>)}</select></td><td>{dateKey(o.appliedAt) || '—'}</td><td>{dateKey(o.followUpAt) || '—'}</td><td><Link to={dossierLink(o.id)}>Ouvrir →</Link></td></tr>)}</tbody></table>{!visible.length && <p className="target-empty">Aucun dossier correspondant.</p>}</div>
    {showForm && <ExternalApplicationForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); retry(); }}/ >}
  </section>;
}
