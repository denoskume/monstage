import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildCvPdfBytes } from '../cv/pdfExport';
import {
  SG_POP3P_ID, isSaintGobainPop3pOffer,
  buildSaintGobainPop3pCv, buildSaintGobainPop3pLetter,
} from './saintGobainPop3pDossier';

describe('Saint-Gobain POP3P Nantes dossier', () => {
  it('matches the exact vacancy without hijacking other Saint-Gobain jobs', () => {
    expect(isSaintGobainPop3pOffer({
      id: SG_POP3P_ID, company: 'Saint-Gobain', title: 'Data Analyst (H/F)',
      city: 'Nantes', applicationUrl: 'https://joinus.saint-gobain.com/fr/rac/apply?jobId=Q2FFK026203F3VBQBLO7V8M1O-329924',
    })).toBe(true);
    expect(isSaintGobainPop3pOffer({
      id: 'SG-FRA40401', company: 'Saint-Gobain', title: 'Data Analyst (H/F)',
      city: 'Courbevoie', applicationUrl: 'https://joinus.saint-gobain.com/other-job',
    })).toBe(false);
  });

  it('keeps the same rigorous structure as the reviewed Thales CV', () => {
    const cv = buildSaintGobainPop3pCv('FR');
    expect(cv.plan).toBe('B');
    expect(cv.projects).toHaveLength(1);
    expect(cv.projects[0].id).toBe('monstage');
    expect(cv.projects[0].bullets).toHaveLength(4);
    expect(cv.experience).toHaveLength(2);
    expect(cv.experience.every(job => job.bullets.length === 3)).toBe(true);
    expect(cv.education[0].keyCourses).toContain('Data Analysis and Information Retrieval');
    expect(cv.education[1].keyCourses).toContain('Software Engineering');
    expect(cv.skills).toContain('Streamlit (projet DWS)');
    expect(cv.skills).not.toContain('Snowflake');
    expect(cv.summary).toContain('février 2027');
  });

  it('creates a role-specific letter without claiming Snowflake experience', () => {
    const letter = buildSaintGobainPop3pLetter('FR');
    expect(letter.team).toContain('POP3P');
    expect(letter.paragraphs.join(' ')).toContain('Streamlit');
    expect(letter.paragraphs.join(' ')).toContain('matériel roulant');
    expect(letter.paragraphs.join(' ')).toContain('approfondir la prise en main de Snowflake');
    expect(letter.paragraphs).toHaveLength(4);
  });

  it('exports the French reviewed package to one A4 page', async () => {
    const bytes = await buildCvPdfBytes(buildSaintGobainPop3pCv('FR'));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(595.28, 1);
  });
});
