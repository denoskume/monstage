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

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
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

export async function downloadCvPdf(draft: CvDraft): Promise<void> {
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
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: Math.max(MARGIN_X, (A4_WIDTH - width) / 2), y, size, font, color: textColor });
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
    page.drawText(title.toUpperCase(), { x: MARGIN_X, y, size: 10.5, font: bold, color: textColor });
    y -= 5;
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: A4_WIDTH - MARGIN_X, y }, thickness: 0.8, color: ruleColor });
    y -= 12;
  };

  const drawRightAligned = (text: string, yValue: number, size = 9.5, font = regular) => {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: A4_WIDTH - MARGIN_X - width, y: yValue, size, font, color: textColor });
  };

  const drawEntryHeader = (left: string, right: string) => {
    ensureSpace(18);
    page.drawText(left, { x: MARGIN_X, y, size: 9.5, font: bold, color: textColor });
    if (right) drawRightAligned(right, y, 9.5, regular);
    y -= 13;
  };

  const drawBullet = (text: string) => {
    const bulletIndent = 12;
    const lines = wrapText(text, usableWidth - bulletIndent, regular, 9.2);
    ensureSpace(lines.length * 12 + 3);
    page.drawText('•', { x: MARGIN_X, y, size: 9.2, font: regular, color: textColor });
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
    drawSectionTitle('Professional Summary');
    drawLines(draft.summary.trim(), 9.5);
  }

  if (draft.education.length) {
    drawSectionTitle('Education');
    for (const item of draft.education) {
      drawEntryHeader(item.school, item.period);
      drawEntryHeader(item.degree, item.location);
      if (item.details.trim()) drawLines(item.details.trim(), 9.2);
      y -= 4;
    }
  }

  if (draft.experience.length) {
    drawSectionTitle('Experience');
    for (const item of draft.experience) {
      drawEntryHeader(item.role + ' — ' + item.company, item.period);
      if (item.location) drawLines(item.location, 9.2);
      for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
      y -= 4;
    }
  }

  if (draft.projects.length) {
    drawSectionTitle('Selected Projects');
    for (const item of draft.projects) {
      drawEntryHeader(item.name, '');
      for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
      y -= 4;
    }
  }

  if (draft.skills.trim()) {
    drawSectionTitle('Technical Skills');
    drawLines(draft.skills.trim(), 9.5);
  }

  if (draft.languages.trim()) {
    drawSectionTitle('Languages');
    drawLines(draft.languages.trim(), 9.5);
  }

  const bytes = await pdf.save();
  const pdfBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeFileName(draft.name) + '_CV.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
