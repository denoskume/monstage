import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';
import { getWorkspaceState, loadWorkspace, updateWorkspaceState } from '../workspace/workspaceStorage';
import {
  INSPemon_OFFER_ID, inspemonInterviewOffer, sessionsForOffer,
  loadInterviewPrep, saveInterviewPrep, practicedCount, interviewPrepComplete,
  type InterviewPrepState, type PrepOffer,
} from './interviewPrep';
import './interviewPrep.css';

export function InterviewPrepPage() {
  const [params] = useSearchParams();
  const offerId = params.get('offer') || '';
  const { data } = useOffers();
  const candidate = data?.offers.find(item => item.id === offerId);
  const offer: PrepOffer | undefined = candidate ?? (offerId === INSPemon_OFFER_ID ? inspemonInterviewOffer : undefined);
  const sessions = useMemo(() => offer ? sessionsForOffer(offer) : [], [offer]);
  const questions = useMemo(() => sessions.flatMap(session => session.questions), [sessions]);
  const [state, setState] = useState<InterviewPrepState>(() => loadInterviewPrep(offerId));
  const [currentSession, setCurrentSession] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setState(loadInterviewPrep(offerId));
    setCurrentSession(0);
    setRevealed({});
  }, [offerId]);

  function change(patch: Partial<InterviewPrepState>) {
    const next = { ...state, ...patch };
    saveInterviewPrep(offerId, next);
    setState(next);
    if (questions.length) {
      updateWorkspaceState(loadWorkspace(), offerId, {
        interviewPrepReady: interviewPrepComplete(next, questions),
      });
    }
  }

  if (!offerId || !offer) {
    return <section className="page interview-prep-page">
      <div className="interview-prep-empty card">
        <h1>Préparation d’entretien</h1>
        <p>Choisis une candidature dans l’onglet « Entretiens » pour ouvrir des séances adaptées à son poste.</p>
        <Link className="button button--primary" to="/shortlist?tab=interviews">Voir mes entretiens</Link>
      </div>
    </section>;
  }

  const completed = practicedCount(state, questions);
  const stepsDone = completed + Number(state.mockComplete);
  const percent = Math.round((stepsDone / (questions.length + 1)) * 100);
  const current = sessions[currentSession];
  const mockSelected = currentSession === sessions.length;
  const hasReview = questions.some(q => state.practiced[q.id]);
  const returnUrl = '/shortlist?tab=interviews';

  return <section className="page interview-prep-page">
    <div className="interview-prep-top">
      <Link to={returnUrl} className="interview-prep-back">← Mes entretiens</Link>
      <span className="interview-prep-label">PRÉPARATION D’ENTRETIEN</span>
      <h1>{offer.company}</h1>
      <p className="interview-prep-role">{offer.title} · {offer.city || 'Lieu à confirmer'}</p>
      <p className="interview-prep-subtitle">Des exercices courts, des réponses à personnaliser et une simulation de 45 minutes. Aucune réponse n’est envoyée au recruteur.</p>
      <div className="interview-prep-actions">
        <Link className="button button--secondary" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Dossier de candidature</Link>
        <Link className="button button--secondary" to={`/cv?offer=${encodeURIComponent(offer.id)}&language=FR`}>Revoir le CV</Link>
        {offer.applicationUrl ? <a className="button button--secondary" href={offer.applicationUrl} target="_blank" rel="noreferrer">Revoir l’offre ↗</a> : null}
      </div>
    </div>

    <div className="interview-prep-overview">
      <article className="card interview-prep-progress">
        <div className="interview-prep-progress-head">
          <span>Progression des répétitions</span><strong>{percent} %</strong>
        </div>
        <div className="interview-prep-progressbar" role="progressbar" aria-label="Préparation terminée" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <div style={{ width: percent + '%' }} />
        </div>
        <small>{completed}/{questions.length} questions répétées à voix haute · Simulation {state.mockComplete ? 'effectuée' : 'à réaliser'}</small>
      </article>
      <article className="card interview-prep-meeting">
        <h2>Rendez-vous</h2>
        <div className="interview-prep-meeting-fields">
          <label>Date <input type="date" value={state.date} onChange={event => change({ date: event.target.value })} /></label>
          <label>Heure <input type="time" value={state.time} onChange={event => change({ time: event.target.value })} /></label>
          <label>Format <select value={state.format} onChange={event => change({ format: event.target.value })}>
            <option value="">À confirmer</option>
            <option value="Visioconférence">Visioconférence</option>
            <option value="Téléphone">Téléphone</option>
            <option value="Sur place">Sur place</option>
          </select></label>
          <label>Interlocuteur <input value={state.contact} placeholder="Non renseigné" onChange={event => change({ contact: event.target.value })} /></label>
        </div>
        <small>Les informations manquantes restent « à confirmer » ; elles ne sont pas inventées.</small>
      </article>
    </div>

    <div className="interview-prep-layout">
      <nav className="card interview-prep-session-list" aria-label="Séances de préparation">
        <h2>Mes séances</h2>
        {sessions.map((session, index) => {
          const done = session.questions.every(q => state.practiced[q.id]);
          return <button key={session.id} type="button" className={'interview-prep-session ' + (currentSession === index ? 'is-current' : '')}
            aria-current={currentSession === index ? 'step' : undefined} onClick={() => setCurrentSession(index)}>
            <span className="interview-prep-index">{done ? '✓' : index + 1}</span>
            <span><strong>{session.title}</strong><small>{session.minutes} min · {done ? 'Répétée' : session.questions.filter(q => state.practiced[q.id]).length + '/' + session.questions.length + ' question(s)'}</small></span>
          </button>;
        })}
        <button type="button" className={'interview-prep-session ' + (mockSelected ? 'is-current' : '')}
          aria-current={mockSelected ? 'step' : undefined} onClick={() => setCurrentSession(sessions.length)}>
          <span className="interview-prep-index">{state.mockComplete ? '✓' : '4'}</span>
          <span><strong>Entretien blanc</strong><small>45 min · {state.mockComplete ? 'Effectué' : 'À faire'}</small></span>
        </button>
        <p className="interview-prep-footnote">Ton travail est enregistré automatiquement dans ce navigateur, séparément pour chaque candidature.</p>
      </nav>

      <div className="interview-prep-main">
        {!mockSelected && current ? <>
          <article className="card interview-prep-intro">
            <p className="interview-prep-eyebrow">SÉANCE {currentSession + 1} / 4 · {current.minutes} MIN</p>
            <h2>{current.title}</h2>
            <p>{current.aim}</p>
            <p className="interview-prep-directions">Lis la question, réponds à voix haute sans regarder l’exemple, puis compare. Note ta propre réponse et coche la question uniquement après l’avoir pratiquée.</p>
          </article>
          {current.questions.map((question, index) => <article className="card interview-prep-question" key={question.id}>
            <div className="interview-prep-question-top"><span>QUESTION {index + 1}</span><span>Objectif : {question.target}</span></div>
            <h3>{question.prompt}</h3>
            <label className="interview-prep-response">Ta réponse (tes mots)
              <textarea rows={3} placeholder="Quelques phrases naturelles que tu peux réellement défendre…" value={state.answers[question.id] ?? ''}
                onChange={event => change({ answers: { ...state.answers, [question.id]: event.target.value } })} />
            </label>
            <button className="button button--secondary" type="button" aria-expanded={!!revealed[question.id]} onClick={() => setRevealed(previous => ({ ...previous, [question.id]: !previous[question.id] }))}>
              {revealed[question.id] ? 'Masquer l’exemple' : 'Voir une réponse possible'}
            </button>
            {revealed[question.id] ? <div className="interview-prep-example">
              <strong>Exemple à adapter, pas à réciter</strong>
              <p>{question.example}</p>
              <p><strong>Conseil du tuteur :</strong> {question.advice}</p>
            </div> : null}
            <label className="interview-prep-reviewed"><input type="checkbox" checked={!!state.practiced[question.id]}
              onChange={event => change({ practiced: { ...state.practiced, [question.id]: event.target.checked } })} />
              Je l’ai répétée à voix haute et je peux l’expliquer.
            </label>
          </article>)}
          <article className="card interview-prep-notes">
            <label>Ce que je dois améliorer dans cette séance
              <textarea rows={3} value={state.sessionNotes[current.id] ?? ''} placeholder="Un point concret à travailler avant l’entretien…"
                onChange={event => change({ sessionNotes: { ...state.sessionNotes, [current.id]: event.target.value } })} />
            </label>
          </article>
        </> : <article className="card interview-prep-mock">
          <p className="interview-prep-eyebrow">SÉANCE 4 / 4 · 45 MIN</p>
          <h2>Entretien blanc — sans notes</h2>
          <p>Simule un premier entretien de recrutement. Réponds à voix haute aux huit questions ci-dessous, sans lire les exemples. Le but est d’être naturel et précis, pas d’apprendre un script.</p>
          <ol>{questions.map(question => <li key={question.id}>{question.prompt}</li>)}</ol>
          <div className="interview-prep-mock-review">
            <label>Après l’exercice : ce qui est clair, ce qui bloque, ce que je corrige
              <textarea rows={5} value={state.mockNotes} onChange={event => change({ mockNotes: event.target.value })}
                placeholder="Ex. pitch trop long ; revoir le rôle de ROS2 ; projet de segmentation bien expliqué…" />
            </label>
            <label className="interview-prep-reviewed"><input type="checkbox" checked={state.mockComplete}
              onChange={event => change({ mockComplete: event.target.checked })} />
              J’ai terminé une simulation complète et noté les points à améliorer.
            </label>
          </div>
        </article>}

        <div className="interview-prep-next">
          <button type="button" className="button button--secondary" disabled={currentSession === 0} onClick={() => setCurrentSession(currentSession - 1)}>Séance précédente</button>
          {currentSession < sessions.length ? <button type="button" className="button button--primary" onClick={() => setCurrentSession(currentSession + 1)}>Séance suivante</button>
          : <Link className="button button--primary" to={returnUrl}>{interviewPrepComplete(state, questions) ? 'Préparation terminée · Voir mes entretiens' : 'Retour aux entretiens'}</Link>}
        </div>
        {!hasReview ? <p className="interview-prep-footerhint">Commence par la première question ; les exemples sont masqués pour encourager une vraie préparation.</p> : null}
      </div>
    </div>
  </section>;
}
