import type { InternshipOffer } from '../../api/contract';
import { loadCvDraft, type CvDraft, type CvLanguage } from '../cv/cvStorage';
import { loadCoverLetter, type CoverLetterDraft } from '../cl/clStorage';
import { publicProjectCatalog } from './publicProjectCatalog';

const normalized = (value: string) => value.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const relevantTerms = ['computer vision', 'vision', 'image', 'signal', 'audio', 'machine learning', 'deep learning', 'data science', 'data', 'python', 'ai', 'intelligence artificielle', 'automation', 'automatisation', 'qualite', 'quality', 'optimisation', 'optimization', 'research', 'r&d', 'pytorch', 'opencv'];

function focus(offer: InternshipOffer): string[] {
  const text = normalized([offer.title, offer.specialization, offer.domain, ...offer.skills].filter(Boolean).join(' '));
  return relevantTerms.filter((term) => text.includes(term)).slice(0, 5);
}

// Rank verified public GitHub evidence, supplemented by user-added CV projects.
// The title and stated skill requirements outweigh unrelated generic terms.
const isAlstomVision = (offer: InternshipOffer) => offer.id === '789' || (/alstom/i.test(offer.company) && /inspections automatis/i.test(offer.title));

function alstomProjects(language: CvLanguage) {
  const fr = language === 'FR';
  const projects = fr ? [
    { id: 'background', name: "Background Subtraction — Traitement d'images fluoroscopiques", period: 'Avril 2026', bullets: [
      'Développé un pipeline de soustraction de fond combinant lissage, normalisation et filtrage de Fourier.',
      'Comparé des méthodes de segmentation : seuil fixe, Otsu et EM/GMM.',
      'Évalué les résultats avec MSE, PSNR, Dice et IoU.',
      'Généré des visualisations et métriques pour comparer et valider les méthodes.' ] },
    { id: 'portfolio-vision', name: 'Portfolio Computer Vision & Image Processing', period: 'Sept. 2025 – Juin 2026', bullets: [
      "Réalisé des travaux pratiques en traitement d'images, segmentation et calibration caméra.",
      "Implémenté des méthodes de suivi de points et d'analyse d'images.",
      'Comparé les méthodes à l’aide de mesures quantitatives et de diagnostics visuels.',
      'Structuré les notebooks et les résultats pour faciliter la reproduction des expériences.' ] }
  ] : [
    { id: 'background', name: 'Background Subtraction — Fluoroscopic Image Processing', period: 'April 2026', bullets: [
      'Built a background subtraction pipeline combining smoothing, normalization and Fourier filtering.',
      'Compared fixed thresholding, Otsu and EM/GMM segmentation methods.',
      'Evaluated results using MSE, PSNR, Dice and IoU.',
      'Generated visual comparisons and metrics to validate each method.' ] },
    { id: 'portfolio-vision', name: 'Computer Vision & Image Processing Portfolio', period: 'Sep. 2025 – Jun. 2026', bullets: [
      'Completed image processing, segmentation and camera calibration practical work.',
      'Implemented feature tracking and image-analysis methods.',
      'Compared methods using quantitative measurements and visual diagnostics.',
      'Organized notebooks and outputs to make experiments reproducible.' ] }
  ];
  return projects.map(project => ({ project, score: 100, sourceUrl: '', reason: project.name + (fr ? ' : inspection et vision' : ' : inspection and vision') }));
}
export function projectSelectionForOffer(offer: InternshipOffer, language: CvLanguage) {
  if (isAlstomVision(offer)) return alstomProjects(language);
  const current = loadCvDraft(language).projects;
  const verifiedIds = new Set(publicProjectCatalog.map(entry => entry.id));
  const profiles = [
    ...publicProjectCatalog.map(entry => ({ project: entry.cv[language], tags: entry.tags, url: entry.url })),
    ...current.filter(project => !verifiedIds.has(project.id) && project.bullets.filter(Boolean).length >= 4).map(project => ({
      project, tags: normalized([project.name, ...project.bullets].join(' ')).split(/[^a-z0-9]+/).filter(x => x.length > 3),
      url: '',
    })),
  ];
  const priority = normalized(offer.title + ' ' + (offer.specialization || ''));
  const requirements = normalized([offer.domain, ...offer.skills].filter(Boolean).join(' '));
  const broad = normalized(offer.relevance || '');
  const common = new Set(['data', 'python', 'image', 'machine', 'learning', 'model', 'classification', 'analysis', 'processing', 'evaluation', 'research', 'computer', 'vision']);
  const matchesText = (term: string, text: string) => {
    if (term.length < 3) return false;
    // Avoid matching short fragments inside unrelated words.
    return text.split(/[^a-z0-9]+/).some(word => word === term || (term.length > 5 && word.startsWith(term)));
  };
  const unique = new Set<string>();
  const ranked = profiles.map(entry => {
    const matched = [...new Set(entry.tags)].filter(t => !common.has(t));
    const titleMatches = matched.filter(t => matchesText(t, priority));
    const skillMatches = matched.filter(t => matchesText(t, requirements));
    const contextMatches = matched.filter(t => matchesText(t, broad));
    const genericMatches = entry.tags.filter(t => common.has(t) && (matchesText(t, priority) || matchesText(t, requirements)));
    const score = titleMatches.length * 12 + skillMatches.length * 7 + contextMatches.length * 2 + genericMatches.length;
    const reasons = [...new Set([...titleMatches, ...skillMatches, ...genericMatches])].slice(0, 4);
    return { project: { ...entry.project, bullets: [...entry.project.bullets] }, score,
      sourceUrl: entry.url, reason: entry.project.name + ' : ' + (reasons.join(', ') || (language === 'FR' ? 'compétences transversales' : 'transferable skills')) };
  }).sort((a,b) => b.score - a.score || a.project.name.localeCompare(b.project.name));
  return ranked.filter(entry => {
    const name = normalized(entry.project.name);
    if (unique.has(name)) return false;
    unique.add(name);
    return true;
  }).slice(0, 2);
}

export function tailorCvForOffer(offer: InternshipOffer, language: CvLanguage): CvDraft {
  const base = structuredClone(loadCvDraft(language));
  if (isAlstomVision(offer)) {
    base.headline = 'Computer Vision | Image Processing | Python | Software Development';
    base.summary = language === 'FR'
      ? 'Étudiant en dernière année de MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de six mois dès février 2027 pour contribuer à des projets de vision par ordinateur, d’inspection automatisée et de maintenance ferroviaire.'
      : 'Final-year MSc Control and Robotics student at Centrale Nantes, specializing in Data Science, Signal & Image Processing, seeking a six-month internship from February 2027 in computer vision, automated inspection and railway maintenance.';
    base.projects = alstomProjects(language).map(item => item.project);
    const skills = language === 'FR' ? [
      '**Programmation :** Python, NumPy, pandas, SciPy, SQL',
      '**Computer Vision & Image Processing :** OpenCV, segmentation, calibration caméra, suivi de points',
      '**Machine Learning :** scikit-learn, PyTorch, classification, évaluation de modèles',
      '**Développement logiciel :** React, TypeScript, Git, GitHub',
      '**Outils :** Jupyter, MATLAB, Matplotlib, Linux'
    ] : [
      '**Programming:** Python, NumPy, pandas, SciPy, SQL',
      '**Computer Vision & Image Processing:** OpenCV, segmentation, camera calibration, feature tracking',
      '**Machine Learning:** scikit-learn, PyTorch, classification, model evaluation',
      '**Software Development:** React, TypeScript, Git, GitHub',
      '**Tools:** Jupyter, MATLAB, Matplotlib, Linux'
    ];
    base.skills = skills.join('\\n');
    return base;
  }

  // Use evidence across the CV master and the verified portfolio, not only two fixed projects.
  const selection = projectSelectionForOffer(offer, language);
  base.projects = selection.map(item => ({ ...item.project, bullets: item.project.bullets.filter(Boolean).slice(0, 4) }));
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
  if (isAlstomVision(offer)) {
    draft.paragraphs = language === 'FR' ? [
      'Actuellement en dernière année de MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois à partir de février 2027. Votre offre en Computer Vision et inspections automatisées a retenu mon attention, car elle associe mes compétences en traitement d’images à des applications concrètes dans le ferroviaire.',
      'Utiliser la vision par ordinateur pour améliorer les inspections des trains et infrastructures correspond à mes centres d’intérêt. Je suis motivé par la possibilité de contribuer à la fiabilité d’un outil utilisé sur le terrain, tout en comprenant les besoins des équipes de maintenance. La collaboration entre développement, évaluation et utilisateurs m’intéresse particulièrement.',
      'Après un BSc en informatique et électronique, j’ai approfondi le Machine Learning et le traitement d’images à Centrale Nantes. Mes projets portent notamment sur la segmentation, la calibration caméra, le suivi de points et l’évaluation quantitative des résultats. J’ai également développé des applications avec Python et des technologies web. Ces expériences m’ont appris à tester différentes approches et à documenter les résultats.',
      'Motivé et désireux d’apprendre auprès de votre équipe, je serais heureux de contribuer à ce projet d’inspection automatisée. Je reste disponible pour un entretien afin d’échanger sur vos attentes et sur les contributions que je pourrais apporter.'
    ] : [
      'I am a final-year MSc Control and Robotics student specializing in Data Science, Signal & Image Processing at Centrale Nantes, seeking a six-month internship from February 2027. Your computer vision and automated inspection internship connects image processing with practical railway applications.',
      'I am interested in using computer vision to improve the inspection of trains and infrastructure. Contributing to a tool used by maintenance teams, understanding their requirements and evaluating its reliability would be especially motivating.',
      'Following a BSc in Computer Science and Electronics, I have developed skills in machine learning and image processing at Centrale Nantes. My projects involve segmentation, camera calibration, feature tracking and quantitative evaluation. I have also built software applications using Python and web technologies.',
      'I would welcome an opportunity to learn from your team and contribute to this automated inspection project. I would be pleased to discuss how my background and motivation could support your work.'
    ];
    draft.closing = language === 'FR' ? 'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.' : 'Yours sincerely,';
    return draft;
  }
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
