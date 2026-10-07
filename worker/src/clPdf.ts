import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type CoverLetterDraft = {
  language?: 'FR' | 'EN';
  date?: string;
  company?: string;
  team?: string;
  recipientName?: string;
  recipientRole?: string;
  recipientLocation?: string;
  internshipTitle?: string;
  greeting?: string;
  paragraphs?: string[];
  closing?: string;
  signer?: string;
  signatureDataUrl?: string;
};

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MX = 56.69;
const TOP = 56.69;
const BOTTOM = 56.69;

function safeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00B7/g, '-')
    .replace(/[^\x20-\x7E]/g, '');
}

function safeFileName(value: unknown): string {
  return safeText(value).trim().replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'MonStage_CL';
}

function wrap(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = safeText(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = words[0];
  for (let index = 1; index < words.length; index += 1) {
    const candidate = line + ' ' + words[index];
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else { lines.push(line); line = words[index]; }
  }
  lines.push(line);
  return lines;
}

export async function buildCoverLetterPdfResponse(draft: CoverLetterDraft, origin: string | null): Promise<Response> {
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
    const text = safeText(value);
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: right - width, y, size, font, color });
    y -= size + 3.4;
  };

  drawRight(draft.signer || 'Denos Kume', 17.5, bold);
  drawRight('Nantes, France', 9.3, regular);
  drawRight('+33 6 62 91 94 68', 9.3, regular);
  drawRight('denoskume@yahoo.com', 9.3, regular);
  drawRight('github.com/denoskume', 9.3, regular);
  drawRight('linkedin.com/in/denoskume', 9.3, regular);

  y -= 4;
  const recipientTop = y;
  if (draft.recipientName) {
    const recipientLabel = draft.language === 'FR'
      ? 'A l’attention de ' + draft.recipientName
      : 'Attn: ' + draft.recipientName;
    drawWrapped(recipientLabel, 10.2, bold, 13.6);
  }
  const recipientCompany = [draft.recipientRole, draft.company].filter(Boolean).join(' - ');
  if (recipientCompany) drawWrapped(recipientCompany, 10.2, bold, 13.6);
  if (draft.recipientLocation) drawWrapped(draft.recipientLocation, 10.2, regular, 13.6);

  const recipientBottom = y;
  y = recipientTop - 50;
  if (draft.date) {
    const dateText = draft.language === 'FR'
      ? 'Nantes, le ' + safeText(draft.date)
      : 'Nantes, ' + safeText(draft.date);
    const width = regular.widthOfTextAtSize(dateText, 10.2);
    page.drawText(dateText, { x: WIDTH - MX - width, y, size: 10.2, font: regular, color });
  }
  y = Math.min(recipientBottom - 34, y - 35);

  const subject = draft.language === 'FR'
    ? 'Objet : Candidature au stage ' + (draft.internshipTitle || '[INTITULE DU STAGE]')
    : 'Re: Application for ' + (draft.internshipTitle || '[INTERNSHIP TITLE]');
  drawWrapped(subject, 10.8, bold, 14.5);
  page.drawLine({ start: { x: MX, y: y + 6 }, end: { x: WIDTH - MX, y: y + 6 }, thickness: 0.55, color: lineColor });
  y -= 14;

  drawWrapped(draft.greeting || (draft.language === 'FR' ? 'Madame, Monsieur,' : 'Dear Hiring Manager,'), 10.4, regular, 14.1);
  y -= 4;

  for (const paragraph of (draft.paragraphs || []).filter((value) => value?.trim())) {
    drawWrapped(paragraph, 10.4, regular, 14.1);
    y -= 7;
  }

  y += 2;
  drawWrapped(draft.closing || (draft.language === 'FR' ? 'Cordialement,' : 'Sincerely,'), 10.4, regular, 14.1);
  y -= 4;

  if (draft.signatureDataUrl) {
    const match = draft.signatureDataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/i);
    if (match) {
      const imageBytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
      const signature = match[1].toLowerCase() === 'png'
        ? await pdf.embedPng(imageBytes)
        : await pdf.embedJpg(imageBytes);
      const maxWidth = 150;
      const maxHeight = 58;
      const scale = Math.min(maxWidth / signature.width, maxHeight / signature.height, 1);
      const width = signature.width * scale;
      const height = signature.height * scale;
      ensure(height + 8);
      page.drawImage(signature, { x: MX, y: y - height, width, height });
      y -= height + 8;
    }
  }

  const bytes = await pdf.save();
  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="' + safeFileName(draft.signer || 'Denos_Kume') + '_CL_' + (draft.language || 'EN') + '.pdf"',
    'Cache-Control': 'no-store',
  });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Response(body, { status: 200, headers });
}
