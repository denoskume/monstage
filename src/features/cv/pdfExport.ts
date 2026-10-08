import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CvDraft } from './cvStorage';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN_X = 42;
const MARGIN_TOP = 42;
const MARGIN_BOTTOM = 42;

function safeFileName(value: string): string {
  return value.trim().replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'MonStage_CV';
}

function pdfSafeText(value: string): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/\u00B7/g, '-')
    .replace(/\u00B2/g, '2')
    .replace(/[^\x20-\x7E]/g, '');
}

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = pdfSafeText(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = line + ' ' + words[i];
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

export async function buildCvPdfBytes(draft: CvDraft): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN_TOP;

  const textColor = rgb(0.07, 0.07, 0.07);
  const ruleColor = rgb(0.25, 0.25, 0.25);
  const usableWidth = A4_WIDTH - (MARGIN_X * 2);

  const ensureSpace = (height: number) => {
    if (y - height < MARGIN_BOTTOM) {
      page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
      y = A4_HEIGHT - MARGIN_TOP;
    }
  };

  const drawCentered = (text: string, size: number, font: any) => {
    const safe = pdfSafeText(text);
    const width = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: Math.max(MARGIN_X, (A4_WIDTH - width) / 2), y, size, font, color: textColor });
    y -= size + 5;
  };

  const drawLines = (text: string, size = 9.5, font = regular, indent = 0, leading = size + 3) => {
    const lines = wrapText(text, usableWidth - indent, font, size);
    ensureSpace(lines.length * leading + 4);
    for (const line of lines) {
      page.drawText(line, { x: MARGIN_X + indent, y, size, font, color: textColor });
      y -= leading;
    }
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(24);
    y -= 4;
    page.drawText(pdfSafeText(title.toUpperCase()), { x: MARGIN_X, y, size: 10.5, font: bold, color: textColor });
    y -= 5;
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: A4_WIDTH - MARGIN_X, y }, thickness: 0.8, color: ruleColor });
    y -= 12;
  };

  const drawRightAligned = (text: string, yValue: number, size = 9.5, font = regular) => {
    const safe = pdfSafeText(text);
    const width = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: A4_WIDTH - MARGIN_X - width, y: yValue, size, font, color: textColor });
  };

  const drawEntryHeader = (left: string, right: string) => {
    ensureSpace(18);
    page.drawText(pdfSafeText(left), { x: MARGIN_X, y, size: 9.5, font: bold, color: textColor });
    if (right) drawRightAligned(right, y, 9.5, regular);
    y -= 13;
  };

  const drawBullet = (text: string) => {
    const bulletIndent = 12;
    const lines = wrapText(text, usableWidth - bulletIndent, regular, 9.2);
    ensureSpace(lines.length * 12 + 3);
    page.drawText('-', { x: MARGIN_X, y, size: 9.2, font: regular, color: textColor });
    lines.forEach((line, index) => {
      page.drawText(line, { x: MARGIN_X + bulletIndent, y, size: 9.2, font: regular, color: textColor });
      y -= 12;
    });
  };

  drawCentered(draft.name, 18, bold);
  drawCentered(draft.headline, 10.5, bold);
  drawCentered([draft.location, draft.email, draft.phone, draft.linkedin, draft.github].filter(Boolean).join(' | '), 8.5, regular);
  y -= 2;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: A4_WIDTH - MARGIN_X, y }, thickness: 1, color: textColor });
  y -= 12;

  if (draft.summary.trim()) {
    drawSectionTitle(draft.language === 'FR' ? 'Objectif' : 'Objective');
    drawLines(draft.summary.trim(), 9.5);
  }

  const sectionOrder = draft.sectionOrder?.length
    ? draft.sectionOrder
    : ['education', 'projects', 'experience', 'skills', 'languages', 'leadership', 'interests'] as const;

  for (const sectionKey of sectionOrder) {
    if (sectionKey === 'education' && draft.education.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Formation' : 'Education');
      for (const item of draft.education) {
        drawEntryHeader(item.school, item.period);
        drawEntryHeader(item.degree, item.location);
        if (item.details.trim()) drawLines(item.details.trim(), 9.2);
        y -= 4;
      }
    }

    if (sectionKey === 'projects' && draft.projects.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Projets sélectionnés' : 'Selected Projects');
      for (const item of draft.projects) {
        drawEntryHeader(item.name, item.period || '');
        for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
        y -= 4;
      }
    }

    if (sectionKey === 'experience' && draft.experience.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Expérience' : 'Experience');
      for (const item of draft.experience) {
        drawEntryHeader(item.role + ' — ' + item.company, item.period);
        if (item.location) drawLines(item.location, 9.2);
        for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
        y -= 4;
      }
    }

    if (sectionKey === 'leadership' && draft.leadership?.length) {
      drawSectionTitle('Leadership');
      for (const item of draft.leadership) {
        drawEntryHeader([item.role, item.organization].filter(Boolean).join(' — '), item.period);
        for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
        y -= 4;
      }
    }

    if (sectionKey === 'skills' && draft.skills.trim()) {
      drawSectionTitle(draft.language === 'FR' ? 'Compétences techniques' : 'Technical Skills');
      for (const line of draft.skills.split('\n').filter((value) => value.trim())) drawLines(line.trim(), 9.5);
    }

    if (sectionKey === 'languages' && draft.languages.trim()) {
      drawSectionTitle(draft.language === 'FR' ? 'Langues' : 'Languages');
      drawLines(draft.languages.trim(), 9.5);
    }

    if (sectionKey === 'interests' && draft.interests.trim()) {
      drawSectionTitle(draft.language === 'FR' ? 'Centres d’intérêt' : 'Interests');
      drawLines(draft.interests.trim(), 9.5);
    }
  }

  return pdf.save();
}


export function cvPdfFileName(name: string): string {
  return safeFileName(name) + '_CV.pdf';
}
