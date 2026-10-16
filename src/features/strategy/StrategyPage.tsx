import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './strategy.css';

type SkillId = 'offers' | 'spontaneous' | 'outreach' | 'profile' | 'interviews';
type Status = 'planned' | 'in_progress' | 'completed';
type Action = { id: string; skill: SkillId; target: string; nextStep: string; due: string; status: Status; createdAt: string };
const STORAGE_KEY = 'monstage.strategy.actions.v1';

const skills: Array<{ id: SkillId; number: string; title: string; subtitle: string; outcome: string; steps: string[]; primary: string; href: string }> = [
  { id: 'offers', number: '01', title: 'Candidatures aux offres', subtitle: 'Répondre avec précision aux opportunités pertinentes.', outcome: 'Une candidature ciblée et suivie', steps: ['Vérifier la pertinence et les critères de l’offre', 'Adapter le CV et la lettre à la mission', 'Envoyer puis planifier une relance'], primary: 'Explorer les offres', href: '/offers' },
  { id: 'spontaneous', number: '02', title: 'Candidatures spontanées', subtitle: 'Créer des opportunités avant leur publication.', outcome: 'Une approche entreprise argumentée', steps: ['Identifier un besoin ou une équipe cible', 'Relier deux compétences à un projet concret', 'Préparer une prise de contact et suivre la réponse'], primary: 'Préparer les documents', href: '/studio' },
  { id: 'outreach', number: '03', title: 'Approche directe des managers', subtitle: 'Entrer en contact avec un interlocuteur pertinent.', outcome: 'Un message professionnel personnalisé', steps: ['Identifier le manager et vérifier son rôle', 'Faire référence à un travail ou un besoin réel', 'Formuler une question claire et respecter le rythme des relances'], primary: 'Accéder aux messages', href: '/messages' },
  { id: 'profile', number: '04', title: 'Optimisation du profil', subtitle: 'Rendre les preuves de compétences visibles et cohérentes.', outcome: 'Un CV et un portfolio crédibles', steps: ['Vérifier CV, LinkedIn et GitHub', 'Mettre en avant des résultats mesurables et justifiés', 'Adapter les mots-clés sans exagérer l’expérience'], primary: 'Ouvrir Studio', href: '/studio' },
  { id: 'interviews', number: '05', title: 'Préparation aux entretiens', subtitle: 'Transformer chaque candidature en conversation solide.', outcome: 'Des réponses appuyées sur des exemples réels', steps: ['Analyser l’offre et l’équipe', 'Préparer un projet technique, ses résultats et ses limites', 'S’entraîner aux questions et préparer celles à poser'], primary: 'Voir les candidatures', href: '/applications' },
];

function readActions(): Action[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((a): a is Action => typeof a === 'object' && a !== null && typeof a.id === 'string' && skills.some((s) => s.id === a.skill) && typeof a.target === 'string' && typeof a.nextStep === 'string' && typeof a.due === 'string' && ['planned', 'in_progress', 'completed'].includes(a.status) && typeof a.createdAt === 'string');
  } catch { return []; }
}

const statusLabels: Record<Status, string> = { planned: 'À faire', in_progress: 'En cours', completed: 'Terminé' };

export function StrategyPage() {
  const [selected, setSelected] = useState<SkillId>('offers');
  const [actions, setActions] = useState<Action[]>(readActions);
  const [target, setTarget] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [due, setDue] = useState('');
  const skill = skills.find((item) => item.id === selected)!;
  const skillActions = useMemo(() => actions.filter((a) => a.skill === selected).sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || a.due.localeCompare(b.due)), [actions, selected]);
  const completed = actions.filter((a) => a.status === 'completed').length;
  const pending = actions.filter((a) => a.status !== 'completed').length;

  function persist(value: Action[]) { setActions(value); localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
  function createAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = target.trim();
    const step = nextStep.trim();
    if (!label || !step) return;
    const action: Action = { id: crypto.randomUUID(), skill: selected, target: label, nextStep: step, due, status: 'planned', createdAt: new Date().toISOString() };
    persist([action, ...actions]);
    setTarget(''); setNextStep(''); setDue('');
  }
  function updateStatus(id: string, status: Status) { persist(actions.map((a) => a.id === id ? { ...a, status } : a)); }
  function removeAction(id: string) { persist(actions.filter((a) => a.id !== id)); }

  return (
    <section className="page strategy-page">
      <header className="strategy-heading">
        <div>
          <p className="strategy-eyebrow">MONSTAGE / CAREER STRATEGY</p>
          <h1>Une stratégie. Cinq leviers.</h1>
          <p>Passe de la recherche d’offres à une démarche proactive, mesurable et organisée. Chaque action reste sous ton contrôle.</p>
        </div>
        <div className="strategy-summary" aria-label="Progression">
          <div><strong>{pending}</strong><span>Actions ouvertes</span></div>
          <div><strong>{completed}</strong><span>Actions terminées</span></div>
        </div>
      </header>

      <div className="strategy-layout">
        <nav className="strategy-sidebar" aria-label="Compétences de candidature">
          {skills.map((item) => {
            const activeCount = actions.filter((a) => a.skill === item.id && a.status !== 'completed').length;
            return <button type="button" key={item.id} className={'strategy-tab' + (item.id === selected ? ' strategy-tab--active' : '')} onClick={() => { setSelected(item.id); setTarget(''); setNextStep(''); setDue(''); }} aria-current={item.id === selected ? 'page' : undefined}>
              <span className="strategy-tab__number">{item.number}</span><span className="strategy-tab__body"><strong>{item.title}</strong><small>{item.subtitle}</small></span>{activeCount > 0 && <span className="strategy-tab__count">{activeCount}</span>}
            </button>;
          })}
        </nav>

        <div className="strategy-workspace">
          <div className="strategy-skill-heading">
            <p className="strategy-eyebrow">SKILL {skill.number} / 05</p>
            <h2>{skill.title}</h2>
            <p>{skill.subtitle}</p>
            <Link className="strategy-primary-link" to={skill.href}>{skill.primary} <span aria-hidden="true">↗</span></Link>
          </div>

          <div className="strategy-section">
            <h3>Méthode de travail</h3>
            <p className="strategy-outcome">Objectif : {skill.outcome}</p>
            <ol className="strategy-method">{skill.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </div>

          <div className="strategy-section">
            <h3>Nouvelle action</h3>
            <form className="strategy-form" onSubmit={createAction}>
              <label>Cible — entreprise, équipe ou offre<input value={target} onChange={(e) => setTarget(e.target.value)} required maxLength={160} placeholder="Ex. Équipe computer vision — entreprise cible" /></label>
              <label>Prochaine étape<textarea value={nextStep} onChange={(e) => setNextStep(e.target.value)} required maxLength={500} rows={2} placeholder="Une action concrète et vérifiable…" /></label>
              <div className="strategy-form__footer"><label>Échéance (facultative)<input aria-label="Échéance" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label><button type="submit">Ajouter l’action</button></div>
            </form>
          </div>

          <div className="strategy-section">
            <div className="strategy-section__heading"><h3>Suivi des démarches</h3><span>{skillActions.length} action{skillActions.length > 1 ? 's' : ''}</span></div>
            {skillActions.length === 0 ? <p className="strategy-empty">Aucune action pour ce levier. Ajoute une prochaine étape pour commencer ton suivi.</p> : <div className="strategy-action-list">{skillActions.map((action) => <article className="strategy-action" key={action.id}>
              <div><strong>{action.target}</strong><p>{action.nextStep}</p>{action.due && <small>Échéance : {new Date(action.due + 'T12:00:00').toLocaleDateString('fr-FR')}</small>}</div>
              <div className="strategy-action__controls"><label className="sr-only" htmlFor={'status-' + action.id}>Statut</label><select id={'status-' + action.id} value={action.status} onChange={(e) => updateStatus(action.id, e.target.value as Status)}>{(Object.keys(statusLabels) as Status[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><button type="button" onClick={() => removeAction(action.id)} aria-label={'Supprimer : ' + action.target}>Supprimer</button></div>
            </article>)}</div>}
          </div>
        </div>
      </div>
      <p className="strategy-privacy">Les actions saisies ici sont conservées dans ce navigateur. Aucun message ni candidature n’est envoyé automatiquement.</p>
    </section>
  );
}
