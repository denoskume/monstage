import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { courses } from './courses';
import '../training/training.css';
import './formations.css';

type Course = typeof courses[number];
type Lesson = Course['lessons'][number];

function notebook(lesson: Lesson, course: Course) {
  const markdown = (source: string) => ({ cell_type: 'markdown', metadata: {}, source });
  const code = (source: string) => ({ cell_type: 'code', metadata: {}, source, execution_count: null, outputs: [] });
  const packages = [
    ['torch', 'torch'], ['numpy', 'numpy'], ['matplotlib', 'matplotlib'], ['skimage', 'scikit-image'],
    ['cv2', 'opencv-python-headless'], ['sklearn', 'scikit-learn'], ['pandas', 'pandas']
  ].filter(([module]) => lesson.code.includes(module)).map(([, name]) => name);
  if (lesson.id === 'classer') packages.push('matplotlib');
  const cells = [
    markdown('# ' + lesson.title + '\n\n' + lesson.why), markdown('## Comprendre\n' + lesson.theory),
    markdown('Dans un noyau Python 3, exécute les cellules dans l’ordre.'),
    ...(packages.length ? [code('%pip install ' + packages.join(' '))] : []),
    markdown('## Exemple guidé'), code(lesson.code), markdown(lesson.reading),
    markdown('## À toi de modifier\n' + lesson.guided), code(''),
    markdown('## Mission autonome\n' + lesson.mission), code(''), markdown('## Validation\n' + lesson.check + '\n\n**Mon diagnostic**\n\nÀ compléter.')
  ];
  const file = { nbformat: 4, nbformat_minor: 4, metadata: { kernelspec: { name: 'python3', display_name: 'Python 3', language: 'python' } }, cells };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], {type: 'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = course.id + '-' + lesson.id + '.ipynb';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PixelGrid() {
  const [values, setValues] = useState([0,255,0,255,255,255,0,255,0]);
  return <div className="formation-pixels"><p>Clique sur une case pour inverser sa luminosité.</p>
    <div>{values.map((value, i) => <button key={i} type="button" aria-label={'Ligne ' + (1 + Math.floor(i / 3)) + ', colonne ' + (1 + i % 3) + ', intensité ' + value}
      style={{background: value ? 'white' : 'black', color: value ? 'black' : 'white'}}
      onClick={() => setValues(values.map((v, k) => k === i ? 255-v : v))}>{value}</button>)}</div>
  </div>;
}

function Exercise({course, lesson}: {course: Course; lesson: Lesson}) {
  const [answer, setAnswer] = useState<number | null>(null);
  const next = course.lessons[course.lessons.indexOf(lesson) + 1];
  return <>
    <p className="eyebrow">{course.plan} · Étape {course.lessons.indexOf(lesson) + 1} sur {course.lessons.length}</p>
    <h1>{lesson.title}</h1><p>{lesson.why}</p>
    <section className="card lms-section"><h2>Comprendre</h2><p>{lesson.theory}</p>{lesson.id === 'premiers-pixels' && <PixelGrid />}</section>
    <section className="card lms-section"><h2>Appliquer en Python</h2>
      <p>Télécharge le notebook puis ouvre-le dans Jupyter. Pour travailler depuis ton navigateur, ouvre Google Colab et importe le fichier .ipynb. Exécute chaque cellule dans l’ordre avec Maj + Entrée.</p><pre><code>{lesson.code}</code></pre><p>{lesson.reading}</p>
      <button className="button button--primary" onClick={() => notebook(lesson, course)}>Télécharger le notebook Jupyter</button>
    </section>
    <section className="card lms-section"><h2>À toi de modifier</h2><p>{lesson.guided}</p>
      <fieldset><legend>{lesson.question}</legend>{lesson.answers.map((choice, i) => <label key={choice}><input type="radio" name="question" checked={answer === i} onChange={() => setAnswer(i)} /> {choice}</label>)}</fieldset>
      <p role="status">{answer === null ? '' : answer === lesson.correct ? 'Bonne réponse. ' + lesson.hint : 'Réessaie. ' + lesson.hint}</p>
    </section>
    <section className="card lms-section"><h2>Mini-projet à livrer</h2><p>{lesson.mission}</p><h3>Critère de réussite</h3><p>{lesson.check}</p>
      <Link to={next ? '/formations/' + course.id + '/' + next.id : course.project}>{next ? 'Leçon suivante · ' + next.title : 'Appliquer ces acquis dans le stage pratique'}</Link>
    </section>
  </>;
}

export default function Formations() {
  const { parcours, lecon } = useParams();
  const course = courses.find(item => item.id === parcours);
  const lesson = course?.lessons.find(item => item.id === lecon);
  if ((parcours && !course) || (lecon && !lesson)) return <Navigate to="/formations" replace />;
  return <section className="page formations" lang="fr">
    {course && <nav aria-label="Fil d’Ariane"><Link to="/formations">Formations</Link>{lesson && <> / <Link to={'/formations/' + course.id}>{course.title}</Link></>}</nav>}
    {!course ? <>
      <h1>Formations</h1><p>Commence sans prérequis dans le domaine. Pour chaque étape, découvre la notion, teste le code puis réalise un mini-projet. La dernière étape simule une première mission confiée par un tuteur.</p>
      <div className="stage-course-grid">{courses.map(item => <article className="card lms-section" key={item.id}>
        <p className="eyebrow">{item.plan}</p><h2>{item.title}</h2><p>{item.goal}</p>
        <Link className="button button--primary" to={'/formations/' + item.id}>Explorer le parcours {item.plan.slice(-1)}</Link>
      </article>)}</div>
    </> : lesson ? <Exercise key={lesson.id} course={course} lesson={lesson} /> : <>
      <p className="eyebrow">{course.plan}</p><h1>{course.title}</h1><p>{course.goal}</p>
      <Link className="button button--primary" to={'/formations/' + course.id + '/' + course.lessons[0].id}>Commencer par la première leçon</Link>
      <h2>Parcours en {course.lessons.length} étapes</h2><ol className="formation-list">{course.lessons.map(item => <li className="card lms-section" key={item.id}><h2><Link to={'/formations/' + course.id + '/' + item.id}>{item.title}</Link></h2><p>{item.mission}</p></li>)}</ol>
      <Link to={course.project}>Accéder au stage pratique</Link>
    </>}
  </section>;
}
