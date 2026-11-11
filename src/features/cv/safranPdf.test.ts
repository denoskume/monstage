import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { cvEducationDisplay, cvSkillsForDisplay, cvExperienceLocationForDisplay, cvLanguagesForDisplay, cvKeySkillsForDisplay, cvSummaryTitle, defaultCvFr, freshPlanBCvDraft, normalizePlanBDraft, cvPlanBSkills, cvTemplateOptions, cvPageColorOptions, cvPageColorHex } from './cvStorage';
import { publicProjectCatalog } from '../applications/publicProjectCatalog';
import { buildCvPdfBytes } from './pdfExport';

describe('Safran.AI one-page CV export', () => {
  it('fits a targeted dossier with two three-bullet projects and mission descriptions onto one A4 page', async () => {
    const draft = structuredClone(defaultCvFr);
    draft.email = 'kamenan.kume@eleves.ec-nantes.fr';
    draft.headline = 'Stage de fin d’études — Machine Learning & Computer Vision';
    draft.summary = 'En dernière année du MSc Data Science, Signal and Image Processing à Centrale Nantes, je recherche un stage de six mois dès février 2027 en Machine Learning et Computer Vision.';
    draft.projects = ['background','clap'].map(id => {
      const entry = publicProjectCatalog.find(p => p.id === id);
      if (!entry) throw new Error('Missing verified project '+id);
      return { ...entry.cv.FR, bullets: entry.cv.FR.bullets.slice(0, 3) };
    });
    draft.experience = draft.experience.map(item => ({
      ...item, bullets: item.bullets.slice(0, 3),
    }));
    draft.education = draft.education.map(item => item.id === 'kju' ? {...item, details: item.details + '\nActivité associative : Secrétaire, International Students Forum (2022–2024) — coordination d’activités culturelles et accueil de plus de 100 étudiants internationaux.'} : item);
    draft.leadership = [];
    draft.sectionOrder = ['education','projects','experience','skills','languages','interests'];
    expect(draft.projects.every(p => p.bullets.length === 3)).toBe(true);
    expect(draft.experience.every(e => e.bullets.length === 3)).toBe(true);
    for (const template of cvTemplateOptions) {
      draft.template = template.id;
      if (template.id === 'keywords') draft.keySkills = 'Python · OpenCV · Segmentation · PyTorch · Machine Learning';
      for (const color of cvPageColorOptions) {
        draft.pageColor = color.id;
        const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
        expect(pdf.getPageCount(), template.id + '/' + color.id).toBe(1);
      }
    }
  });
});

describe('Single-line education bullet PDF export', () => {
  it('keeps a full Safran CV with four long degree bullets on one A4 page', async () => {
    const draft = structuredClone(defaultCvFr);
    draft.email = 'kamenan.kume@eleves.ec-nantes.fr';
    draft.headline = 'Stage de fin d’études — Machine Learning & Computer Vision';
    draft.summary = "En dernière année de MSc à Centrale Nantes, je souhaite appliquer mes compétences en Machine Learning et Computer Vision à des projets industriels concrets. Mes travaux en segmentation d'images et en classification m'ont donné envie d'aller plus loin dans l'évaluation et la fiabilité des modèles.";
    draft.education = draft.education.map(item => item.id === 'ecn' ? {
      ...item, bullets: [
        "Travaux pratiques en machine learning, optimisation, traitement du signal et de l'image, principalement avec Python et MATLAB.",
        "Expérimentation de méthodes de segmentation, filtrage et analyse de données, avec comparaison et évaluation des résultats.",
      ],
    } : {
      ...item, bullets: [
        "Travaux pratiques en programmation, développement logiciel et analyse de données, avec application des concepts fondamentaux.",
        "Étude et application des principes d'électronique numérique, des systèmes de communication et des technologies embarquées.",
      ],
    });
    draft.projects = ['background', 'clap'].map(id => {
      const entry = publicProjectCatalog.find(project => project.id === id);
      if (!entry) throw new Error('Missing project ' + id);
      return { ...entry.cv.FR, bullets: [...entry.cv.FR.bullets] };
    });
    draft.experience = draft.experience.map(item => ({ ...item, bullets: item.bullets.slice(0, 3) }));
    draft.projects = draft.projects.map(item => ({ ...item, bullets: item.bullets.slice(0, 3) }));
    draft.sectionOrder = ['education', 'projects', 'experience', 'skills', 'languages', 'interests'];
    draft.skills = 'Python & données : Python, NumPy, pandas, SciPy, Jupyter, Matplotlib\nMachine Learning : scikit-learn, PyTorch, classification, évaluation de modèles, analyse d’erreurs\nComputer Vision & signal : OpenCV, scikit-image, segmentation, filtrage spatial et fréquentiel\nOutils : Git, GitHub, Linux, VS Code';
    draft.interests = 'Vision par ordinateur et imagerie industrielle | Cuisine';
    expect((await PDFDocument.load(await buildCvPdfBytes(draft))).getPageCount()).toBe(1);
  });
});

describe('Education display parity between preview and PDF', () => {
  it('keeps Master location and removes only duplicated Bachelor city in the title', () => {
    const master = cvEducationDisplay({
      id: 'ecn', school: 'Master of Science (MSc) - Control and Robotics, Centrale Nantes',
      degree: 'Parcours: Data Science, Signal & Image Processing', location: 'Nantes, France',
      period: '2025–2027', details: '',
    });
    expect(master.school).toContain('Centrale Nantes');
    expect(master.location).toBe('Nantes, France');

    const bachelor = cvEducationDisplay({
      id: 'kju', school: 'Bachelor of Science (BSc) - Computer Science & Electronics, Kristu Jayanti University. Bengaluru, Inde',
      degree: 'Parcours: Informatique et Électronique', location: 'Bangalore, Inde',
      period: '2021–2025', details: '',
    });
    expect(bachelor.school).toBe('Bachelor of Science (BSc) - Computer Science & Electronics, Kristu Jayanti University');
    expect(bachelor.location).toBe('Bengaluru, Inde');
  });
});

describe('Long education titles and single flagship project display', () => {
  it('moves an embedded pipe-separated city to the location field without changing the degree title', () => {
    const bachelor = cvEducationDisplay({
      id: 'kju',
      school: 'Kristu Jayanti University - Bachelor of Science, Computer Science & Electronics | Bengaluru, Inde',
      degree: 'Parcours: Informatique et Électronique',
      location: '',
      period: '2021–2025',
      details: 'Double cursus en informatique et électronique.',
    });
    expect(bachelor.school).toBe('Kristu Jayanti University - Bachelor of Science, Computer Science & Electronics');
    expect(bachelor.location).toBe('Bengaluru, Inde');

    const master = cvEducationDisplay({
      id: 'ecn',
      school: 'Centrale Nantes - Master of Science in Control and Robotics | Nantes, France',
      degree: 'Parcours: Data Science, Signal & Image Processing',
      location: '',
      period: '2025–2027',
      details: '',
    });
    expect(master.school).toBe('Centrale Nantes - Master of Science in Control and Robotics');
    expect(master.location).toBe('Nantes, France');
  });

  it('exports long four-bullet project and programme descriptions to one A4 page', async () => {
    const draft = structuredClone(defaultCvFr);
    draft.headline = 'Data Analytics | SQL & Python | Data Quality & Automation';
    draft.academicHeadline = 'Master 2 Control and Robotics - Data Science, Signal & Image Processing';
    draft.template = 'modern';
    draft.showMissionLabels = false;
    draft.summary = "Étudiant en dernière année de MSc à Centrale Nantes, j'ai conçu et déployé MonStage, une plateforme intégrant collecte multi-sources, contrôles de cohérence et automatisation de données. Je souhaite mettre cette expérience et mes compétences en SQL, Python et analyse de données au service de la fiabilité des données chez Thales Alenia Space, dans le cadre d'un stage de six mois dès février 2027.";
    draft.education = [
      {
        id: 'ecn',
        school: 'Centrale Nantes - Master of Science in Control and Robotics | Nantes, France',
        degree: 'Parcours: Data Science, Signal & Image Processing',
        location: '',
        period: '2025–2027',
        details: "Formation avancée en analyse de données, IA, Machine Learning et traitement du signal et de l'image.",
        keyCourses: 'Data Analysis and Information Retrieval · IA · Machine Learning · Algorithmics and Programming',
      },
      {
        id: 'kju',
        school: 'Kristu Jayanti University - Bachelor of Science, Computer Science & Electronics | Bengaluru, Inde',
        degree: 'Parcours: Informatique et Électronique',
        location: '',
        period: '2021–2025',
        details: 'Double cursus en informatique et électronique, associant programmation, données et développement logiciel.',
        keyCourses: 'Database Management Systems · Data Analysis · Python Programming · Software Engineering',
      },
    ];
    draft.experience = draft.experience.map(item => ({
      ...item,
      bullets: item.bullets.slice(0, 3),
      description: item.id === 'rws'
        ? "Contrôle de la qualité et de la cohérence des réponses de modèles d'intelligence artificielle."
        : 'Préparation, exploration et restitution de données structurées avec Python.',
    }));
    draft.projects = [{
      id: 'monstage',
      name: "MonStage - Plateforme d'automatisation et de fiabilisation des données",
      period: 'Sept. 2026–En cours',
      description: 'Application web déployée permettant de collecter, structurer et exploiter des données issues de plusieurs sources de recrutement.',
      bullets: [
        'Intégration : connecté plusieurs flux ATS et structuré les offres selon leurs attributs (entreprise, poste, localisation, dates et statuts).',
        "Qualité des données : implémenté des règles d'identification et de dédoublonnage des offres, ainsi que des filtres multicritères pour fiabiliser les résultats.",
        'Automatisation : mis en œuvre des flux API, Google Apps Script et des traitements de synchronisation pour actualiser les données sans ressaisie manuelle.',
        'Traçabilité et reporting : développé un tableau de bord de suivi et des dossiers par candidature reliant statuts, documents et actions à effectuer.',
      ],
    }];
    draft.leadership = [];
    draft.sectionOrder = ['education','experience','projects','skills','certifications','languages'];
    draft.certifications = [
      { id: 'google-advanced', title: 'Google Advanced Data Analytics', issuer: 'Google (Coursera)', date: 'Déc. 2024' },
      { id: 'sql-az', title: 'SQL Certification Course', issuer: 'Simplilearn', date: 'Juil. 2024' },
    ];
    const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(595.28, 1);
  });
});

describe('CV technical skill deduplication', () => {
  it('merges tool categories without removing distinct skills', () => {
    const skills = [
      'Programming: Python, NumPy, MATLAB',
      'Computer Vision & Image Processing: OpenCV, image filtering, segmentation',
      'Machine Learning: PyTorch, classification, model evaluation',
      'Tools & Visualization: Jupyter Notebook, Matplotlib, Git, GitHub',
      'Outils : Jupyter, Git, GitHub, Linux, Excel',
    ].join('\n');
    const result = cvSkillsForDisplay(skills, 'FR');
    expect(result).toHaveLength(4);
    expect(result[3]).toBe('**Outils & visualisation :** Jupyter Notebook, Matplotlib, Git, GitHub, Linux, Excel');
    expect(result[0]).toContain('Python');
    expect(result[1]).toContain('OpenCV');
    expect(result[2]).toContain('PyTorch');
  });
});

describe('Saved bold tool lists', () => {
  it('removes bold-markup artifacts and duplicate Jupyter in the final display', () => {
    const source = [
      '**Programming:** Python, NumPy, MATLAB',
      '**Tools & Visualization:** **Jupyter Notebook, Matplotlib, Git, GitHub**',
      '**Outils :** Jupyter, Linux, Excel',
    ].join('\n');
    const rows = cvSkillsForDisplay(source, 'FR');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toBe('**Outils & visualisation :** Jupyter Notebook, Matplotlib, Git, GitHub, Linux, Excel');
    expect(rows[1].match(/Jupyter/g)).toHaveLength(1);
  });
});

describe('ATS key skills template', () => {
  it('derives only displayed existing skills and keeps explicit role-specific edits', () => {
    const draft = structuredClone(defaultCvFr);
    draft.template = 'keywords';
    const derived = cvKeySkillsForDisplay(draft);
    expect(derived).toContain('Python');
    expect(derived).not.toContain('Quantum');
    draft.keySkills = 'Python · OpenCV · Segmentation';
    expect(cvKeySkillsForDisplay(draft)).toBe('Python · OpenCV · Segmentation');
    draft.keySkills = '';
    expect(cvKeySkillsForDisplay(draft)).toBe('');
  });
});

describe('CV page-color choices', () => {
  it('keeps the three page colors available independent of template', () => {
    expect(cvPageColorOptions.map(option => option.id)).toEqual(['white', 'soft-gray', 'soft-blue']);
    expect(cvPageColorHex()).toBe('#FFFFFF');
    expect(cvPageColorHex('soft-gray')).toBe('#FBFBFB');
    expect(cvPageColorHex('soft-blue')).toBe('#F4F7FB');
  });
});

describe('CV summary section heading', () => {
  it('switches labels without changing profile content or other sections', async () => {
    const draft = structuredClone(defaultCvFr);
    const original = draft.summary;
    expect(cvSummaryTitle(undefined, 'FR')).toBe('Profil');
    expect(cvSummaryTitle('objective', 'FR')).toBe('Objectif professionnel');
    expect(cvSummaryTitle('profile', 'EN')).toBe('Profile');
    expect(cvSummaryTitle('objective', 'EN')).toBe('Career Objective');
    for (const summaryHeading of ['profile', 'objective'] as const) {
      draft.summaryHeading = summaryHeading;
      const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
      expect(draft.summary).toBe(original);
    }
  });
});

describe('French CV formatting corrections', () => {
  it('normalizes city spelling and the Remote comma without changing the saved text', () => {
    expect(cvExperienceLocationForDisplay('Stage • Bengalore, Inde')).toBe('Stage • Bengaluru, Inde');
    expect(cvExperienceLocationForDisplay('Freelance • Remote , France')).toBe('Freelance • Remote, France');
  });
  it('keeps per-language labels without a redundant leading heading', () => {
    const source = 'Langues : **Français :** Langue maternelle | **Anglais :** C1 (plus de 4 ans d’études supérieures en anglais)';
    expect(cvLanguagesForDisplay(source)).toBe('**Français :** Langue maternelle | **Anglais :** C1 (plus de 4 ans d’études supérieures en anglais)');
  });
  it('uses French category names while preserving all technical skill values', () => {
    const source = [
      '**Programming:** Python, NumPy, MATLAB',
      '**Computer Vision & Image Processing:** OpenCV, image filtering, segmentation',
      '**Machine Learning:** PyTorch, classification, model evaluation',
      '**Tools & Visualization:** Jupyter Notebook, Matplotlib, Git, GitHub',
      '**Outils :** Jupyter, Linux, Excel',
    ].join('\n');
    const fr = cvSkillsForDisplay(source, 'FR');
    expect(fr).toHaveLength(4);
    expect(fr[0]).toBe('**Programmation :** Python, NumPy, MATLAB');
    expect(fr[1]).toBe('**Vision par ordinateur & traitement d’images :** OpenCV, image filtering, segmentation');
    expect(fr[2]).toContain('PyTorch');
    expect(fr[3]).toBe('**Outils & visualisation :** Jupyter Notebook, Matplotlib, Git, GitHub, Linux, Excel');
    expect(cvSkillsForDisplay(source, 'EN')[0]).toBe('**Programming:** Python, NumPy, MATLAB');
  });
});

describe('Separate Plan B Data Analyst CV', () => {
  it('has verified target roles and does not reuse CV A projects', async () => {
    const draft = freshPlanBCvDraft('FR');
    expect(draft.plan).toBe('B');
    expect(draft.headline).toContain('Business Intelligence');
    expect(draft.projects.map(project => project.id)).toEqual(['nova', 'monstage']);
    expect(draft.projects[0].name).toContain('simulé');
    expect(draft.experience.map(item => item.role)).toEqual(['Data Analyst Intern', 'Speech AI Evaluation Specialist']);
    expect(draft.sectionOrder).not.toContain('leadership');
    expect(draft.certifications?.map(c => c.id)).toEqual(['google-advanced', 'simplilearn-ds']);
    expect(draft.education.find(e => e.id === 'kju')?.keyCourses).toContain('Database Management Systems');
    const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(pdf.getPageCount()).toBeLessThanOrEqual(2);
  });
  it('also supports English without mutating Plan A', async () => {
    const draft = freshPlanBCvDraft('EN');
    expect(draft.headline).toContain('Data Analysis');
    expect(draft.summary).toContain('February 2027');
    expect(draft.experience[0].bullets).toHaveLength(3);
    expect((await PDFDocument.load(await buildCvPdfBytes(draft))).getPageCount()).toBeLessThanOrEqual(2);
  });
});

describe('Plan B skills without repeated categories', () => {
  it('shows four distinct sections for new French and English drafts', () => {
    for (const language of ['FR', 'EN'] as const) {
      const draft = freshPlanBCvDraft(language);
      expect(cvSkillsForDisplay(draft.skills, language)).toEqual(cvPlanBSkills(language));
      expect(cvPlanBSkills(language)).toHaveLength(4);
    }
  });
  it('upgrades the original saved Plan B skills at display time without overwriting saved data', () => {
    const old = [
      '**Programmation & analyse :** Python, Pandas, NumPy, nettoyage de données, EDA',
      '**Bases de données :** SQL, SQL Server, SSMS, jointures, agrégations',
      '**Business Intelligence :** Power BI, DAX, tableaux de bord interactifs',
      '**Outils & reporting :** KPI, Matplotlib, Jupyter Notebook, Git',
    ].join('\n');
    expect(cvSkillsForDisplay(old, 'FR')).toEqual(cvPlanBSkills('FR'));
    expect(old).toContain('Outils & reporting');
  });
});

describe('Plan B PDF review corrections', () => {
  it('normalizes the specific incorrect periods and database row without modifying Plan A', async () => {
    const original = freshPlanBCvDraft('FR');
    const saved = {
      ...original,
      projects: original.projects.map(item => ({...item, period: item.id === 'nova' ? 'mars-Jun 2025' : 'Jul-Oct 2026'})),
      skills: original.skills.replace('SQL, SQL Server (SSMS)', 'MySQL, SQL Server (SSMS)'),
    };
    const result = normalizePlanBDraft(saved);
    expect(result.projects.map(item => item.period)).toEqual(['mars–juin 2025', 'juin–octobre 2026']);
    expect(result.skills).toContain('**Bases de données :** SQL, SQL Server (SSMS), jointures, agrégations');
    expect(original.projects.map(item => item.period)).toEqual(['mars–juin 2025', 'juin–octobre 2026']);
    expect(saved.projects[0].period).toBe('mars-Jun 2025');
    expect(saved.skills).toContain('MySQL');
    const pdf = await PDFDocument.load(await buildCvPdfBytes(result));
    expect(pdf.getPageCount()).toBeLessThanOrEqual(2);
    const a = { ...saved, plan: 'A' as const };
    expect(normalizePlanBDraft(a)).toBe(a);
  });
  it('does not erase dates entered in a different valid format', () => {
    const current = freshPlanBCvDraft('FR');
    current.projects[0].period = '2026';
    current.projects[1].period = '2026 – en cours';
    expect(normalizePlanBDraft(current).projects.map(item => item.period)).toEqual(['2026', '2026 – en cours']);
  });
});
