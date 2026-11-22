import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CoverLetterDraft } from './clStorage';
import { cvPageColorHex } from '../cv/cvStorage';

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MX = 56.69;
const TOP = 56.69;
const BOTTOM = 56.69;
// A discreet 0.55 cm first-line retreat, applied only to letter paragraphs.
export const LETTER_FIRST_LINE_INDENT = 16;

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

export function wrapCoverLetterLines(text: string, maxWidth: number, font: any, size: number, firstLineIndent = 0): string[] {
  const words = normalizeCoverLetterPdfText(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = words[0];
  for (let index = 1; index < words.length; index += 1) {
    const candidate = line + ' ' + words[index];
    // The opening line is narrower because it starts after the indent.
    const availableWidth = maxWidth - (lines.length === 0 ? firstLineIndent : 0);
    if (font.widthOfTextAtSize(candidate, size) <= availableWidth) line = candidate;
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
  const template = draft.template ?? 'classic';
  const modern = template === 'modern';
  const minimal = template === 'minimal';
  const ats = template === 'keywords';
  const color = rgb(0.05, 0.05, 0.05);
  const accentColor = modern ? rgb(0.14, 0.30, 0.44) : color;
  const lineColor = modern ? rgb(0.36, 0.54, 0.68) : rgb(0.55, 0.55, 0.55);
  const usable = WIDTH - (MX * 2);
  const paper = cvPageColorHex(draft.pageColor);
  let page = pdf.addPage([WIDTH, HEIGHT]);
  let y = HEIGHT - TOP;

  // Paint the complete sheet, including any overflow pages, before drawing text.
  const paintPaper = () => {
    if (paper === '#FFFFFF') return;
    page.drawRectangle({
      x: 0, y: 0, width: WIDTH, height: HEIGHT,
      color: rgb(
        parseInt(paper.slice(1, 3), 16) / 255,
        parseInt(paper.slice(3, 5), 16) / 255,
        parseInt(paper.slice(5, 7), 16) / 255,
      ),
    });
  };
  paintPaper();

  const ensure = (height: number) => {
    if (y - height < BOTTOM) {
      page = pdf.addPage([WIDTH, HEIGHT]);
      paintPaper();
      y = HEIGHT - TOP;
    }
  };

  const drawWrapped = (value: string, size = 10.4, font = regular, leading = 14.1, x = MX, maxWidth = usable, ink = color) => {
    const wrapped = wrapCoverLetterLines(value, maxWidth, font, size);
    ensure(wrapped.length * leading + 4);
    for (const line of wrapped) {
      page.drawText(line, { x, y, size, font, color: ink });
      y -= leading;
    }
  };
  const drawJustifiedParagraph = (value: string, size = 10.4, font = regular, leading = 14.1, x = MX, maxWidth = usable, firstLineIndent = 0) => {
    const wrapped = wrapCoverLetterLines(value, maxWidth, font, size, firstLineIndent);
    ensure(wrapped.length * leading + 4);

    wrapped.forEach((line, lineIndex) => {
      const isLastLine = lineIndex === wrapped.length - 1;
      const indent = lineIndex === 0 ? firstLineIndent : 0;
      const lineX = x + indent;
      const lineWidth = maxWidth - indent;
      const words = line.split(/\s+/).filter(Boolean);

      if (isLastLine || words.length < 2) {
        page.drawText(line, { x: lineX, y, size, font, color });
      } else {
        const wordsWidth = words.reduce((sum, word) => sum + font.widthOfTextAtSize(word, size), 0);
        const gap = (lineWidth - wordsWidth) / (words.length - 1);
        let cursorX = lineX;
        for (const word of words) {
          page.drawText(word, { x: cursorX, y, size, font, color });
          cursorX += font.widthOfTextAtSize(word, size) + gap;
        }
      }

      y -= leading;
    });
  };

  const drawRight = (value: string, size: number, font: any, right = WIDTH - MX) => {
    const text = normalizeCoverLetterPdfText(value);
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: right - width, y, size, font, color: modern && font === bold ? accentColor : color });
    y -= size + 3.4;
  };

  if (draft.language === 'FR') {
    const senderLines = [
      { text: draft.signer || 'Denos Kume', size: 17.5, font: bold },
      { text: (draft.senderLocation ?? 'Nantes, France'), size: 9.3, font: regular },
      { text: (draft.senderPhone ?? '+33 6 62 91 94 68'), size: 9.3, font: regular },
      { text: ('kamenan.kume@eleves.ec-nantes.fr'), size: 9.3, font: regular },
      { text: (draft.senderGithub ?? 'github.com/denoskume'), size: 9.3, font: regular },
      { text: (draft.senderLinkedin ?? 'linkedin.com/in/denoskume'), size: 9.3, font: regular },
    ];
    for (const line of senderLines) {
      if (!line.text.trim()) continue;
      page.drawText(normalizeCoverLetterPdfText(line.text), { x: MX, y, size: line.size, font: line.font, color: modern && line.font === bold ? accentColor : color });
      y -= line.size + 3.4;
    }

    y -= 2;
    // Recipient lines share the same right margin as the French date.
    const drawRecipientRight = (value: string, font = regular) => {
      const lines = wrapCoverLetterLines(value, 225, font, 10.2);
      ensure(lines.length * 13.6 + 4);
      for (const line of lines) {
        const text = normalizeCoverLetterPdfText(line);
        page.drawText(text, {
          x: ats ? MX : WIDTH - MX - font.widthOfTextAtSize(text, 10.2),
          y, size: 10.2, font, color: modern && font === bold ? accentColor : color,
        });
        y -= 13.6;
      }
    };
    if (draft.recipientName) drawRecipientRight('À l’attention de ' + draft.recipientName, bold);
    if (draft.company) drawRecipientRight(draft.company, bold);
    if (draft.team && !/équipe souhaitée, non confirmée/i.test(draft.team)) drawRecipientRight(draft.team);
    if (draft.recipientRole) drawRecipientRight(draft.recipientRole);
    if (draft.recipientLocation) drawRecipientRight(draft.recipientLocation);
  } else {
    drawRight(draft.signer || 'Denos Kume', 17.5, bold);
    if ((draft.senderLocation ?? 'Nantes, France').trim()) drawRight(draft.senderLocation ?? 'Nantes, France', 9.3, regular);
    if ((draft.senderPhone ?? '+33 6 62 91 94 68').trim()) drawRight(draft.senderPhone ?? '+33 6 62 91 94 68', 9.3, regular);
    if ((draft.senderEmail ?? 'kamenan.kume@eleves.ec-nantes.fr').trim()) drawRight(draft.senderEmail ?? 'kamenan.kume@eleves.ec-nantes.fr', 9.3, regular);
    if ((draft.senderGithub ?? 'github.com/denoskume').trim()) drawRight(draft.senderGithub ?? 'github.com/denoskume', 9.3, regular);
    if ((draft.senderLinkedin ?? 'linkedin.com/in/denoskume').trim()) drawRight(draft.senderLinkedin ?? 'linkedin.com/in/denoskume', 9.3, regular);

    y -= 4;
    if (draft.recipientName) drawWrapped(draft.recipientName, 10.2, bold, 13.6);
    const recipientCompany = [draft.recipientRole, draft.company].filter(Boolean).join(' - ');
    if (recipientCompany) drawWrapped(recipientCompany, 10.2, bold, 13.6);
    if (draft.team && !/équipe souhaitée, non confirmée/i.test(draft.team)) drawWrapped(draft.team, 10.2, regular, 13.6);
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
    ? 'Objet : ' + (/^Candidature/i.test(draft.internshipTitle) ? draft.internshipTitle : 'Candidature — ' + (draft.internshipTitle || '[INTITULE DU STAGE]'))
    : 'Re: Application for ' + (draft.internshipTitle || '[INTERNSHIP TITLE]');
  drawWrapped(subject, 10.8, bold, 14.5, MX, usable, accentColor);
  if (!minimal && !ats) {
    page.drawLine({ start: { x: MX, y: y + 6 }, end: { x: WIDTH - MX, y: y + 6 }, thickness: modern ? 1.6 : 0.55, color: lineColor });
  }
  y -= minimal || ats ? 10 : 14;

  drawWrapped(draft.greeting || (draft.language === 'FR' ? 'Madame, Monsieur,' : 'Dear Hiring Manager,'), 10.4, regular, 14.1);
  y -= 4;

  for (const paragraph of draft.paragraphs.filter((value) => value?.trim())) {
    drawJustifiedParagraph(paragraph, 10.4, regular, 14.1, MX, usable, LETTER_FIRST_LINE_INDENT);
    y -= 7;
  }

  y += 2;
  const closingText = draft.closing || (draft.language === 'FR'
    ? 'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.'
    : 'Sincerely,');

  if (draft.language === 'FR') {
    drawJustifiedParagraph(closingText, 10.4, regular, 14.1, MX, usable, LETTER_FIRST_LINE_INDENT);
  } else {
    drawWrapped(closingText, 10.4, regular, 14.1);
  }
  y -= 2;

  const signerText = normalizeCoverLetterPdfText(draft.signer || 'Denos Kume');
  const signatureRightAligned = draft.language === 'FR';

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
      ensure(height + 24);
      const signatureX = signatureRightAligned ? WIDTH - MX - width : MX;
      page.drawImage(signature, { x: signatureX, y: y - height, width, height });
      y -= height + 6;
    }
  }

  ensure(18);
  const signerWidth = bold.widthOfTextAtSize(signerText, 10.4);
  const signerX = signatureRightAligned ? WIDTH - MX - signerWidth : MX;
  page.drawText(signerText, { x: signerX, y, size: 10.4, font: bold, color });

  return pdf.save();
}
