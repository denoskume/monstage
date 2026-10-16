import type { InternshipOffer } from '../../api/contract';
import { loadCvDraft, type CvDraft, type CvLanguage } from '../cv/cvStorage';
import { loadCoverLetter, type CoverLetterDraft } from '../cl/clStorage';

const normalized = (value: string) => value.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const relevantTerms = ['computer vision', 'vision', 'image', 'signal', 'audio', 'machine learning', 'deep learning', 'data science', 'data', 'python', 'ai', 'intelligence artificielle', 'automation', 'automatisation', 'qualite', 'quality', 'optimisation', 'optimization', 'research', 'r&d', 'pytorch', 'opencv'];

function focus(offer: InternshipOffer): string[] {
  const text = normalized([offer.title, offer.specialization, offer.domain, ...offer.skills].filter(Boolean).join(' '));
  return relevantTerms.filter((term) => text.includes(term)).slice(0, 5);
}

export function tailorCvForOffer(offer: InternshipOffer, language: CvLanguage): CvDraft {
  const base = structuredClone(loadCvDraft(language));
  const terms = focus(offer);
  const rank = (value: string) => terms.reduce((score, term) => score + (normalized(value).includes(term) ? 1 : 0), 0);
  base.projects = [...base.projects].sort((a, b) => rank(b.name + ' ' + b.bullets.join(' ')) - rank(a.name + ' ' + a.bullets.join(' ')));
  const lines = base.skills.split('\n').filter(Boolean);
  base.skills = [...lines].sort((a, b) => rank(b) - rank(a)).join('\n');
  const direction = terms.slice(0, 3).join(', ');
  if (language === 'FR') {
    base.summary = 'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois à partir de février 2027. Je souhaite contribuer à des missions de ' + (direction || 'data science et intelligence artificielle') + ' chez ' + offer.company + ', en m’appuyant sur mes projets académiques et mon envie de progresser.';
  } else {
    base.summary = 'Final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a six-month internship starting February 2027. I would like to contribute to ' + (direction || 'applied data science and machine learning') + ' projects at ' + offer.company + ', building on my academic experience and willingness to learn.';
  }
  return base;
}

export function tailorLetterForOffer(offer: InternshipOffer, language: CvLanguage): CoverLetterDraft {
  const stored = loadCoverLetter();
  const terms = focus(offer);
  const f = terms.slice(0, 3);
  const subject = offer.title;
  const company = offer.company;
  const city = offer.city || '';
  const skills = offer.skills.slice(0, 4).join(', ');
  const draft: CoverLetterDraft = {
    ...structuredClone(stored), language, company, internshipTitle: subject,
    team: '', recipientName: '', recipientRole: '', recipientLocation: city,
    date: new Date().toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    greeting: language === 'FR' ? 'Madame, Monsieur,' : 'Dear Hiring Manager,',
    closing: language === 'FR' ? 'Cordialement,' : 'Sincerely,',
    paragraphs: [],
  };
  if (language === 'FR') {
    draft.paragraphs = [
      'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je souhaite vous proposer ma candidature au poste de « ' + subject + ' ». Je recherche un stage de fin d’études de six mois à partir de février 2027.',
      'Cette mission chez ' + company + ' m’intéresse notamment pour ses dimensions ' + (f.length ? f.join(', ') : 'techniques et appliquées') + '. Je souhaite découvrir les problématiques de votre équipe et contribuer à des réalisations concrètes.',
      'Ma formation m’apporte des bases en programmation Python, machine learning et traitement du signal et de l’image. Mes projets m’ont appris à comparer des méthodes, analyser les erreurs et présenter des résultats vérifiables.' + (skills ? ' Les compétences mentionnées dans votre offre, notamment ' + skills + ', correspondent aux domaines que je souhaite approfondir.' : '') + ' Je pourrais ainsi apporter une approche rigoureuse, de la curiosité et une réelle envie d’apprendre.',
      'Je serais heureux de pouvoir échanger avec vous sur la mission, ses objectifs et l’adéquation de mon parcours avec les besoins de votre équipe.',
    ];
  } else {
    draft.paragraphs = [
      'I am a final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, applying for the ' + subject + ' position. I am seeking a six-month end-of-studies internship starting February 2027.',
      'I am interested in this opportunity at ' + company + ' because it involves ' + (f.length ? f.join(', ') : 'applied engineering and technical problem solving') + '. I would value the opportunity to learn about your team’s work and contribute to practical projects.',
      'My studies and projects have given me foundations in Python, machine learning, signal and image processing. I have learned to compare methods, analyse errors and explain results clearly.' + (skills ? ' Your requirements, including ' + skills + ', align with areas I want to develop further.' : '') + ' I would bring curiosity, attention to detail and a strong willingness to learn.',
      'I would highly appreciate the opportunity to discuss my skills and motivation over an interview at your earliest convenience.',
    ];
  }
  return draft;
}
