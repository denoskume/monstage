import type { CvLanguage } from '../cv/cvStorage';
import { loadCvDraft, freshCvDraft } from '../cv/cvStorage';
import { freshCoverLetter } from '../cl/clStorage';
import { publicProjectCatalog } from './publicProjectCatalog';
import { loadApplicationDossier, saveApplicationDossier } from './applicationDossiers';

export const SAFRAN_AI_DOSSIER_ID = 'spontaneous:safran-ai:paris';
const safSummary = {
  FR: 'En dernière année du MSc Data Science, Signal and Image Processing à Centrale Nantes, je recherche un stage de six mois dès février 2027 en Machine Learning et Computer Vision.',
  EN: 'Final-year MSc Data Science, Signal and Image Processing student at Centrale Nantes, seeking a six-month Machine Learning and Computer Vision internship from February 2027.',
};
const educationDescriptionUpdates: Record<CvLanguage, Record<string, { previous: string; next: string }>> = {
  FR: {
    ecn: { previous: 'Formation centrée sur des méthodes avancées en data science, machine learning, optimisation, traitement du signal et de l’image, avec mise en œuvre sur des problèmes concrets.', next: 'Mise en pratique du machine learning, de l’optimisation et du traitement d’images dans des travaux en Python et MATLAB, notamment en segmentation, filtrage et analyse de données.' },
    kju: { previous: 'Double cursus combinant programmation, développement logiciel et analyse de données avec électronique numérique, systèmes de communication et technologies embarquées.', next: 'Formation pluridisciplinaire en informatique et électronique, avec des bases en programmation, développement logiciel, analyse de données, électronique numérique et systèmes embarqués.' },
  },
  EN: {},
};
// Update only untouched default descriptions; preserve edits made in Studio.
function refreshEducationDescriptions<T extends import('../cv/cvStorage').CvDraft>(cv: T): T {
  return {
    ...cv,
    education: cv.education.map(item => {
      const update = educationDescriptionUpdates[cv.language][item.id];
      if (!update) return item;
      // A saved BSc includes a separate leadership line. Migrate its original
      // curriculum description without removing the user's university activity.
      const lines = item.details.split('\n');
      if (lines[0]?.replace(/'/g, '’') !== update.previous) return item;
      return { ...item, details: [update.next, ...lines.slice(1)].join('\n') };
    }),
  };
}
const projectBulletCorrections: Record<string, string> = {
  'Calculé les embeddings audio et texte avec LAION-CLAP, puis classé les classes par similarité cosinus.': 'Calculé les représentations audio et texte avec LAION-CLAP, puis classé les catégories selon leur similarité cosinus.',
  'Développé des masques à partir du seuillage et du modèle de mélange gaussien sur les séquences fluoroscopiques.': 'Généré des masques de segmentation par seuillage et mélange gaussien sur des séquences fluoroscopiques.',
};
function polishKnownProjectBullets<T extends import('../cv/cvStorage').CvDraft>(cv: T): T {
  return { ...cv, projects: cv.projects.map(project => ({
    ...project,
    bullets: project.bullets.map(bullet => projectBulletCorrections[bullet] ?? bullet),
  })) };
}
const safSkills = {
  FR: 'Python & données : Python, NumPy, pandas, SciPy, Jupyter, Matplotlib\nMachine Learning : scikit-learn, PyTorch, classification, évaluation de modèles\nVision & signal : OpenCV, scikit-image, segmentation, filtrage spatial/fréquentiel\nOutils : Git, GitHub, Linux, VS Code',
  EN: 'Python & data: Python, NumPy, pandas, SciPy, Jupyter, Matplotlib\nMachine Learning: scikit-learn, PyTorch, classification, model evaluation\nVision & signals: OpenCV, scikit-image, segmentation, spatial/frequency filtering\nTools: Git, GitHub, Linux, VS Code',
};
// Keep university student leadership attached to the university where it took place.
const bachelorLeadership = {
  FR: 'Activité associative : Secrétaire, International Students Forum (2022–2024) — coordination d’activités culturelles et accueil de plus de 100 étudiants internationaux.',
  EN: 'Student leadership: Secretary, International Students Forum (2022–2024) — helped coordinate cultural events and welcome over 100 international students.',
};
function attachBachelorLeadership<T extends import('../cv/cvStorage').CvDraft>(cv: T): T {
  const next = structuredClone(cv);
  const note = bachelorLeadership[next.language];
  next.education = next.education.map(item => {
    if (item.id !== 'kju') return item;
    const details = item.details.replace(/(?:Activité associative :|Student leadership:)[^\n]*/g, '').trim();
    return {...item, details: [details, note].filter(Boolean).join('\n')};
  });
  next.leadership = [];
  next.sectionOrder = next.sectionOrder.filter(section => section !== 'leadership');
  return next;
}
// Restore the fourth, already verified master-CV point for each experience.
function fourExperienceBullets<T extends import('../cv/cvStorage').CvDraft>(cv: T): T {
  const reference = freshCvDraft(cv.language);
  return {
    ...cv,
    experience: cv.experience.map(item => {
      const original = reference.experience.find(entry => entry.id === item.id);
      const bullets = item.bullets.filter(Boolean).slice(0, 4);
      if (bullets.length === 3 && original?.bullets[3]) bullets.push(original.bullets[3]);
      return {...item, bullets};
    }),
  };
}
function optimizeSafranCv<T extends import('../cv/cvStorage').CvDraft>(cv: T): T {
  const next = structuredClone(cv);
  next.education = next.education.map(item => item.id === 'kju' && item.period === '2021–2024' ? {...item, period:'2021–2025'} : item);
  next.experience = fourExperienceBullets(next).experience;
  next.sectionOrder = ['education','projects','experience','skills','languages','interests'];
  next.leadership = next.leadership.map(item => ({...item, bullets:item.bullets.slice(0,2)}));
  return attachBachelorLeadership(refreshEducationDescriptions(next));
}
export function prepareSafranAiDossier(language: CvLanguage = 'FR') {
  const existing = loadApplicationDossier(SAFRAN_AI_DOSSIER_ID,language);
  if (existing) {
    const letter = {...existing.letter};
    // Refresh only an unchanged, previously generated opening paragraph.
    const standardOpening = language === 'FR' ? 'Actuellement étudiant en dernière année du MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois à partir de février 2027.' : 'I am a final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a six-month internship from February 2027';
    if (letter.paragraphs?.[0]?.startsWith(standardOpening)) letter.paragraphs = [language === 'FR' ? 'Après un BSc en Computer Science & Electronics à Bengaluru, en Inde, je poursuis mon parcours en France en dernière année du MSc Data Science, Signal & Image Processing à Centrale Nantes. Je recherche un stage de six mois dès février 2027 en Machine Learning et Computer Vision. Ce parcours entre deux environnements universitaires m’a appris à m’adapter à de nouvelles méthodes.' : 'After a BSc in Computer Science & Electronics in Bengaluru, India, I continued my studies in France and am now a final-year MSc student at Centrale Nantes. I seek a six-month internship from February 2027 in Machine Learning and Computer Vision. Studying in two countries has helped me adapt to new academic environments.', ...letter.paragraphs.slice(1)];
    // Update only known generated text, without replacing a user-written opening.
    const priorOpening = language === 'FR'
      ? 'Après un BSc en Computer Science & Electronics à Bengaluru, en Inde, je poursuis mon parcours en France en dernière année du MSc Data Science, Signal & Image Processing à Centrale Nantes. Je recherche un stage de six mois dès février 2027 en Machine Learning et Computer Vision. Ce parcours entre deux environnements universitaires m’a appris à m’adapter à de nouvelles méthodes.'
      : 'After a BSc in Computer Science & Electronics in Bengaluru, India, I continued my studies in France and am now a final-year MSc student at Centrale Nantes. I seek a six-month internship from February 2027 in Machine Learning and Computer Vision. Studying in two countries has helped me adapt to new academic environments.';
    if (letter.paragraphs?.[0] === priorOpening) {
      letter.paragraphs = [
        language === 'FR'
          ? 'Actuellement en dernière année du MSc Data Science, Signal and Image Processing à Centrale Nantes, je recherche un stage de six mois dès février 2027. Mon parcours universitaire entre l’Inde et la France m’a apporté de solides bases scientifiques et une capacité d’adaptation. Je souhaite mettre ces acquis en pratique chez Safran.AI.'
          : 'I am in my final year of the MSc Data Science, Signal and Image Processing at Centrale Nantes and seeking a six-month internship from February 2027. Studying in India and France has strengthened my technical foundations and helped me adapt to new environments. I would like to put those skills to use at Safran.AI.',
        ...letter.paragraphs.slice(1),
      ];
    }
    if (/équipe souhaitée, non confirmée/.test(letter.team)) letter.team = '';
    if (/Candidatur spontanée/.test(letter.internshipTitle)) letter.internshipTitle = letter.internshipTitle.replace('Candidatur spontanée','Candidature spontanée');
    const evidence = language === 'FR' ? 'Anglais — C1 (plus de 4 ans d’études universitaires)' : 'English — C1 (over 4 years of university studies)';
    const languages = existing.cv.languages.replace(/Anglais — C1(?: \([^)]*\))?|English — C1(?: \([^)]*\))?/, evidence);
    const priorSummary = existing.cv.summary;
    const newSummary = /Je souhaite contribuer à des projets d’IA appliquée|I hope to contribute to applied AI projects|Étudiant en dernière année de MSc à Centrale Nantes|Après un BSc en Computer Science & Electronics|Following a BSc in Computer Science & Electronics/.test(priorSummary) ? safSummary[language] : priorSummary;
    const priorSkills = existing.cv.skills;
    const newSkills = /Automatisation & Outils|Engineering Tools|Computer Vision & Traitement d’image/.test(priorSkills) ? safSkills[language] : priorSkills;
    const experience = fourExperienceBullets(existing.cv).experience;
    const leadership = existing.cv.leadership.map(item => ({...item,bullets:item.bullets.slice(0,2)}));
    const education = existing.cv.education.map(item => item.id === 'kju' && item.period === '2021–2024' ? {...item,period:'2021–2025'} : item);
    const adjustedCv = polishKnownProjectBullets(attachBachelorLeadership(refreshEducationDescriptions({...existing.cv, education, leadership})));
    if (existing.cv.email !== 'kamenan.kume@eleves.ec-nantes.fr' || languages !== existing.cv.languages || adjustedCv.education.some((e,i)=>e.period!==existing.cv.education[i].period || e.details!==existing.cv.education[i].details) || adjustedCv.projects.some((p,i)=>p.bullets.some((bullet,j)=>bullet!==existing.cv.projects[i]?.bullets[j])) || existing.cv.leadership.length > 0 || existing.cv.sectionOrder.includes('leadership') || newSummary !== priorSummary || newSkills !== priorSkills || experience.some((e,i)=>e.bullets.length!==existing.cv.experience[i].bullets.length) || leadership.some((e,i)=>e.bullets.length!==existing.cv.leadership[i].bullets.length) || letter.team !== existing.letter.team || letter.internshipTitle !== existing.letter.internshipTitle || letter.paragraphs !== existing.letter.paragraphs) {
      const updated = {...existing,cv:{...adjustedCv,email:'kamenan.kume@eleves.ec-nantes.fr',languages,summary:newSummary,skills:newSkills,experience},letter};
      saveApplicationDossier(updated);
      return updated;
    }
    return existing;
  }
  const cv = optimizeSafranCv(structuredClone(loadCvDraft(language)));
  cv.email = 'kamenan.kume@eleves.ec-nantes.fr';
  cv.languages = language === 'FR' ? 'Français — Langue maternelle | Anglais — C1 (plus de 4 ans d’études universitaires)' : 'French — Native | English — C1 (over 4 years of university studies)';
  const chosen = ['background','clap'].map(id => publicProjectCatalog.find(item => item.id === id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  cv.projects = chosen.map(x => ({...x.cv[language], bullets: [...x.cv[language].bullets].slice(0,4)}));
  cv.headline = language === 'FR' ? 'Stage de fin d’études — Machine Learning & Computer Vision' : 'End-of-studies internship — Machine Learning & Computer Vision';
  cv.summary = safSummary[language];
  cv.skills = safSkills[language];
  cv.projects = cv.projects.map(project => ({...project, bullets:project.bullets.slice(0,4)}));
  cv.experience = fourExperienceBullets(cv).experience;
  const finalizedCv = polishKnownProjectBullets(attachBachelorLeadership(cv));
  const letter = freshCoverLetter(language);
  letter.company = 'Safran.AI';
  letter.team = '';
  letter.recipientRole = language === 'FR' ? 'À l’attention de l’équipe recrutement' : 'Recruitment Team';
  letter.recipientLocation = 'Paris, France';
  letter.internshipTitle = language === 'FR' ? 'Candidature spontanée — Stage de fin d’études Machine Learning & Computer Vision (février 2027)' : 'Spontaneous application — Machine Learning & Computer Vision Internship (February 2027, six months)';
  letter.date = new Date().toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-GB', {day:'numeric',month:'long',year:'numeric'});
  letter.paragraphs = language === 'FR' ? [
    'Actuellement en dernière année du MSc Data Science, Signal and Image Processing à Centrale Nantes, je recherche un stage de six mois dès février 2027. Mon parcours universitaire entre l’Inde et la France m’a apporté de solides bases scientifiques et une capacité d’adaptation. Je souhaite mettre ces acquis en pratique chez Safran.AI.',
    'Vos travaux en analyse d’images et de signaux ont retenu mon attention. Ils rejoignent mes intérêts pour la vision par ordinateur et l’apprentissage automatique. Je souhaite découvrir vos méthodes et contribuer à des projets répondant à des besoins concrets.',
    'Mes projets m’ont appris à expérimenter, comparer des méthodes et analyser leurs limites. J’ai notamment travaillé sur la segmentation d’images fluoroscopiques. Avec LAION-CLAP, j’ai fait progresser la précision Top-1 de 83,05 % à 91,15 % en comparant dix stratégies de prompts sur 2 000 extraits, sans réentraîner le modèle. Je souhaite apporter cette rigueur à votre équipe tout en continuant à apprendre.',
    'Je serais heureux d’échanger sur les besoins de votre équipe. Je pourrais vous présenter ma démarche à travers ces projets et discuter de la contribution que je pourrais apporter pendant ce stage.'
  ] : [
    'I am in my final year of the MSc Data Science, Signal and Image Processing at Centrale Nantes and seeking a six-month internship from February 2027. Studying in India and France has strengthened my technical foundations and helped me adapt to new environments. I would like to put those skills to use at Safran.AI.',
    'Your work in image and signal analysis caught my attention. It connects closely with my interests in computer vision and machine learning. I would like to learn your methods and contribute to practical projects.',
    'My projects have taught me to test ideas, compare methods and examine their limits. I have worked on fluoroscopy image segmentation. With LAION-CLAP, I raised Top-1 accuracy from 83.05% to 91.15% by comparing ten prompt strategies on 2,000 audio clips, without retraining the model. I hope to bring this careful approach to your team while continuing to learn.',
    'I would welcome a conversation about your team’s needs. I could walk you through my projects and discuss how I might contribute during the internship.'
  ];
  const dossier = {offerId:SAFRAN_AI_DOSSIER_ID,company:'Safran.AI',title:letter.internshipTitle,language,cv:finalizedCv,letter,selectionReasons:chosen.map(x=>x.cv[language].name),state:'awaiting_review' as const,preparedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  saveApplicationDossier(dossier);
  return dossier;
}
