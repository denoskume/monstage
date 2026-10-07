import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type CvDraft = {
  language?: 'FR' | 'EN';
  name?: string;
  headline?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  education?: Array<{ school?: string; degree?: string; location?: string; period?: string; details?: string }>;
  experience?: Array<{ role?: string; company?: string; location?: string; period?: string; bullets?: string[] }>;
  projects?: Array<{ name?: string; period?: string; bullets?: string[] }>;
  leadership?: Array<{ role?: string; organization?: string; period?: string; bullets?: string[] }>;
  skills?: string;
  languages?: string;
  interests?: string;
};

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MX = 42;
const TOP = 42;
const BOTTOM = 42;

function safeText(value: unknown): string {
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

function safeFileName(value: unknown): string {
  return safeText(value).trim().replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'MonStage_CV';
}

function wrap(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = safeText(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = line + ' ' + words[i];
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else { lines.push(line); line = words[i]; }
  }
  lines.push(line);
  return lines;
}

export async function buildCvPdfResponse(draft: CvDraft, origin: string | null): Promise<Response> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([WIDTH, HEIGHT]);
  let y = HEIGHT - TOP;
  const text = rgb(0.07, 0.07, 0.07);
  const rule = rgb(0.25, 0.25, 0.25);
  const usable = WIDTH - (MX * 2);

  const ensure = (h: number) => {
    if (y - h < BOTTOM) {
      page = pdf.addPage([WIDTH, HEIGHT]);
      y = HEIGHT - TOP;
    }
  };
  const centered = (value: string, size: number, font: any) => {
    const t = safeText(value);
    const width = font.widthOfTextAtSize(t, size);
    page.drawText(t, { x: Math.max(MX, (WIDTH - width) / 2), y, size, font, color: text });
    y -= size + 5;
  };
  const lines = (value: string, size = 9.5, font = regular, indent = 0, leading = size + 3) => {
    const wrapped = wrap(value, usable - indent, font, size);
    ensure(wrapped.length * leading + 4);
    for (const line of wrapped) {
      page.drawText(line, { x: MX + indent, y, size, font, color: text });
      y -= leading;
    }
  };
  const section = (title: string) => {
    ensure(24);
    y -= 4;
    page.drawText(safeText(title.toUpperCase()), { x: MX, y, size: 10.5, font: bold, color: text });
    y -= 5;
    page.drawLine({ start: { x: MX, y }, end: { x: WIDTH - MX, y }, thickness: 0.8, color: rule });
    y -= 12;
  };
  const right = (value: string, yValue: number, size = 9.5, font = regular) => {
    const t = safeText(value);
    page.drawText(t, { x: WIDTH - MX - font.widthOfTextAtSize(t, size), y: yValue, size, font, color: text });
  };
  const entry = (left: string, r: string) => {
    ensure(18);
    page.drawText(safeText(left), { x: MX, y, size: 9.5, font: bold, color: text });
    if (r) right(r, y);
    y -= 13;
  };
  const bullet = (value: string) => {
    const wrapped = wrap(value, usable - 12, regular, 9.2);
    ensure(wrapped.length * 12 + 3);
    page.drawText('-', { x: MX, y, size: 9.2, font: regular, color: text });
    for (const line of wrapped) {
      page.drawText(line, { x: MX + 12, y, size: 9.2, font: regular, color: text });
      y -= 12;
    }
  };

  centered(draft.name || 'CV', 18, bold);
  centered(draft.headline || '', 10.5, bold);
  centered([draft.location, draft.email, draft.phone, draft.linkedin, draft.github].filter(Boolean).join(' | '), 8.5, regular);
  y -= 2;
  page.drawLine({ start: { x: MX, y }, end: { x: WIDTH - MX, y }, thickness: 1, color: text });
  y -= 12;

  if (draft.summary?.trim()) { section(draft.language === 'FR' ? 'Profil' : 'Professional Summary'); lines(draft.summary); }

  if (draft.education?.length) {
    section(draft.language === 'FR' ? 'Formation' : 'Education');
    for (const item of draft.education) {
      entry(item.school || '', item.period || '');
      entry(item.degree || '', item.location || '');
      if (item.details?.trim()) lines(item.details, 9.2);
      y -= 4;
    }
  }

  if (draft.experience?.length) {
    section(draft.language === 'FR' ? 'Expérience' : 'Experience');
    for (const item of draft.experience) {
      entry([item.role, item.company].filter(Boolean).join(' - '), item.period || '');
      if (item.location) lines(item.location, 9.2);
      for (const b of (item.bullets || []).filter((v) => v?.trim())) bullet(b);
      y -= 4;
    }
  }

  if (draft.projects?.length) {
    section(draft.language === 'FR' ? 'Projets sélectionnés' : 'Selected Projects');
    for (const item of draft.projects) {
      entry(item.name || '', item.period || '');
      for (const b of (item.bullets || []).filter((v) => v?.trim())) bullet(b);
      y -= 4;
    }
  }

  if (draft.leadership?.length) {
    section('Leadership');
    for (const item of draft.leadership) {
      entry([item.role, item.organization].filter(Boolean).join(' - '), item.period || '');
      for (const b of (item.bullets || []).filter((v) => v?.trim())) bullet(b);
      y -= 4;
    }
  }

  if (draft.skills?.trim()) {
    section(draft.language === 'FR' ? 'Compétences techniques' : 'Technical Skills');
    for (const skillLine of draft.skills.split('\n').map((line) => line.trim()).filter(Boolean)) lines(skillLine);
  }
  if (draft.languages?.trim()) { section(draft.language === 'FR' ? 'Langues' : 'Languages'); lines(draft.languages); }
  if (draft.interests?.trim()) { section(draft.language === 'FR' ? 'Centres d’intérêt' : 'Interests'); lines(draft.interests); }

  const bytes = await pdf.save();
  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="' + safeFileName(draft.name) + '_CV.pdf"',
    'Cache-Control': 'no-store',
  });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Response(body, { status: 200, headers });
}
