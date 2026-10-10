import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CoverLetterDraft } from './clStorage';

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MX = 56.69;
const TOP = 56.69;
const BOTTOM = 56.69;

export function normalizeCoverLetterPdfText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00B7/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF\u0152\u0153\u20AC]/g, '');
}

export function coverLetterPdfFileName(draft: CoverLetterDraft): string {
  const signer = normalizeCoverLetterPdfText(draft.signer).trim().replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'MonStage';
  return signer + '_CL_' + draft.language + '.pdf';
}

function wrap(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = normalizeCoverLetterPdfText(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = words[0];
  for (let index = 1; index < words.length; index += 1) {
    const candidate = line + ' ' + words[index];
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else {
      lines.push(line);
      line = words[index];
    }
  }
  lines.push(line);
  return lines;
}

function dataUrlBytes(dataUrl: string): { bytes: Uint8Array; type: 'png' | 'jpeg' } | null {
  const match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/i);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { bytes, type: match[1].toLowerCase() as 'png' | 'jpeg' };
}

export async function buildCoverLetterPdfBytes(draft: CoverLetterDraft): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([WIDTH, HEIGHT]);
  const color = rgb(0.05, 0.05, 0.05);
  const lineColor = rgb(0.55, 0.55, 0.55);
  const usable = WIDTH - (MX * 2);
  let y = HEIGHT - TOP;

  const ensure = (height: number) => {
    if (y - height < BOTTOM) {
      page = pdf.addPage([WIDTH, HEIGHT]);
      y = HEIGHT - TOP;
    }
  };

  const drawWrapped = (value: string, size = 10.4, font = regular, leading = 14.1, x = MX, maxWidth = usable) => {
    const wrapped = wrap(value, maxWidth, font, size);
    ensure(wrapped.length * leading + 4);
    for (const line of wrapped) {
      page.drawText(line, { x, y, size, font, color });
      y -= leading;
    }
  };

  const drawRight = (value: string, size: number, font: any, right = WIDTH - MX) => {
    const text = normalizeCoverLetterPdfText(value);
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: right - width, y, size, font, color });
    y -= size + 3.4;
  };

  if (draft.language === 'FR') {
    const senderLines = [
      { text: draft.signer || 'Denos Kume', size: 17.5, font: bold },
      { text: 'Nantes, France', size: 9.3, font: regular },
      { text: '+33 6 62 91 94 68', size: 9.3, font: regular },
      { text: 'denoskume@yahoo.com', size: 9.3, font: regular },
      { text: 'github.com/denoskume', size: 9.3, font: regular },
      { text: 'linkedin.com/in/denoskume', size: 9.3, font: regular },
    ];
    for (const line of senderLines) {
      page.drawText(normalizeCoverLetterPdfText(line.text), { x: MX, y, size: line.size, font: line.font, color });
      y -= line.size + 3.4;
    }

    y -= 2;
    const recipientX = WIDTH - MX - 225;
    const recipientWidth = 225;
    if (draft.recipientName) {
      drawWrapped('À l’attention de ' + draft.recipientName, 10.2, bold, 13.6, recipientX, recipientWidth);
    }
    const recipientCompany = [draft.recipientRole, draft.company].filter(Boolean).join(' - ');
    if (recipientCompany) drawWrapped(recipientCompany, 10.2, bold, 13.6, recipientX, recipientWidth);
    if (draft.recipientLocation) drawWrapped(draft.recipientLocation, 10.2, regular, 13.6, recipientX, recipientWidth);
  } else {
    drawRight(draft.signer || 'Denos Kume', 17.5, bold);
    drawRight('Nantes, France', 9.3, regular);
    drawRight('+33 6 62 91 94 68', 9.3, regular);
    drawRight('denoskume@yahoo.com', 9.3, regular);
    drawRight('github.com/denoskume', 9.3, regular);
    drawRight('linkedin.com/in/denoskume', 9.3, regular);

    y -= 4;
    if (draft.recipientName) drawWrapped(draft.recipientName, 10.2, bold, 13.6);
    const recipientCompany = [draft.recipientRole, draft.company].filter(Boolean).join(' - ');
    if (recipientCompany) drawWrapped(recipientCompany, 10.2, bold, 13.6);
    if (draft.recipientLocation) drawWrapped(draft.recipientLocation, 10.2, regular, 13.6);
  }

  y -= 18;
  if (draft.date) {
    const dateText = draft.language === 'FR' ? 'Nantes, le ' + normalizeCoverLetterPdfText(draft.date) : 'Nantes, ' + normalizeCoverLetterPdfText(draft.date);
    const width = regular.widthOfTextAtSize(dateText, 10.2);
    page.drawText(dateText, { x: WIDTH - MX - width, y, size: 10.2, font: regular, color });
  }
  y -= 28;

  const subject = draft.language === 'FR'
    ? 'Objet : Candidature au stage ' + (draft.internshipTitle || '[INTITULE DU STAGE]')
    : 'Re: Application for ' + (draft.internshipTitle || '[INTERNSHIP TITLE]');
  drawWrapped(subject, 10.8, bold, 14.5);
  page.drawLine({ start: { x: MX, y: y + 6 }, end: { x: WIDTH - MX, y: y + 6 }, thickness: 0.55, color: lineColor });
  y -= 14;

  drawWrapped(draft.greeting || (draft.language === 'FR' ? 'Madame, Monsieur,' : 'Dear Hiring Manager,'), 10.4, regular, 14.1);
  y -= 4;

  for (const paragraph of draft.paragraphs.filter((value) => value?.trim())) {
    drawWrapped(paragraph, 10.4, regular, 14.1);
    y -= 7;
  }

  y += 2;
  drawWrapped(
    draft.closing || (draft.language === 'FR'
      ? 'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.'
      : 'Sincerely,'),
    10.4,
    regular,
    14.1
  );
  y -= 8;

  if (draft.signatureDataUrl) {
    const signatureData = dataUrlBytes(draft.signatureDataUrl);
    if (signatureData) {
      const signature = signatureData.type === 'png'
        ? await pdf.embedPng(signatureData.bytes)
        : await pdf.embedJpg(signatureData.bytes);
      const maxWidth = 150;
      const maxHeight = 58;
      const scale = Math.min(maxWidth / signature.width, maxHeight / signature.height, 1);
      const width = signature.width * scale;
      const height = signature.height * scale;
      ensure(height + 8);
      const signatureX = draft.language === 'FR' ? WIDTH - MX - width : MX;
      page.drawImage(signature, { x: signatureX, y: y - height, width, height });
    }
  }

  return pdf.save();
}
