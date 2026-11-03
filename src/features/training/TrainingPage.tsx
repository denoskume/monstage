import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { ApiAuthError } from '../../api/authClient';
import { weeks } from './program';
import { lessons } from './lessons';
import { quizzes } from './quizzes';
import { emptyLog, emptyTraining, masteryReady, plannedDate, progress, setTask, validateTraining, type DayLog, type TrainingState } from './training';
import { trainingRequest } from './trainingApi';
import './training.css';

type Tab = 'overview' | 'learn' | 'missions' | 'review';
const dateLabel = (date: string) => date ? new Date(date + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'À planifier';
function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
function Bar({ value, label }: { value: number; label: string }) {
  return <div className="lms-bar" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }} /></div>;
}
export function TrainingPage() {
  const { token, user, invalidateSession } = useAuth();
  const [state, setState] = useState<TrainingState>(emptyTraining);
  const [revision, setRevision] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('Chargement du suivi privé…');
  const [error, setError] = useState('');
  const [weekIndex, setWeekIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [tab, setTab] = useState<Tab>('overview');
  const [copyMessage, setCopyMessage] = useState('');
  const [draft, setDraft] = useState<{ state: TrainingState; revision: string | null } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const key = `monstage:lms:v1:${user?.email ?? 'owner'}`;
  const latest = useRef({ state, revision, dirty }); latest.current = { state, revision, dirty };
  useEffect(() => {
    let cancelled = false;
    setReady(false); setError(''); setDraft(null);
    // Recovery must remain available even if the private backend cannot be read.
    try {
      const raw = localStorage.getItem(key);
      if (raw) { const parsed = JSON.parse(raw); setDraft({ state: validateTraining(parsed.state), revision: parsed.revision ?? null }); }
    } catch { /* An unreadable draft must not replace the private record. */ }

    trainingRequest(token, { action: 'load' }).then(result => {
      if (cancelled) return;
      setState(result.state ?? emptyTraining()); setRevision(result.revision); setReady(true); setDirty(false); setMessage('Suivi privé chargé');
    }).catch(err => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Lecture impossible.'); setMessage('Suivi non chargé');
      if (err instanceof ApiAuthError) invalidateSession();
    });
    return () => { cancelled = true; };
  }, [token, key, invalidateSession]);
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (latest.current.dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, []);
  function change(next: TrainingState) {
    setState(next); setDirty(true); setMessage('Modifications à enregistrer');
    try { localStorage.setItem(key, JSON.stringify({ state: next, revision })); }
    catch { setError('Le brouillon local ne peut pas être conservé. Enregistre ou exporte ton suivi avant de quitter.'); }
  }
  async function save() {
    if (!ready || busy) return;
    setBusy(true); setError('');
    const snapshot = state;
    try {
      const result = await trainingRequest(token, { action: 'save', state: snapshot, revision });
      setRevision(result.revision);
      // Inputs are disabled during saving, so the committed snapshot is the visible state.
      setDirty(false); setMessage('Suivi enregistré dans ton espace privé'); setDraft(null);
      localStorage.removeItem(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      if (err instanceof ApiAuthError) invalidateSession();
    } finally { setBusy(false); }
  }
  function patchLog(id: string, patch: Partial<DayLog>) {
    change({ ...state, logs: { ...state.logs, [id]: { ...emptyLog(), ...state.logs[id], ...patch } } });
  }
  const week = weeks[weekIndex]; const lesson = lessons[weekIndex]; const quiz = quizzes[weekIndex];
  const day = week.days[dayIndex]; const log = { ...emptyLog(), ...state.logs[day.id] };
  const overall = progress(state); const weekly = progress(state, week.id);
  const daysDone = weeks.flatMap(w => w.days).filter(d => d.tasks.every(t => state.tasks[t.id])).length;
  const hours = Object.values(state.logs).reduce((sum, l) => sum + l.minutes, 0) / 60;
  const masteryCount = weeks.filter((w, wi) => state.mastered[w.id] && masteryReady(state, wi)).length;
  const blockerCount = Object.values(state.logs).filter(l => l.blocker.trim()).length;
  const quizPassed = quiz.every((q, qi) => state.answers?.[`${week.id}q${qi}`] === q.correct);
  const hasEvidence = week.days.some(d => state.logs[d.id]?.evidence.trim());
  const canMaster = masteryReady(state, weekIndex);
  const nextDay = weeks.flatMap((w, wi) => w.days.map((d, di) => ({ w, d, wi, di }))).find(({ d }) => d.tasks.some(t => !state.tasks[t.id]));
  function selectWeek(index: number) { setWeekIndex(index); setDayIndex(0); }
  function jump(wi: number, di: number, nextTab: Tab) { selectWeek(wi); setDayIndex(di); setTab(nextTab); contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 250000) throw new Error('Fichier trop volumineux.');
      const next = validateTraining(JSON.parse(await file.text()));
      if (!window.confirm('Remplacer le suivi affiché par cette sauvegarde ? Le remplacement privé aura lieu seulement après Enregistrer.')) return;
      change(next); setError('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Import impossible.'); }
    if (importRef.current) importRef.current.value = '';
  }
  return <div className="lms page">
    <h1 className="sr-only">Stage Computer Vision et traitement d’image</h1>
    <div className="lms-savebar"><span role="status">{busy ? 'Enregistrement…' : message}{dirty && ' •'}</span><div><button className="button button--ghost" onClick={() => download('stage-cv-progression.json', JSON.stringify(state, null, 2))}>Exporter le suivi</button><button className="button button--primary" disabled={!ready || busy || !dirty} onClick={save}>Enregistrer le suivi</button></div></div>
    {error && <div className="lms-alert" role="alert">{error} {!ready && <button onClick={() => window.location.reload()}>Réessayer le chargement</button>}</div>}
    {draft && <div className="lms-alert">Un brouillon non enregistré est disponible sur cet appareil. {draft.revision !== revision && <strong>La version privée a changé : compare les données avant de sauvegarder.</strong>}<div><button className="button button--secondary" disabled={!ready || busy} onClick={() => { change(draft.state); setDraft(null); }}>Restaurer le brouillon</button><button className="button button--ghost" onClick={() => download('stage-cv-brouillon.json', JSON.stringify(draft.state, null, 2))}>Exporter le brouillon</button><button className="button button--ghost" onClick={() => { localStorage.removeItem(key); setDraft(null); }}>Garder la version privée</button></div></div>}
    <section className="lms-stats" aria-label="Progression du stage">
      <article className="card"><span>Progression des tâches</span><strong>{overall.percent}<small>%</small></strong><Bar value={overall.percent} label="Progression globale" /><small>{overall.completed} / {overall.total} tâches réalisées</small></article>
      <article className="card"><span>Journées terminées</span><strong>{daysDone}<small> / 40</small></strong><small>Toutes les tâches du jour cochées</small></article>
      <article className="card"><span>Maîtrise validée</span><strong>{masteryCount}<small> / 8</small></strong><small>Revue pratique après chaque mission</small></article>
      <article className="card"><span>Temps de pratique</span><strong>{hours.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}<small> h</small></strong><small>{blockerCount ? `${blockerCount} blocage(s) à traiter` : 'Aucun blocage signalé'}</small></article>
    </section>
    <nav className="lms-tabs" role="tablist" aria-label="Espace de formation">{([['overview', 'Tableau de bord'], ['learn', 'Apprendre'], ['missions', 'Missions & journal'], ['review', 'Validation']] as const).map(([id, label]) => <button id={`tab-${id}`} role="tab" aria-controls="lms-panel" aria-selected={tab === id} className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <div className="lms-layout">
      <aside className="lms-sidebar card"><p className="eyebrow">Ton parcours</p><h2>Roadmap · 8 semaines</h2>{weeks.map((w, wi) => { const p = progress(state, w.id); return <button key={w.id} className={`lms-week ${wi === weekIndex ? 'active' : ''}`} onClick={() => selectWeek(wi)} aria-current={wi === weekIndex ? 'step' : undefined}><span className="lms-week__number">{state.mastered[w.id] && masteryReady(state, wi) ? '✓' : String(wi + 1).padStart(2, '0')}</span><span><strong>{w.title}</strong><small>{p.completed}/{p.total} tâches · {p.percent}%</small><Bar value={p.percent} label={`Semaine ${wi + 1}`} /></span></button>; })}<p className="lms-muted">Les modules restent accessibles pour réviser ou adapter le rythme. L’avancement et la maîtrise sont suivis séparément.</p></aside>
      <section ref={contentRef} id="lms-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="lms-content">
        {tab === 'overview' ? <>
          <article className="card lms-section lms-next"><p className="eyebrow">Prochaine séance</p><h2>{nextDay ? nextDay.d.title : 'Toutes les tâches sont réalisées'}</h2><p>{nextDay ? `Semaine ${nextDay.wi + 1} · Jour ${nextDay.di + 1} · ${dateLabel(plannedDate(state, nextDay.wi, nextDay.di))}` : 'Termine les revues de maîtrise et prépare la livraison finale.'}</p><button className="button button--primary" onClick={() => nextDay ? jump(nextDay.wi, nextDay.di, 'missions') : setTab('review')}>{nextDay ? 'Ouvrir ma séance' : 'Faire la revue finale'} →</button></article>
          <article className="card lms-section"><div className="lms-section__heading"><div><p className="eyebrow">Organisation</p><h2>Un rythme ajustable</h2></div><label>Date de début<input type="date" value={state.startDate} disabled={!ready || busy} onChange={e => change({ ...state, startDate: e.target.value })} /></label></div><p>5 séances par semaine. Les dates sont calculées à partir du premier jour ouvré choisi. Chaque séance peut être déplacée dans son journal ; les week-ends gardent une marge de manœuvre.</p><div className="lms-legend"><span>1. Brief concret</span><span>2. Démonstration</span><span>3. Pratique accompagnée</span><span>4. Variante autonome</span><span>5. Revue technique</span></div></article>
          <article className="card lms-section"><p className="eyebrow">Programme entier</p><h2>Les missions et leurs livrables</h2><div className="lms-roadmap">{weeks.map((w, wi) => <div className="lms-roadmap__row" key={w.id}><div className="lms-roadmap__index">S{wi + 1}</div><div><h3>{w.title}</h3><p>{w.mission}</p><div className="lms-tags">{w.tools.map(t => <span key={t}>{t}</span>)}</div><p><strong>À livrer :</strong> {w.deliverable}</p></div><button className="button button--secondary" onClick={() => jump(wi, 0, 'learn')}>Étudier →</button></div>)}</div></article>
          <article className="card lms-section"><h2>À traiter avec ton encadrant</h2>{blockerCount ? weeks.flatMap((w, wi) => w.days.map((d, di) => ({ d, wi, di }))).filter(({ d }) => state.logs[d.id]?.blocker.trim()).map(({ d, wi, di }) => <button className="lms-blocker" key={d.id} onClick={() => jump(wi, di, 'missions')}><strong>S{wi + 1} · {d.title}</strong><span>{state.logs[d.id].blocker}</span></button>) : <p>Note un blocage dans le journal : ce que tu attendais, ce que tu observes et ce que tu as essayé. Il apparaîtra ici.</p>}</article>
        </> : <>
          <article className="card lms-section"><p className="eyebrow">Mission {weekIndex + 1} · Semaine {weekIndex + 1}</p><h2>{week.title}</h2><p>{week.mission}</p><div className="lms-tags">{week.tools.map(t => <span key={t}>{t}</span>)}</div><Bar value={weekly.percent} label="Progression de la mission" /><p className="lms-muted">{weekly.completed}/{weekly.total} tâches réalisées · {state.mastered[week.id] && canMaster ? 'Maîtrise validée' : 'Maîtrise à démontrer'}</p></article>
          {tab === 'learn' && <>
            <article className="card lms-section"><p className="eyebrow">Leçon pratique</p><h2>{lesson.title}</h2>{lesson.explanation.map(p => <p key={p}>{p}</p>)}<div className="lms-codeheading"><h3>{lesson.codeTitle}</h3><button className="button button--secondary" onClick={async () => { try { await navigator.clipboard.writeText(lesson.code); setCopyMessage('Code copié'); } catch { setCopyMessage('Copie indisponible : sélectionne le code ou télécharge-le.'); } }}>Copier le code</button><button className="button button--ghost" onClick={() => download(`semaine-${weekIndex + 1}.py`, lesson.code, 'text/x-python')}>Télécharger .py</button></div>{copyMessage && <p role="status">{copyMessage}</p>}<pre className="lms-code"><code>{lesson.code}</code></pre><p className="lms-muted">Exemple pédagogique à adapter. Les fichiers, poids et datasets indiqués doivent être préparés ; lire les commentaires avant exécution.</p><label className="lms-check"><input type="checkbox" checked={!!state.lessonRead?.[week.id]} disabled={!ready || busy} onChange={e => change({ ...state, lessonRead: { ...state.lessonRead, [week.id]: e.target.checked }, mastered: { ...state.mastered, [week.id]: false } })} />J’ai étudié la leçon et exécuté l’exemple adapté à mon environnement.</label></article>
            <article className="card lms-section"><p className="eyebrow">Lectures essentielles</p><h2>Lire pour réaliser la mission</h2>{lesson.readings.map(r => <div className="lms-reading" key={r.url}><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a><p>{r.instruction}</p></div>)}</article>
            <article className="card lms-section"><p className="eyebrow">Pratique autonome</p><h2>À toi de réaliser</h2><p>{lesson.exercise}</p><h3>Critères de réussite</h3><ul>{lesson.checks.map(c => <li key={c}>{c}</li>)}</ul><details><summary>Besoin d’un indice ?</summary><p>{lesson.hint}</p></details><details><summary>Voir la démarche attendue après ton essai</summary><p>{lesson.solution}</p></details><button className="button button--primary" onClick={() => setTab('missions')}>Passer à la pratique →</button></article>
          </>}
          {tab === 'missions' && <>
            <nav className="lms-days" aria-label="Journées de la mission">{week.days.map((d, di) => <button className={di === dayIndex ? 'active' : ''} key={d.id} onClick={() => setDayIndex(di)} aria-pressed={di === dayIndex}><strong>Jour {di + 1}{d.tasks.every(t => state.tasks[t.id]) ? ' ✓' : ''}</strong><small>{dateLabel(plannedDate(state, weekIndex, di))}</small></button>)}</nav>
            <article className="card lms-section"><p className="eyebrow">Séance {weekIndex * 5 + dayIndex + 1} / 40</p><h2>{day.title}</h2><div className="lms-focus"><strong>Le réflexe à acquérir</strong><p>{lesson.focus[dayIndex]}</p><button className="button button--ghost" onClick={() => setTab('learn')}>Ouvrir la leçon et le code →</button></div><h3>Travail à réaliser</h3>{day.tasks.map(t => <label className="lms-check" key={t.id}><input type="checkbox" checked={!!state.tasks[t.id]} disabled={!ready || busy} onChange={e => change(setTask(state, t.id, e.target.checked))} /><span>{t.label}</span></label>)}<p className="lms-muted">Coche après avoir réalisé et vérifié le résultat. La maîtrise sera revue séparément.</p></article>
            <article className="card lms-section"><h2>Journal de séance</h2><fieldset disabled={!ready || busy} className="lms-fields"><div className="lms-two"><label>Date de séance<input type="date" value={plannedDate(state, weekIndex, dayIndex)} onChange={e => patchLog(day.id, { date: e.target.value })} /></label><label>Temps réellement pratiqué (minutes)<input type="number" min="0" max="1440" value={log.minutes} onChange={e => patchLog(day.id, { minutes: Math.max(0, Math.min(1440, Number(e.target.value) || 0)) })} /></label></div><label>Ce que j’ai réalisé et compris<textarea rows={4} maxLength={10000} value={log.notes} placeholder="Résultat obtenu, choix, erreurs comprises, point à reprendre…" onChange={e => patchLog(day.id, { notes: e.target.value })} /></label><label>Blocage à traiter avec l’encadrant<textarea rows={3} maxLength={10000} value={log.blocker} placeholder="Attendu / observé / essais déjà réalisés. Efface ce champ une fois le blocage résolu." onChange={e => patchLog(day.id, { blocker: e.target.value })} /></label><label>Preuves et livrables<textarea rows={3} maxLength={10000} value={log.evidence} placeholder="Lien du commit, notebook, résultats, captures ou description d’une preuve vérifiable…" onChange={e => patchLog(day.id, { evidence: e.target.value })} /></label></fieldset><div className="lms-section__heading"><button className="button button--secondary" disabled={dayIndex === 0} onClick={() => setDayIndex(dayIndex - 1)}>← Jour précédent</button><button className="button button--primary" onClick={() => dayIndex < 4 ? setDayIndex(dayIndex + 1) : setTab('review')}>{dayIndex < 4 ? 'Jour suivant →' : 'Faire la revue →'}</button></div></article>
          </>}
          {tab === 'review' && <>
            <article className="card lms-section"><p className="eyebrow">Vérifier la compréhension</p><h2>Questions de contrôle</h2><p>Ces questions préparent la revue. La preuve principale reste ta réalisation autonome.</p>{quiz.map((q, qi) => { const id = `${week.id}q${qi}`; const answer = state.answers?.[id]; return <fieldset className="lms-question" key={id} disabled={!ready || busy}><legend>{qi + 1}. {q.question}</legend>{q.options.map((option, oi) => <label key={option}><input type="radio" name={id} checked={answer === oi} onChange={() => change({ ...state, answers: { ...state.answers, [id]: oi }, mastered: { ...state.mastered, [week.id]: false } })} />{option}</label>)}{answer !== undefined && <p className={answer === q.correct ? 'lms-feedback good' : 'lms-feedback'}>{answer === q.correct ? 'Correct. ' : 'À revoir. '}{q.explanation}</p>}</fieldset>; })}</article>
            <article className="card lms-section"><p className="eyebrow">Revue avec ton encadrant</p><h2>Valider la maîtrise</h2><p><strong>À livrer :</strong> {week.deliverable}</p><p><strong>À démontrer :</strong> {week.mastery}</p><ul className="lms-gates"><li>{weekly.percent === 100 ? '✓' : '○'} Toutes les tâches réalisées</li><li>{state.lessonRead?.[week.id] ? '✓' : '○'} Leçon étudiée et exemple exécuté</li><li>{quizPassed ? '✓' : '○'} Questions de contrôle comprises</li><li>{hasEvidence ? '✓' : '○'} Preuve renseignée dans le journal</li></ul><label className="lms-check"><input type="checkbox" checked={!!state.mastered[week.id] && canMaster} disabled={!ready || busy || !canMaster} onChange={e => change({ ...state, mastered: { ...state.mastered, [week.id]: e.target.checked } })} />Après revue, je sais refaire, expliquer et adapter cette mission sans tutoriel pas à pas.</label><p className="lms-muted">Cette validation est déclarative et doit suivre une démonstration à l’encadrant. Elle ne constitue pas une certification automatique.</p>{weekIndex < 7 && <button className="button button--primary" onClick={() => jump(weekIndex + 1, 0, 'learn')}>Ouvrir la mission suivante →</button>}</article>
          </>}
        </>}
        <footer className="lms-backup"><span>Ton suivi est privé. Enregistre après chaque séance.</span><button className="button button--ghost" disabled={!ready || busy} onClick={() => importRef.current?.click()}>Importer une sauvegarde</button><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={e => importFile(e.target.files?.[0])} /></footer>
      </section>
    </div>
  </div>;
}
