import type { CvLanguage } from '../cv/cvStorage';
import { loadCvDraft } from '../cv/cvStorage';
import { freshCoverLetter } from '../cl/clStorage';
import { publicProjectCatalog } from './publicProjectCatalog';
import { loadApplicationDossier, saveApplicationDossier } from './applicationDossiers';

export const SAFRAN_AI_DOSSIER_ID = 'spontaneous:safran-ai:paris';
const safSummary = {
  FR: 'Étudiant en dernière année de MSc à Centrale Nantes, je recherche un stage de 6 mois dès février 2027 en Machine Learning et Computer Vision. Projets en segmentation d’images et évaluation de modèles audio.',
  EN: 'Final-year MSc student at Centrale Nantes seeking a six-month Machine Learning and Computer Vision internship from February 2027. Projects in image segmentation and audio model evaluation.',
};
const safSkills = {
  FR: 'Python & données : Python, NumPy, pandas, SciPy, Jupyter, Matplotlib\\nMachine Learning : scikit-learn, PyTorch, classification, évaluation de modèles\\nVision & signal : OpenCV, scikit-image, segmentation, filtrage spatial/fréquentiel\\nOutils : Git, GitHub, Linux, VS Code',
  EN: 'Python & data: Python, NumPy, pandas, SciPy, Jupyter, Matplotlib\\nMachine Learning: scikit-learn, PyTorch, classification, model evaluation\\nVision & signals: OpenCV, scikit-image, segmentation, spatial/frequency filtering\\nTools: Git, GitHub, Linux, VS Code',
};
function optimizeSafranCv<T extends import('../cv/cvStorage').CvDraft>(cv: T, language: CvLanguage): T {
  const next = structuredClone(cv);
  next.education = next.education.map(item => item.id === 'kju' && item.period === '2021–2024' ? {...item, period:'2021–2025'} : item);
  next.experience = next.experience.map(item => ({...item, bullets:item.bullets.slice(0,3)}));
  next.sectionOrder = ['education','projects','experience','skills','languages','leadership','interests'];
  next.leadership = next.leadership.map(item => ({...item, bullets:item.bullets.slice(0,2)}));
  return next;
}
export function prepareSafranAiDossier(language: CvLanguage = 'FR') {
  const existing = loadApplicationDossier(SAFRAN_AI_DOSSIER_ID,language);
  if (existing) {
    const evidence = language === 'FR' ? 'Anglais — C1 (plus de 4 ans d’études universitaires)' : 'English — C1 (over 4 years of university studies)';
    const languages = existing.cv.languages.replace(/Anglais — C1(?: \([^)]*\))?|English — C1(?: \([^)]*\))?/, evidence);
    const education = existing.cv.education.map(item => item.id === 'kju' && item.period === '2021–2024' ? {...item,period:'2021–2025'} : item);
    if (existing.cv.email !== 'kamenan.kume@eleves.ec-nantes.fr' || languages !== existing.cv.languages || education.some((e,i)=>e.period!==existing.cv.education[i].period)) {
      const updated = {...existing,cv:{...existing.cv,email:'kamenan.kume@eleves.ec-nantes.fr',languages,education}};
      saveApplicationDossier(updated);
      return updated;
    }
    return existing;
  }
  const cv = optimizeSafranCv(structuredClone(loadCvDraft(language)), language);
  cv.email = 'kamenan.kume@eleves.ec-nantes.fr';
  cv.languages = language === 'FR' ? 'Français — Langue maternelle | Anglais — C1 (plus de 4 ans d’études universitaires)' : 'French — Native | English — C1 (over 4 years of university studies)';
  const chosen = ['background','clap'].map(id => publicProjectCatalog.find(item => item.id === id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  cv.projects = chosen.map(x => ({...x.cv[language], bullets: [...x.cv[language].bullets].slice(0,4)}));
  cv.headline = language === 'FR' ? 'Stage de fin d’études — Machine Learning & Computer Vision' : 'End-of-studies internship — Machine Learning & Computer Vision';
  cv.summary = safSummary[language];
  cv.skills = safSkills[language];
  cv.projects = cv.projects.map(project => ({...project, bullets:project.bullets.slice(0,4)}));
  cv.experience = cv.experience.map(item => ({...item, bullets:item.bullets.slice(0,3)}));
  const letter = freshCoverLetter(language);
  letter.company = 'Safran.AI';
  letter.team = 'AI Production / Computer Vision (équipe souhaitée, non confirmée)';
  letter.recipientRole = language === 'FR' ? 'À l’attention de l’équipe recrutement' : 'Recruitment Team';
  letter.recipientLocation = 'Paris, France';
  letter.internshipTitle = language === 'FR' ? 'Candidature spontanée — Stage Machine Learning & Computer Vision (6 mois, février 2027)' : 'Spontaneous application — Machine Learning & Computer Vision Internship (February 2027, six months)';
  letter.date = new Date().toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-GB', {day:'numeric',month:'long',year:'numeric'});
  letter.paragraphs = language === 'FR' ? [
    'Actuellement étudiant en dernière année du MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois à partir de février 2027. Je souhaite rejoindre une équipe travaillant sur des applications concrètes du Machine Learning et de la Computer Vision.',
    'Les activités de Safran.AI en analyse d’images et de signaux retiennent particulièrement mon attention. Je souhaite comprendre comment des modèles sont développés, évalués et utilisés pour répondre à des besoins techniques réels.',
    'Ma formation m’a apporté des bases en Python, traitement d’images et apprentissage automatique. Dans un projet de soustraction de fond sur des images fluoroscopiques, j’ai comparé plusieurs méthodes de segmentation à l’aide de métriques adaptées. J’ai également évalué un modèle de classification audio zero-shot sur 2 000 extraits et 50 classes ; l’optimisation des descriptions textuelles a fait progresser la précision Top-1 de 83,05 % à 91,15 %, sans réentraînement du modèle.',
    'Je serais heureux de mettre ma rigueur, ma curiosité et mon envie d’apprendre au service de vos équipes. Je me tiens à votre disposition pour échanger sur les besoins auxquels un stagiaire pourrait contribuer.'
  ] : [
    'I am a final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a six-month internship from February 2027 focused on Machine Learning and Computer Vision.',
    'Safran.AI interests me because of its work on image and signal analysis. I would like to understand how models are developed and carefully evaluated for practical applications.',
    'My studies have given me foundations in Python, image processing and machine learning. In a fluoroscopy project, I compared segmentation methods using evaluation metrics. In a zero-shot audio classification project involving 2,000 clips and 50 classes, I improved Top-1 accuracy from 83.05% to 91.15% through text-prompt optimisation without retraining.',
    'I would welcome the opportunity to contribute with curiosity and care while learning from your engineers, and to discuss how my background might support your team.'
  ];
  const dossier = {offerId:SAFRAN_AI_DOSSIER_ID,company:'Safran.AI',title:letter.internshipTitle,language,cv,letter,selectionReasons:chosen.map(x=>x.cv[language].name),state:'awaiting_review' as const,preparedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  saveApplicationDossier(dossier);
  return dossier;
}
