import { Link } from 'react-router-dom';
import './training.css';
export function StagesPage() {
 return <section className="page stage-index"><h1>Mes stages pratiques</h1><div className="stage-course-grid">
  <article className="card lms-section"><p className="eyebrow">Parcours principal</p><h2>Computer Vision et traitement d’image</h2><p>Inspection visuelle : manipuler les images, entraîner et évaluer les modèles, puis livrer un pipeline utilisable.</p><Link className="button button--primary" to="/stage-cv">Ouvrir le stage Computer Vision</Link></article>
  <article className="card lms-section"><p className="eyebrow">Parcours Data Analysis</p><h2>Stage Data Analyst en entreprise</h2><p>Un dossier maintenance à prendre en charge : fiabiliser les données, livrer le bilan, expliquer les écarts et transmettre le tableau de pilotage.</p><Link className="button button--primary" to="/stages/data-analysis">Ouvrir le projet Data Analysis</Link></article>
 </div></section>;
}
