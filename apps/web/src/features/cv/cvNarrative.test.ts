import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildCvPdfBytes } from './pdfExport';
import { freshCvDraft, cvTemplateOptions, type CvTemplate } from './cvStorage';
import { cvNarrativeFields, cvNarrativeBullets } from './cvNarrative';

describe('Mission / Expériences acquises / Résultats dans tous les CV', () => {
  it('garde les champs structurés, leur ordre et la traduction FR/EN', () => {
    const entry = {
      mission: 'Analyser les données industrielles.',
      acquired: 'SQL et Power BI.',
      results: 'Indicateurs vérifiés.',
      bullets: ['Premier point complémentaire.'],
    };
    expect(cvNarrativeFields(entry, 'FR')).toEqual([
      { key: 'mission', label: 'Mission', value: 'Analyser les données industrielles.' },
      { key: 'acquired', label: 'Expériences acquises', value: 'SQL et Power BI.' },
      { key: 'results', label: 'Résultats', value: 'Indicateurs vérifiés.' },
    ]);
    expect(cvNarrativeFields(entry, 'EN').map(field => field.label))
      .toEqual(['Mission', 'Skills gained', 'Results']);
    expect(cvNarrativeBullets(entry)).toEqual(['Premier point complémentaire.']);
  });

  it('préserve les anciennes puces et évite les répétitions strictes', () => {
    const legacy = { bullets: ['Collecte de données.', 'Création de rapports.'] };
    expect(cvNarrativeFields(legacy, 'FR')).toEqual([]);
    expect(cvNarrativeBullets(legacy)).toEqual(legacy.bullets);
    expect(cvNarrativeBullets({
      mission: '**Collecte de données.**',
      acquired: '',
      results: 'Création de rapports',
      bullets: [...legacy.bullets, 'Contrôle de cohérence.'],
    })).toEqual(['Contrôle de cohérence.']);
  });

  it('conserve les mêmes données lors du changement entre les neuf modèles', () => {
    const draft = freshCvDraft('FR', 'B');
    draft.experience[0].mission = 'Mission ciblée';
    draft.experience[0].acquired = 'Compétences développées';
    draft.experience[0].results = 'Résultats mesurés';
    draft.projects[0].mission = 'Projet industriel';
    for (const { id } of cvTemplateOptions) {
      const switched = { ...draft, template: id as CvTemplate };
      expect(switched.experience[0].mission).toBe('Mission ciblée');
      expect(switched.experience[0].acquired).toBe('Compétences développées');
      expect(switched.experience[0].results).toBe('Résultats mesurés');
      expect(switched.projects[0].mission).toBe('Projet industriel');
    }
  });

  it('génère un PDF avec les champs structurés pour chacun des neuf modèles', async () => {
    const draft = freshCvDraft('FR', 'B');
    draft.name = 'Candidat Exemple';
    draft.email = 'candidat@example.org';
    draft.summary = 'Stage de six mois dès février 2027 en analyse de données.';
    draft.education = draft.education.slice(0, 2).map(item => ({...item, details:'', keyCourses:''}));
    draft.certifications = [];
    draft.experience = draft.experience.slice(0, 1).map(item => ({
      ...item, description: '', bullets: [],
      mission: 'Nettoyer les sources métier.',
      acquired: 'Python et SQL.',
      results: 'Indicateurs fiables.',
    }));
    draft.projects = draft.projects.slice(0, 1).map(item => ({
      ...item, description: '', bullets: [],
      mission: 'Produire un tableau de bord.',
      acquired: 'Visualisation interactive.',
      results: 'Rapports livrés.',
    }));
    draft.leadership = [];
    draft.skills = '**Données :** Python, SQL';
    draft.thierryTools = 'Python\\nSQL';
    for (const { id } of cvTemplateOptions) {
      const bytes = await buildCvPdfBytes({...draft, template: id as CvTemplate});
      const pdf = await PDFDocument.load(bytes);
      expect(pdf.getPageCount(), id).toBeGreaterThan(0);
      expect(pdf.getPage(0).getWidth(), id).toBeCloseTo(595.3, 0);
    }
  });
});
