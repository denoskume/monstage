import { describe, expect, test } from 'vitest';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import { render, screen, within } from '@testing-library/react';
import { freshCvDraft, cvTemplateOptions } from './cvStorage';
import { buildCvPdfBytes } from './pdfExport';
import { Design01Preview } from './Design01Preview';
import { DESIGN01 } from './design01Template';

describe('CV DESIGN 01 — full-width heading and ATS PDF', () => {
  test('is separately selectable without replacing the Thierry template', () => {
    expect(cvTemplateOptions.map(t => t.id)).toEqual([
      'classic','modern','minimal','keywords','split','sidebar','portrait','thierry','design01',
    ]);
    expect(DESIGN01.frameBlue).toBe('#0F9ED5');
    expect(DESIGN01.railGray).toBe('#BFBFBF');
    expect(DESIGN01.darkBlue).toBe('#215F9A');
  });

  test('shows real editable CV text, with semantically labeled headings and no raster snapshot', () => {
    const draft = freshCvDraft('FR','B');
    draft.template = 'design01';
    draft.summary='Je cherche un stage de six mois en analyse de données.';
    draft.thierryTools='Python\nSQL\nPower BI';
    const {container}=render(<Design01Preview draft={draft}/>);
    const page=screen.getByTestId('design01-cv-preview');
    expect(within(page).getByRole('heading',{level:1,name:'Denos KUME'})).toBeTruthy();
    expect(within(page).getByRole('heading',{name:'PROFIL'})).toBeTruthy();
    expect(within(page).getByRole('heading',{name:'EXPÉRIENCE'})).toBeTruthy();
    expect(within(page).getByRole('heading',{name:'COMPÉTENCES'})).toBeTruthy();
    expect(page.textContent).toContain('Python');
    expect(page.textContent).toContain(draft.summary);
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  test('exports a text-based single A4 page with fonts and no image XObjects', async () => {
    const draft = freshCvDraft('FR','B');
    draft.template='design01';
    draft.summary='Stage de six mois, analyse industrielle et fiabilité des indicateurs.';
    draft.education=draft.education.slice(0,2);
    draft.certifications=(draft.certifications??[]).slice(0,2);
    draft.experience=draft.experience.slice(0,1);
    draft.projects=draft.projects.slice(0,1);
    draft.skills='**Analyse de données :** SQL, Python, contrôle de cohérence\n**Reporting :** KPI, tableaux de bord';
    draft.thierryTools='Python\nSQL\nPower BI';
    const pdf=await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(DESIGN01.pageWidth,1);
    expect(pdf.getPage(0).getHeight()).toBeCloseTo(DESIGN01.pageHeight,1);
    const resources=pdf.getPage(0).node.Resources()!;
    expect(resources.lookup(PDFName.of('Font'),PDFDict)).toBeDefined();
    expect(resources.get(PDFName.of('XObject'))).toBeUndefined();
    expect(pdf.getTitle()).toContain('DESIGN 01');
  });

  test('rejects excessive text instead of silently clipping the ATS content', async () => {
    const draft=freshCvDraft('FR','B');
    draft.template='design01';
    draft.projects=Array.from({length:25},(_,i)=>({
      id:'p'+i,period:'2026',name:'Projet test long '+i,
      bullets:['Développement, analyse et implémentation dans un environnement industriel exigeant avec traitements SQL et Python répétés.'.repeat(4)],
    }));
    await expect(buildCvPdfBytes(draft)).rejects.toThrow(/contenu trop long|colonne gauche/);
  });
});
