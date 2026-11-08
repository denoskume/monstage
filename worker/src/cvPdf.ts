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
  education?: Array<{ school?: string; degree?: string; location?: string; period?: string; details?: string; keyCourses?: string; bullets?: string[] }>;
  experience?: Array<{ role?: string; company?: string; location?: string; period?: string; bullets?: string[] }>;
  projects?: Array<{ name?: string; period?: string; bullets?: string[] }>;
  leadership?: Array<{ role?: string; organization?: string; period?: string; bullets?: string[] }>;
  skills?: string;
  languages?: string;
  interests?: string;
  sectionOrder?: Array<'education' | 'projects' | 'experience' | 'leadership' | 'skills' | 'languages' | 'interests'>;
};

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MX = 42;
const TOP = 42;
const BOTTOM = 42;

function safeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '•')
    .replace(/\u00B7/g, '•')
    .replace(/\u00B2/g, '2')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF\u0152\u0153\u2022\u20AC\u2022]/g, '');
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
    const tokens = richTokens(value, font);
    const width = tokens.reduce((n, part) => n + part.font.widthOfTextAtSize(part.value, size), 0);
    let x = Math.max(MX, (WIDTH - width) / 2);
    for (const part of tokens) {
      page.drawText(part.value, { x, y, size, font: part.font, color: text });
      x += part.font.widthOfTextAtSize(part.value, size);
    }
    y -= size + 5;
  };
  const richTokens = (raw: string, defaultFont = regular) =>
    raw.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).flatMap((part) => {
      const emphasized = part.startsWith('**') && part.endsWith('**');
      const font = emphasized ? bold : defaultFont;
      return (safeText(emphasized ? part.slice(2, -2) : part).match(/\s+|\S+/g) || [])
        .map((value) => ({ value, font }));
    });
  const richSingle = (raw: string, left: number, baseSize: number, widthLimit: number, defaultFont = regular) => {
    const tokens = richTokens(raw, defaultFont);
    const width = tokens.reduce((n, p) => n + p.font.widthOfTextAtSize(p.value, baseSize), 0);
    const size = width > widthLimit ? baseSize * widthLimit / width : baseSize;
    let x = left;
    for (const part of tokens) {
      page.drawText(part.value, { x, y, size, font: part.font, color: text });
      x += part.font.widthOfTextAtSize(part.value, size);
    }
  };
  const lines = (value: string, size = 9.5, font = regular, indent = 0, leading = size + 3) => {
    for (const [index, paragraph] of value.split('\n').filter(Boolean).entries()) {
      if (index) y -= leading / 2;
      let x = MX + indent;
      let started = false;
      ensure(leading + 4);
      for (const part of richTokens(paragraph, font)) {
        if (!started && !part.value.trim()) continue;
        const width = part.font.widthOfTextAtSize(part.value, size);
        if (started && x + width > MX + usable) {
          y -= leading;
          ensure(leading + 4);
          x = MX + indent;
          started = false;
          if (!part.value.trim()) continue;
        }
        page.drawText(part.value, { x, y, size, font: part.font, color: text });
        x += width;
        started = true;
      }
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
    const tokens = richTokens(value, font);
    const width = tokens.reduce((n, part) => n + part.font.widthOfTextAtSize(part.value, size), 0);
    let x = WIDTH - MX - width;
    for (const part of tokens) {
      page.drawText(part.value, { x, y: yValue, size, font: part.font, color: text });
      x += part.font.widthOfTextAtSize(part.value, size);
    }
  };
  const entry = (left: string, r: string) => {
    ensure(18);
    richSingle(left, MX, 9.5, usable - (r ? 100 : 0), bold);
    if (r) right(r, y);
    y -= 13;
  };
  const bullet = (value: string) => {
    ensure(16);
    page.drawCircle({ x: MX + 2.4, y: y + 3.4, size: 1.7, color: text });
    lines(value, 9.2, regular, 12, 12);
  };

  // Experience entries must occupy exactly one line per bullet, without dropping text.
  const experienceBullet = (value: string) => {
    if (!value.trim()) return;
    ensure(15);
    page.drawCircle({ x: MX + 2.4, y: y + 3.4, size: 1.7, color: text });
    richSingle(value, MX + 12, 9.2, usable - 12);
    y -= 12;
  };

  centered(draft.name || 'CV', 18, bold);
  centered(draft.headline || '', 10.5, bold);
  centered([draft.location, draft.email, draft.phone, draft.linkedin, draft.github].filter(Boolean).join(' | '), 8.5, regular);
  // Keep the header open and separated from the profile without a horizontal rule.
  y -= 20;

  if (draft.summary?.trim()) { section(draft.language === 'FR' ? 'Profil' : 'Profile'); lines(draft.summary); }

  const sectionOrder = draft.sectionOrder?.length
    ? draft.sectionOrder
    : ['education', 'projects', 'experience', 'skills', 'languages', 'leadership', 'interests'];

  for (const sectionKey of sectionOrder) {
    if (sectionKey === 'education' && draft.education?.length) {
      section(draft.language === 'FR' ? 'Formation' : 'Education');
      for (const item of draft.education) {
        entry(item.school || '', item.period || '');
        entry(item.degree || '', item.location || '');
        if (item.details?.trim()) lines(item.details, 9.2);
        if (item.keyCourses?.trim()) lines((draft.language === 'FR' ? '**Cours clés :** ' : '**Key courses:** ') + item.keyCourses.trim(), 9.2);
        y -= 4;
      }
    }

    if (sectionKey === 'projects' && draft.projects?.length) {
      section(draft.language === 'FR' ? 'Projets sélectionnés' : 'Selected Projects');
      for (const item of draft.projects) {
        entry(item.name || '', item.period || '');
        for (const b of (item.bullets || []).filter((v) => v?.trim())) bullet(b);
        y -= 4;
      }
    }

    if (sectionKey === 'experience' && draft.experience?.length) {
      section(draft.language === 'FR' ? 'Expérience' : 'Experience');
      for (const item of draft.experience) {
        entry([item.role, item.company].filter(Boolean).join(' - '), item.period || '');
        if (item.location) lines(item.location, 9.2);
        for (const b of (item.bullets || []).filter((v) => v?.trim())) experienceBullet(b);
        y -= 4;
      }
    }

    if (sectionKey === 'leadership' && draft.leadership?.length) {
      section('Leadership');
      for (const item of draft.leadership) {
        entry([item.role, item.organization].filter(Boolean).join(' - '), item.period || '');
        for (const b of (item.bullets || []).filter((v) => v?.trim())) bullet(b);
        y -= 4;
      }
    }

    if (sectionKey === 'skills' && draft.skills?.trim()) {
      section(draft.language === 'FR' ? 'Compétences techniques' : 'Technical Skills');
      for (const line of draft.skills.split('\n').filter((v) => v.trim())) lines(line, 9.5);
    }

    if (sectionKey === 'languages' && draft.languages?.trim()) {
      section(draft.language === 'FR' ? 'Langues' : 'Languages');
      lines(draft.languages);
    }

    if (sectionKey === 'interests' && draft.interests?.trim()) {
      section(draft.language === 'FR' ? 'Centres d’intérêt' : 'Interests');
      lines(draft.interests);
    }
  }

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
