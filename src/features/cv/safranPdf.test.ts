import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { cvEducationDisplay, cvSkillsForDisplay, cvKeySkillsForDisplay, defaultCvFr, cvTemplateOptions } from './cvStorage';
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
      const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
      expect(pdf.getPageCount(), template.id).toBe(1);
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
