import type { InternshipOffer } from '../../api/contract';
import { loadCvDraft, type CvDraft, type CvLanguage } from '../cv/cvStorage';
import { loadCoverLetter, type CoverLetterDraft } from '../cl/clStorage';

const normalized = (value: string) => value.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const relevantTerms = ['computer vision', 'vision', 'image', 'signal', 'audio', 'machine learning', 'deep learning', 'data science', 'data', 'python', 'ai', 'intelligence artificielle', 'automation', 'automatisation', 'qualite', 'quality', 'optimisation', 'optimization', 'research', 'r&d', 'pytorch', 'opencv'];

function focus(offer: InternshipOffer): string[] {
  const text = normalized([offer.title, offer.specialization, offer.domain, ...offer.skills].filter(Boolean).join(' '));
  return relevantTerms.filter((term) => text.includes(term)).slice(0, 5);
}

// Evidence-backed project catalogue supplements the editable CV master; no fictional scores.
// Entries already present in the saved CV take precedence.
const additionalProjects = {
  FR: [
    { id: 'clap', name: 'CLAP — Classification audio zero-shot', period: '2026', bullets: ['Évalué 2 000 extraits audio sur 50 classes et comparé 10 stratégies de prompts.', 'Amélioré la précision Top-1 de 83,05 % à 91,15 % sans fine-tuning.'] },
    { id: 'calibration', name: 'Calibration de caméra', period: '2026', bullets: ['Implémenté la calibration multi-vues avec DLT normalisé et méthode de Zhang.', 'Évalué les erreurs de reprojection et contrôlé la validité des paramètres de caméra.'] },
    { id: 'segmentation', name: 'Traitement d’images et segmentation', period: '2026', bullets: ['Expérimenté des méthodes de segmentation et de filtrage dans des travaux académiques.', 'Comparé les résultats à l’aide de métriques adaptées aux images.'] },
    { id: 'monstage', name: 'MonStage — Plateforme de veille de stages', period: '2026 — En cours', bullets: ['Développé une plateforme de centralisation et de filtrage d’offres de stage.', 'Intégré des collectes de données et des contrôles de qualité et de pertinence des offres.'] },
  ],
  EN: [
    { id: 'clap', name: 'CLAP — Zero-Shot Audio Classification', period: '2026', bullets: ['Evaluated 2,000 audio clips across 50 classes and compared 10 text prompt strategies.', 'Improved Top-1 accuracy from 83.05% to 91.15% without fine-tuning.'] },
    { id: 'calibration', name: 'Camera Calibration', period: '2026', bullets: ['Implemented multi-view camera calibration using normalized DLT and Zhang’s method.', 'Measured reprojection error and checked the validity of camera parameters.'] },
    { id: 'segmentation', name: 'Image Processing and Segmentation', period: '2026', bullets: ['Explored segmentation and image filtering methods in academic coursework.', 'Compared image-processing outcomes using relevant evaluation metrics.'] },
    { id: 'monstage', name: 'MonStage — Internship Intelligence Platform', period: '2026 — Ongoing', bullets: ['Built a platform to aggregate and filter internship opportunities.', 'Integrated data collection, relevance checks and offer-quality validation.'] },
  ],
};

const topicWords: Record<string, string[]> = {
  calibration: ['camera', 'calibrat', 'geometri', 'geometry', '3d', 'reconstruction', 'stereo', 'pose'],
  segmentation: ['segment', 'medical', 'imagerie', 'image', 'vision', 'opencv', 'pixel', 'detection'],
  clap: ['audio', 'speech', 'sound', 'signal', 'classification', 'evaluation', 'benchmark', 'prompt'],
  monstage: ['automati', 'pipeline', 'process', 'data engineering', 'workflow', 'quality', 'qualite', 'web', 'digital'],
  fraud: ['fraud', 'anomal', 'tabular', 'predict', 'data scien', 'classification', 'statistic', 'risk'],
  flag: ['vision', 'image', 'deep learning', 'pytorch', 'classification', 'robust', 'evaluation'],
};
export function projectSelectionForOffer(offer: InternshipOffer, language: CvLanguage) {
  const base = loadCvDraft(language);
  const combined = [...base.projects, ...additionalProjects[language].filter(p => !base.projects.some(existing => existing.id === p.id))];
  const job = normalized([offer.title, offer.domain, offer.specialization, offer.relevance, ...offer.skills].filter(Boolean).join(' '));
  const ranked = combined.map(project => {
    const evidence = normalized([project.name, ...project.bullets].join(' '));
    const topics = topicWords[project.id] || [];
    const matches = topics.filter(word => job.includes(word));
    const overlaps = ['python', 'pytorch', 'opencv', 'machine learning', 'deep learning', 'segmentation', 'data', 'image', 'signal', 'camera', 'classification', 'evaluation'].filter(word => job.includes(word) && evidence.includes(word));
    const score = matches.length * 5 + overlaps.length * 2;
    return { project, score, reason: project.name + ' : ' + (matches.concat(overlaps).slice(0, 3).join(', ') || 'compétences transversales') };
  }).sort((a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name));
  return ranked.slice(0, 3);
}

export function tailorCvForOffer(offer: InternshipOffer, language: CvLanguage): CvDraft {
  const base = structuredClone(loadCvDraft(language));
  // Use evidence across the CV master and the verified portfolio, not only two fixed projects.
  const selection = projectSelectionForOffer(offer, language);
  base.projects = selection.map(item => ({ ...item.project, bullets: [...item.project.bullets] }));
  const relevant = normalized([offer.title, offer.specialization, offer.domain, ...offer.skills].filter(Boolean).join(' '));
  const keywords = ['computer vision', 'image', 'segmentation', 'deep learning', 'machine learning', 'python', 'signal', 'data', 'quality', 'automatisation', 'reconstruction', 'calibration'];
  const focusTerms = keywords.filter(word => relevant.includes(word)).slice(0, 3);
  const lines = base.skills.split('\n').filter(Boolean);
  const score = (line: string) => focusTerms.filter(term => normalized(line).includes(term)).length;
  base.skills = [...lines].sort((a, b) => score(b) - score(a)).join('\n');
  const theme = focusTerms.length ? focusTerms.join(', ') : 'data science et intelligence artificielle';
  base.summary = language === 'FR'
    ? 'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Je souhaite contribuer chez ' + offer.company + ' aux missions de ' + theme + ' en m’appuyant sur mes projets et ma rigueur.'
    : 'Final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a six-month internship from February 2027. I would like to contribute to ' + theme + ' projects at ' + offer.company + ', drawing on my academic projects and careful approach to evaluation.';
  return base;
}

export function recipientForOffer(offer: InternshipOffer, language: CvLanguage) {
  const company = normalized(offer.company);
  const title = normalized(offer.title);
  const location = offer.city || '';
  // Only use a named person if independently verified for the specific vacancy.
  // A role or team is a contextual addressee, not a claim that a named manager was found.
  if (company.includes('alten') && (title.includes('innovation') || title.includes('computer vision'))) {
    return language === 'FR'
      ? { recipientName: '', recipientRole: 'À l’attention du service recrutement des ALTEN Labs', team: 'Direction de l’Innovation — ALTEN Labs', recipientLocation: location }
      : { recipientName: '', recipientRole: 'ALTEN Labs Recruitment', team: 'Innovation Division — ALTEN Labs', recipientLocation: location };
  }
  if (title.includes('recherche') || title.includes('r&d') || title.includes('research')) {
    return language === 'FR'
      ? { recipientName: '', recipientRole: 'À l’attention du recrutement R&D', team: 'Équipe de recherche et développement', recipientLocation: location }
      : { recipientName: '', recipientRole: 'R&D Recruitment', team: 'Research & Development', recipientLocation: location };
  }
  return language === 'FR'
    ? { recipientName: '', recipientRole: 'À l’attention du service recrutement', team: '', recipientLocation: location }
    : { recipientName: '', recipientRole: 'Talent Acquisition Team', team: '', recipientLocation: location };
}

export function tailorLetterForOffer(offer: InternshipOffer, language: CvLanguage): CoverLetterDraft {
  const stored = loadCoverLetter();
  const terms = focus(offer);
  const f = terms.slice(0, 3);
  const subject = offer.title;
  const company = offer.company;
  const recipient = recipientForOffer(offer, language);
  const skills = offer.skills.slice(0, 4).join(', ');
  const draft: CoverLetterDraft = {
    ...structuredClone(stored), language, company, internshipTitle: subject,
    ...recipient,
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
  const proofProjects = projectSelectionForOffer(offer, language).slice(0, 2).map(item => item.project.name).join(' et ');
  if (language === 'FR') {
    draft.paragraphs = [
      'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je souhaite vous proposer ma candidature au poste de « ' + subject + ' ». Je recherche un stage de fin d’études de six mois à partir de février 2027.',
      'Cette mission chez ' + company + ' m’intéresse notamment pour ses dimensions ' + (f.length ? f.join(', ') : 'techniques et appliquées') + '. Je souhaite découvrir les problématiques de votre équipe et contribuer à des réalisations concrètes.',
      'Ma formation m’apporte des bases en programmation Python, machine learning et traitement du signal et de l’image. Mes projets, notamment ' + proofProjects + ', m’ont appris à comparer des méthodes, analyser les erreurs et présenter des résultats vérifiables.' + (skills ? ' Les compétences mentionnées dans votre offre, notamment ' + skills + ', correspondent aux domaines que je souhaite approfondir.' : '') + ' Je pourrais ainsi apporter une approche rigoureuse, de la curiosité et une réelle envie d’apprendre.',
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
