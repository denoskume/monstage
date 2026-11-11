import type { CvCertification, CvLanguage, CvProject } from './cvStorage';
import { publicProjectCatalog } from '../applications/publicProjectCatalog';

// Stable, inspectable curriculum and evidence registry. Never mutate this data
// during offer tailoring. Course names mirror the candidate's LinkedIn records
// supplied on 9 November 2026; public projects link to their actual repositories.
export interface CourseGroup { title: string; courses: string[] }
export interface SchoolCurriculum { educationId: string; description: Record<CvLanguage,string>; groups: CourseGroup[] }
export const curricula: SchoolCurriculum[] = [
  {
    educationId: 'ecn',
    description: {
      FR: 'Formation aux méthodes avancées d’analyse de données, machine learning et traitement du signal et de l’image, associant théorie et travaux pratiques.',
      EN: 'Advanced methods in data analysis, machine learning and signal & image processing, combining theoretical foundations with practical applications.',
    },
    groups: [
      { title: 'Data Science & Machine Learning', courses: [
        'Machine Learning', 'Stochastic Methods', 'Artificial Intelligence',
        'Optimization Techniques', 'Algorithmics and Programming',
        'Data Analysis and Information Retrieval', 'Mathematical Tools for Signals and Systems',
      ] },
      { title: 'Signal & Image Processing', courses: [
        'Computer Vision', 'Image Processing', 'Signal Processing',
        'Spectral and Time Frequency Analysis', 'Biomedical Signals, Images and Methods',
        'Systems Identification and Signal Filtering',
        'Design of Signal and Image Representations',
        'Signal and Image Restoration, Inversion Methods',
        'Mathematical Tools for Signal and Image Processing',
      ] },
    ],
  },
  {
    educationId: 'kju',
    description: {
      FR: 'Double cursus informatique et électronique, combinant bases théoriques et applications pratiques en programmation et systèmes numériques.',
      EN: 'Dual-major program combining computer science and electronics with theoretical foundations and practical work in programming and digital systems.',
    },
    groups: [
      { title: 'Computer Science & Programming', courses: [
        'Data Structures', 'Computer Graphics', 'Internet Technology',
        'Software Engineering', 'Database Management Systems',
        'Data Analysis using Spreadsheets', 'Programming (C, Java, PHP, Python)',
      ] },
      { title: 'Electronics & Digital Systems', courses: [
        'Instrumentation Systems', 'Digital Signal Processing',
        'Analog and Digital Electronics', 'Electronic Devices and Circuits',
        'Digital Design Using Verilog and VHDL Programming',
        'Communication Systems (Satellite, Radar and Antennas)',
        'Embedded Systems (Microprocessors, Microcontrollers, Embedded C, Raspberry Pi)',
      ] },
    ],
  },
];

export interface EvidenceCertification extends CvCertification {
  category: 'certificate' | 'training';
  evidence: string;
  credentialUrl?: string;
  notes?: string;
}
export const certificateCatalog: EvidenceCertification[] = [
  {
    id: 'google-advanced',
    title: 'Google Advanced Data Analytics',
    issuer: 'Google (Coursera)',
    date: 'Déc. 2024',
    category: 'certificate',
    evidence: 'Certificat professionnel PDF transmis le 11 novembre 2026 (12 décembre 2024, 7 cours).',
    credentialUrl: 'https://coursera.org/verify/professional-cert/5ZOKXCS6B7RR',
    notes: 'Exploration de données, Python, statistiques, régression, machine learning et projet de synthèse. Formation non diplômante.',
  },
  {
    id: 'simplilearn-ds',
    title: "Data Scientist — Master's Program",
    issuer: 'Simplilearn',
    date: 'Août 2025',
    category: 'certificate',
    evidence: 'Certificat PDF transmis le 11 novembre 2026 (17 août 2025, distinction).',
    credentialUrl: 'https://success.simplilearn.com/0b363659-1995-4fbf-8a95-a4157ef15fe2',
    notes: 'Certificat de réussite du programme de formation Simplilearn, distinct du diplôme universitaire de Master.',
  },
  {
    // Keep this stable identifier to preserve references in previously saved CVs.
    id: 'sql-az',
    title: 'SQL Certification Course',
    issuer: 'Simplilearn',
    date: 'Juil. 2024',
    category: 'certificate',
    evidence: 'Certificat PDF transmis le 11 novembre 2026 (25 juillet 2024).',
    notes: 'Formation SQL certifiée. Intitulé et organisme confirmés par le PDF ; ne pas confondre avec une accréditation professionnelle officielle.',
  },
  {
    id: 'simplilearn-applied-python',
    title: 'Introduction to Applied Data Science with Python',
    issuer: 'Simplilearn SkillUp',
    date: 'Juil. 2024',
    category: 'certificate',
    evidence: 'Certificat PDF transmis le 11 novembre 2026 (3 juillet 2024).',
    notes: 'Formation introductive à la data science appliquée avec Python.',
  },
  {
    id: 'simplilearn-statistics',
    title: 'Statistics Essential for Data Science',
    issuer: 'Simplilearn',
    date: 'Nov. 2024',
    category: 'certificate',
    evidence: 'Certificat PDF transmis le 11 novembre 2026 (12 novembre 2024).',
    notes: 'Formation en statistiques pour la data science.',
  },
];

export type ProjectKind = 'academic-m1' | 'academic-coursework' | 'personal' | 'case-study';
export interface CvProjectEvidence {
  id: string;
  kind: ProjectKind;
  tags: string[];
  sourceUrl?: string;
  proof: string;
  cv: Record<CvLanguage, CvProject>;
}
const academicM1Ids = new Set(['clap', 'background', 'cardgame']);
const academicCourseworkIds = new Set(['calibration', 'tracking', 'deep-learning', 'segmentation', 'frequency', 'spatial', 'transformation', 'fundamentals', 'optimization']);
const academicDates: Record<string,string> = { clap: 'Juin 2026', background: 'Avr. 2026', cardgame: 'Déc. 2025' };

export const cvProjectLibrary: CvProjectEvidence[] = [
  ...publicProjectCatalog.map(project => {
    const kind: ProjectKind = academicM1Ids.has(project.id) ? 'academic-m1'
      : academicCourseworkIds.has(project.id) ? 'academic-coursework' : 'personal';
    const date = academicDates[project.id];
    const cv: Record<CvLanguage,CvProject> = {
      FR: { ...project.cv.FR, period: date ?? project.cv.FR.period, bullets: [...project.cv.FR.bullets] },
      EN: { ...project.cv.EN, period: date ?? project.cv.EN.period, bullets: [...project.cv.EN.bullets] },
    };
    if (project.id === 'insurance') {
      cv.FR.name = 'Étude de cas — Prédiction de coûts hospitaliers';
      cv.EN.name = 'Case Study — Hospital Cost Prediction';
    }
    if (project.id === 'clap') {
      cv.FR.name = 'CLAP — Classification audio zero-shot (M1)';
      cv.EN.name = 'CLAP — Zero-Shot Audio Classification (M1)';
    }
    if (project.id === 'background') {
      cv.FR.name = 'Traitement d’images médicales — Soustraction de fond (M1)';
      cv.EN.name = 'Medical Image Processing — Background Subtraction (M1)';
    }
    if (project.id === 'cardgame') {
      cv.FR.name = 'Jeu interactif de cartes — Python & Pygame (M1)';
      cv.EN.name = 'Interactive Card-Tracking Game — Python & Pygame (M1)';
    }
    return {
      id: project.id,
      kind: project.id === 'insurance' ? 'case-study' as const : kind,
      tags: [...project.tags],
      sourceUrl: project.url,
      proof: 'Projet public sur GitHub ; résultats à confirmer avec le README lors d’une mise à jour.',
      cv,
    };
  }),
  {
    id: 'nova',
    kind: 'case-study',
    tags: ['data','analysis','python','pandas','profitability','finance','kpi','reconciliation','anomaly'],
    proof: 'Exercice pédagogique simulé Nova Distribution (2026) ; ne pas présenter comme expérience professionnelle.',
    cv: {
      FR: {
        id: 'nova', name: 'Étude de cas simulée — Nova Distribution', period: '2026',
        description: 'Analyse de rentabilité sur données fictives.',
        bullets: [
          'Étudié une hausse du chiffre d’affaires de 12 % et une baisse du résultat opérationnel de 8 %.',
          'Calculé les marges opérationnelles : 20 % puis 16,43 % sur les deux semestres.',
          'Rapproché les charges avec Python et pandas, détectant un écart de 1,4 M€ dans le scénario.',
          'Présenté des vérifications à approfondir sur achats, logistique et cohérence des dépenses.',
        ],
      },
      EN: {
        id: 'nova', name: 'Simulated Case Study — Nova Distribution', period: '2026',
        description: 'Profitability analysis using simulated data.',
        bullets: [
          'Analyzed a 12% revenue increase and an 8% operating profit decrease.',
          'Calculated operating margins of 20% and 16.43% over two semesters.',
          'Reconciled expenses with Python and pandas, identifying a €1.4M scenario discrepancy.',
          'Proposed checks on purchasing, logistics and expense consistency.',
        ],
      },
    },
  },
];

export const projectKindLabels: Record<ProjectKind, { FR:string; EN:string }> = {
  'academic-m1': { FR: 'Projet académique M1', EN: 'M1 academic project' },
  'academic-coursework': { FR: 'Travaux académiques', EN: 'Academic coursework' },
  'personal': { FR: 'Projet personnel', EN: 'Personal project' },
  'case-study': { FR: 'Étude de cas', EN: 'Case study' },
};

export const cvPresets = {
  A: {
    ecn: ['Computer Vision','Image Processing','Signal Processing','Machine Learning','Optimization Techniques','Systems Identification and Signal Filtering'],
    kju: ['Programming (C, Java, PHP, Python)','Data Structures','Digital Signal Processing'],
    projects: ['background','clap'],
    certificates: ['simplilearn-ds'],
  },
  B: {
    ecn: ['Data Analysis and Information Retrieval','Machine Learning','Stochastic Methods','Optimization Techniques','Systems Identification and Signal Filtering'],
    kju: ['Database Management Systems','Data Analysis using Spreadsheets','Programming (C, Java, PHP, Python)'],
    projects: ['insurance','monstage'],
    certificates: ['google-advanced','simplilearn-ds'],
  },
  EDF: {
    ecn: ['Data Analysis and Information Retrieval','Machine Learning','Stochastic Methods','Optimization Techniques','Systems Identification and Signal Filtering'],
    kju: ['Database Management Systems','Data Analysis using Spreadsheets','Programming (C, Java, PHP, Python)'],
    projects: ['insurance','monstage'],
    certificates: ['google-advanced','simplilearn-ds'],
  },
} as const;

export function selectedCertifications(ids: readonly string[]): CvCertification[] {
  return ids.flatMap(id => {
    const entry = certificateCatalog.find(item => item.id === id);
    if (!entry) return [];
    return [{ id: entry.id, title: entry.title, issuer: entry.issuer, date: entry.date, credentialId: entry.credentialId }];
  });
}
export function selectedProjects(ids: readonly string[], language:CvLanguage): CvProject[] {
  return ids.flatMap(id => {
    const entry = cvProjectLibrary.find(item => item.id === id);
    if (!entry) return [];
    const project = entry.cv[language];
    return [{ ...project, bullets: [...project.bullets].slice(0,4) }];
  });
}
