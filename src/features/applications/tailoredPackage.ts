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
  const isUncertaintySegmentation = /incertitude/i.test(offer.title) && /segmentation/i.test(offer.title);
  if (isUncertaintySegmentation) {
    const precision = (value: string) => /segment|calibrat|traitement d.image|image processing|computer vision|deep learning|pytorch|opencv/i.test(value) ? 10 : 0;
    base.projects = [...base.projects].sort((a, b) => precision(b.name + b.bullets.join(' ')) - precision(a.name + a.bullets.join(' ')));
    base.summary = language === 'FR'
      ? 'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Je souhaite contribuer chez Dassault Systèmes à la segmentation d’images et à l’évaluation de la fiabilité des modèles, en approfondissant la quantification de l’incertitude.'
      : 'Final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a six-month internship from February 2027. I want to contribute to image segmentation and model evaluation at Dassault Systèmes while developing my understanding of uncertainty quantification.';
    return base;
  }
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
  if (/incertitude/i.test(subject) && /segmentation/i.test(subject)) {
    draft.paragraphs = language === 'FR' ? [
      'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je souhaite candidater au stage d’ingénieur recherche IA consacré à l’incertitude en segmentation médicale (réf. 549574). Je recherche un stage de fin d’études de six mois à partir de février 2027.',
      'Les travaux de Dassault Systèmes sur les jumeaux virtuels et la santé numérique m’intéressent, en particulier la question de la fiabilité des segmentations. Votre projet associe revue de littérature, conception d’un modèle et évaluation des indicateurs de qualité. Cette articulation entre recherche et expérimentation correspond à la démarche que je souhaite développer.',
      'Mon MSc me forme au machine learning, au traitement du signal et de l’image et à l’optimisation. Dans mes projets de segmentation et de calibration caméra, j’ai appris à construire une chaîne de traitement et à examiner les résultats à l’aide de métriques adaptées. J’utilise Python et des outils comme PyTorch et OpenCV. Je n’ai pas encore travaillé sur les méthodes bayésiennes appliquées à l’imagerie médicale, mais je souhaite les étudier avec rigueur.',
      'Je serais heureux d’échanger avec votre équipe sur le sujet et sur la façon dont mes bases techniques, ma curiosité et mon attention à l’évaluation pourraient contribuer au projet.',
    ] : [
      'I am a final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, applying for your AI research internship on uncertainty in medical image segmentation (reference 549574). I am seeking a six-month internship starting February 2027.',
      'Your work on virtual twins and digital healthcare interests me, especially the reliability of image segmentation. I appreciate the combination of literature review, model design and evaluation in this research project.',
      'My MSc covers machine learning, signal and image processing, and optimization. Through segmentation and camera calibration projects, I have learned to build image-processing workflows and critically assess their results. I use Python and tools including PyTorch and OpenCV. Bayesian uncertainty methods for medical imaging are an area I would like to learn rather than claim as existing expertise.',
      'I would appreciate the opportunity to discuss how my technical foundations and interest in careful model evaluation could contribute to your team.',
    ];
    return draft;
  }
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
