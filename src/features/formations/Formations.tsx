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
  const dependencies = course.id === 'vision' ? 'numpy matplotlib scikit-image opencv-python-headless' : 'pandas matplotlib';
  const cells = [
    markdown('# ' + lesson.title + '\n\n' + course.goal),
    markdown('Dans un noyau Python 3, exécute les cellules dans l’ordre.'),
    code('%pip install ' + dependencies),
    markdown('## Exemple guidé'), code(lesson.code), markdown(lesson.reading),
    markdown('## À toi de modifier\n' + lesson.guided), code(''),
    markdown('## Mission autonome\n' + lesson.mission), code(''), markdown('**Mon diagnostic**\n\nÀ compléter.')
  ];
  const file = { nbformat: 4, nbformat_minor: 4, metadata: { kernelspec: { name: 'python3', display_name: 'Python 3', language: 'python' } }, cells };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], {type: 'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = course.id + '-' + lesson.id + '.ipynb';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Exercise({course, lesson}: {course: Course; lesson: Lesson}) {
  const [answer, setAnswer] = useState<number | null>(null);
  const next = course.lessons[course.lessons.indexOf(lesson) + 1];
  return <>
    <h1>{lesson.title}</h1>
    <section className="card lms-section"><h2>Exemple guidé</h2>
      <pre><code>{lesson.code}</code></pre><p>{lesson.reading}</p>
      <button className="button button--primary" onClick={() => notebook(lesson, course)}>Télécharger le notebook Jupyter</button>
    </section>
    <section className="card lms-section"><h2>À toi de modifier</h2><p>{lesson.guided}</p>
      <fieldset><legend>{lesson.question}</legend>{lesson.answers.map((choice, i) => <label key={choice}><input type="radio" name="question" checked={answer === i} onChange={() => setAnswer(i)} /> {choice}</label>)}</fieldset>
      <p role="status">{answer === null ? '' : answer === lesson.correct ? 'Bonne réponse.' : 'Reprends l’exemple, puis essaie de nouveau.'}</p>
    </section>
    <section className="card lms-section"><h2>Mission en autonomie</h2><p>{lesson.mission}</p>
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
      <h1>Formations</h1><p>Prépare ta première mission de stage. Chaque leçon associe un exemple Python, une manipulation guidée et un résultat à présenter à ton tuteur.</p>
      <div className="stage-course-grid">{courses.map(item => <article className="card lms-section" key={item.id}>
        <p className="eyebrow">{item.plan}</p><h2>{item.title}</h2><p>{item.goal}</p>
        <Link className="button button--primary" to={'/formations/' + item.id}>Explorer le parcours {item.plan.slice(-1)}</Link>
      </article>)}</div>
    </> : lesson ? <Exercise key={lesson.id} course={course} lesson={lesson} /> : <>
      <p className="eyebrow">{course.plan}</p><h1>{course.title}</h1><p>{course.goal}</p>
      <ol className="formation-list">{course.lessons.map(item => <li className="card lms-section" key={item.id}><h2><Link to={'/formations/' + course.id + '/' + item.id}>{item.title}</Link></h2><p>{item.mission}</p></li>)}</ol>
      <Link to={course.project}>Accéder au stage pratique</Link>
    </>}
  </section>;
}
