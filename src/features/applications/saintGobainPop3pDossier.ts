import type { InternshipOffer } from '../../api/contract';
import { defaultCvEn, defaultCvFr, freshPlanBCvDraft, type CvDraft, type CvLanguage } from '../cv/cvStorage';
import { freshCoverLetter, type CoverLetterDraft } from '../cl/clStorage';
import { selectedCertifications } from '../cv/cvEvidenceCatalog';

// A separately reviewed, offer-specific package for the POP3P Data Analyst
// internship in Nantes. Do not modify either generic Plan A/B resume.
export const SG_POP3P_ID = 'SG-FRA40880';
export const SG_POP3P_TITLE = 'Data Analyst (H/F)';

export function isSaintGobainPop3pOffer(offer: Pick<InternshipOffer, 'id' | 'company' | 'title' | 'city' | 'applicationUrl'>): boolean {
  return offer.id === SG_POP3P_ID ||
    (/saint[ -]gobain/i.test(offer.company) &&
      /data analyst/i.test(offer.title) &&
      /nantes/i.test(offer.city || '') &&
      /329924/.test(offer.applicationUrl || ''));
}

export function buildSaintGobainPop3pCv(language: CvLanguage = 'FR'): CvDraft {
  const fr = language === 'FR';
  const base = structuredClone(freshPlanBCvDraft(language));
  base.name = 'Denos KUME';
  base.plan = 'B';
  base.template = 'modern';
  base.pageColor = 'white';
  base.summaryHeading = 'profile';
  base.showMissionLabels = false;
  base.academicHeadline = 'Master 2 Control and Robotics - Data Science, Signal & Image Processing';
  base.headline = fr
    ? 'Data Analytics | SQL & Python | Streamlit & Tableaux de bord'
    : 'Data Analytics | SQL & Python | Streamlit & Dashboards';
  base.summary = fr
    ? "Étudiant en dernière année de MSc à Centrale Nantes, j'ai développé MonStage, une plateforme combinant collecte de données, contrôles de qualité, tableaux de bord et gestion sécurisée des accès. Je souhaite contribuer à l'application Streamlit de POP3P pour le suivi du matériel roulant, dans le cadre d'un stage de six mois dès février 2027."
    : "Final-year MSc student at Centrale Nantes, I built MonStage, a platform combining data ingestion, quality checks, dashboards and secured access. I would like to contribute to POP3P's Streamlit application for fleet equipment monitoring through a six-month internship starting in February 2027.";
  base.education = [
    {
      id: 'ecn',
      school: 'Centrale Nantes - Master of Science in Control and Robotics',
      degree: 'Parcours : Data Science, Signal & Image Processing',
      location: 'Nantes, France',
      period: '2025–2027',
      details: fr
        ? "Formation avancée en analyse de données, IA, Machine Learning et traitement du signal et de l'image."
        : 'Advanced training in data analysis, AI, machine learning, and signal and image processing.',
      keyCourses: 'Data Analysis and Information Retrieval · Machine Learning · Artificial Intelligence · Algorithmics and Programming',
    },
    {
      id: 'kju',
      school: 'Kristu Jayanti University - Bachelor of Science, Computer Science & Electronics',
      degree: fr ? 'Parcours : Informatique et Électronique' : 'Computer Science & Electronics',
      location: fr ? 'Bengaluru, Inde' : 'Bengaluru, India',
      period: '2021–2025',
      details: fr
        ? 'Double cursus en informatique et électronique, associant programmation, données et développement logiciel.'
        : 'Dual-major degree covering programming, data, electronics and software engineering.',
      keyCourses: 'Database Management Systems · Data Analysis · Python Programming · Software Engineering',
    },
  ];
  base.experience = fr ? [
    {
      id: 'unified', role: 'Data Analyst Intern', company: 'Unified Mentor Pvt. Ltd.',
      location: 'Bengaluru, Inde', period: 'Sept.–Déc. 2024',
      description: 'Préparation, exploration et restitution de données structurées avec Python.',
      bullets: [
        'Nettoyé et structuré des jeux de données avec pandas et NumPy pour préparer leur exploitation.',
        "Réalisé des analyses exploratoires afin d'identifier tendances, distributions et valeurs atypiques.",
        'Conçu des visualisations Matplotlib et synthétisé les observations pour faciliter leur interprétation.',
      ],
    },
    {
      id: 'rws', role: 'Speech AI Evaluation Specialist', company: 'RWS Moravia',
      location: 'À distance', period: 'Août–Oct. 2026',
      description: "Contrôle de la qualité et de la cohérence des réponses de modèles d'intelligence artificielle.",
      bullets: [
        'Évalué des résultats Speech AI selon des critères définis de pertinence, cohérence et qualité.',
        'Repéré les erreurs récurrentes et les réponses ne respectant pas les critères d’évaluation.',
        'Documenté les décisions à l’aide de justifications factuelles pour garantir leur traçabilité.',
      ],
    },
  ] : structuredClone(defaultCvEn.experience).map(item => ({
    ...item,
    bullets: item.bullets.slice(0, 3),
    period: item.id === 'rws' ? 'Aug–Oct 2026' : item.period,
  }));
  base.projects = fr ? [
    {
      id: 'monstage',
      name: 'MonStage - Plateforme de suivi et de valorisation de données',
      period: '2026–En cours',
      description: 'Application web déployée pour structurer et exploiter des offres multi-sources à travers un tableau de bord.',
      bullets: [
        'Intégration : connecté plusieurs flux API et Google Sheets ; structuré les données et identifié les offres en double.',
        'Indicateurs : créé un tableau de bord et des filtres par entreprise, localisation, date et statut pour prioriser les actions.',
        'Interface : développé une navigation interactive, des fiches détaillées et un espace documentaire par candidature.',
        "Accès et automatisation : intégré l'authentification Google, un proxy sécurisé Cloudflare et des synchronisations Apps Script.",
      ],
    },
  ] : [
    {
      id: 'monstage', name: 'MonStage - Data Intelligence and Application Tracking Platform', period: '2026–Present',
      description: 'Deployed web application for structuring and analyzing multi-source job data via a dashboard.',
      bullets: [
        'Integration: connected API feeds and Google Sheets, structured records and identified duplicate offers.',
        'Dashboards: created interactive filters by company, location, date and application status.',
        'Interface: built intuitive navigation, detailed records and per-application document workspaces.',
        'Security and automation: integrated Google authentication, Cloudflare Worker and Apps Script synchronization.',
      ],
    },
  ];
  base.skills = fr
    ? [
      '**SQL & bases de données :** SQL, jointures, agrégations, sous-requêtes, extraction de données',
      '**Python & analyse :** Python, pandas, NumPy, nettoyage, analyse exploratoire, contrôle de cohérence',
      '**Datavisualisation :** tableaux de bord, Matplotlib, Power BI, indicateurs de suivi',
      '**Développement & outils :** Streamlit (projet DWS), React, TypeScript, Google Apps Script, Git',
    ].join('\n')
    : [
      '**SQL & databases:** SQL, joins, aggregations, subqueries, data extraction',
      '**Python & analysis:** Python, pandas, NumPy, cleaning, exploratory analysis, consistency checks',
      '**Dashboards:** interactive indicators, Matplotlib, Power BI, reporting',
      '**Development & tools:** Streamlit (DWS project), React, TypeScript, Google Apps Script, Git',
    ].join('\n');
  base.certifications = selectedCertifications(['google-advanced', 'sql-az']);
  base.leadership = [];
  base.interests = '';
  base.languages = fr
    ? 'Français : langue maternelle | Anglais : C1'
    : 'French: native | English: C1';
  base.sectionOrder = ['education', 'experience', 'projects', 'skills', 'certifications', 'languages'];
  // Preserve the contact details from the user's reviewed CV, not unrelated
  // or unverified claims from an automatically generated Plan B draft.
  base.email = defaultCvFr.email;
  base.phone = defaultCvFr.phone;
  base.linkedin = defaultCvFr.linkedin;
  base.github = defaultCvFr.github;
  return base;
}

export function buildSaintGobainPop3pLetter(language: CvLanguage = 'FR'): CoverLetterDraft {
  const fr = language === 'FR';
  const letter = freshCoverLetter(language);
  letter.template = 'modern';
  letter.pageColor = 'white';
  letter.date = new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  letter.company = 'Saint-Gobain';
  letter.team = fr ? 'POP3P — Service Projets' : 'POP3P — Projects Department';
  letter.recipientName = '';
  letter.recipientRole = fr ? "À l'attention de l'équipe de recrutement" : 'Recruitment Team';
  letter.recipientLocation = 'Nantes, France';
  // Must match offer.title exactly: the Studio uses this identity to
  // archive the letter in the correct application folder.
  letter.internshipTitle = SG_POP3P_TITLE;
  letter.greeting = fr ? 'Madame, Monsieur,' : 'Dear Hiring Team,';
  letter.paragraphs = fr ? [
    "Actuellement en dernière année du MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d'études de six mois dès février 2027. Votre offre de Data Analyst au sein de POP3P m'intéresse particulièrement : concevoir à Nantes une application Streamlit pour transformer les données du matériel roulant de Saint-Gobain en indicateurs utiles aux équipes représente exactement le type de projet opérationnel auquel je souhaite contribuer.",
    "J'ai conçu et déployé MonStage, une plateforme personnelle qui agrège plusieurs sources de données, détecte des enregistrements redondants et met à disposition des filtres et tableaux de bord pour suivre les candidatures. J'ai également travaillé sur l'authentification, la gestion d'accès et la conservation de documents par dossier. Cette expérience m'a appris qu'un outil décisionnel doit être à la fois fiable, facile à parcourir et adapté aux besoins de ses utilisateurs.",
    "Mon parcours m'a apporté des compétences en SQL, Python, pandas, NumPy et visualisation, complétées par les certifications Google Advanced Data Analytics et SQL. Lors de mon stage Data Analyst chez Unified Mentor, j'ai préparé et analysé des données avant d'en présenter les résultats. J'ai aussi utilisé Streamlit pour concevoir l'interface de mon projet personnel DWS. Je souhaite approfondir la prise en main de Snowflake et appliquer cette base technique à votre futur outil de pilotage.",
    "La dimension de transmission de votre stage me motive également : documenter une application, simplifier sa navigation et accompagner des utilisateurs non techniques sont essentiels pour qu'elle soit réellement adoptée. Rigoureux, curieux et attaché aux résultats concrets, je serais heureux de vous présenter mes réalisations et d'échanger sur les besoins de votre équipe.",
  ] : [
    "I am completing my MSc in Control and Robotics, specializing in Data Science, Signal & Image Processing at Centrale Nantes, and am seeking a six-month final-year internship from February 2027. POP3P's Data Analyst internship appeals to me because it involves building a Streamlit application that turns vehicle and fleet equipment data into actionable insights for Saint-Gobain teams in Nantes.",
    "I built and deployed MonStage, a platform that integrates several data sources, detects duplicate records and offers interactive filters and dashboards. I also worked on authentication, access restrictions and document management. This experience taught me that useful operational tools must combine reliable data, clear navigation and practical workflows.",
    "My background includes SQL, Python, pandas, NumPy and data visualization, strengthened by Google Advanced Data Analytics and SQL certificates. During my Data Analyst internship at Unified Mentor, I cleaned and explored datasets and communicated findings. I have also used Streamlit to build the interface of a personal project called DWS, and would welcome the opportunity to learn more about Snowflake.",
    "I am motivated by the user-facing aspects of this project, including documentation and helping non-technical teams adopt the tool. I would be pleased to discuss how my skills and experience could support POP3P.",
  ];
  letter.closing = fr
    ? "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
    : 'Yours sincerely,';
  return letter;
}
