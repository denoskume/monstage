import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type CoverLetterDraft = {
  language?: 'FR' | 'EN';
  date?: string;
  company?: string;
  team?: string;
  internshipTitle?: string;
  greeting?: string;
  paragraphs?: string[];
  closing?: string;
  signer?: string;
  signatureDataUrl?: string;
};

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MX = 52;
const TOP = 52;
const BOTTOM = 52;

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
  let y = HEIGHT - TOP;
  const color = rgb(0.07, 0.07, 0.07);
  const usable = WIDTH - (MX * 2);

  const ensure = (height: number) => {
    if (y - height < BOTTOM) {
      page = pdf.addPage([WIDTH, HEIGHT]);
      y = HEIGHT - TOP;
    }
  };

  const drawLines = (value: string, size = 10.5, font = regular, leading = 15) => {
    const lines = wrap(value, usable, font, size);
    ensure(lines.length * leading + 6);
    for (const line of lines) {
      page.drawText(line, { x: MX, y, size, font, color });
      y -= leading;
    }
  };

  const drawCentered = (value: string, size: number, font: any) => {
    const text = safeText(value);
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: Math.max(MX, (WIDTH - width) / 2), y, size, font, color });
    y -= size + 5;
  };

  drawCentered(draft.signer || 'Denos Kume', 17, bold);
  drawCentered('Nantes, France | denoskume@yahoo.com', 9.5, regular);
  y -= 10;

  if (draft.date) {
    drawLines(draft.date, 10, regular, 14);
    y -= 4;
  }

  const recipient = [draft.company, draft.team].filter(Boolean).join(' - ');
  if (recipient) {
    drawLines(recipient, 10.5, bold, 14);
    y -= 6;
  }

  const subject = draft.language === 'FR'
    ? 'Objet : Candidature - ' + (draft.internshipTitle || '[INTITULE DU STAGE]')
    : 'Re: Application for ' + (draft.internshipTitle || '[INTERNSHIP TITLE]');
  drawLines(subject, 10.5, bold, 14);
  y -= 12;

  drawLines(draft.greeting || (draft.language === 'FR' ? 'Madame, Monsieur,' : 'Dear Hiring Manager,'), 10.5, regular, 15);
  y -= 8;

  for (const paragraph of (draft.paragraphs || []).filter((value) => value?.trim())) {
    drawLines(paragraph, 10.5, regular, 15);
    y -= 10;
  }

  y -= 4;
  drawLines(draft.closing || (draft.language === 'FR' ? 'Cordialement,' : 'Sincerely,'), 10.5, regular, 15);
  y -= 8;

  if (draft.signatureDataUrl) {
    const match = draft.signatureDataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/i);
    if (match) {
      const imageBytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
      const signature = match[1].toLowerCase() === 'png'
        ? await pdf.embedPng(imageBytes)
        : await pdf.embedJpg(imageBytes);
      const maxWidth = 120;
      const maxHeight = 48;
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
