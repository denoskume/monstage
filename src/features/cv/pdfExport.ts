import { PDFDocument, PDFString, StandardFonts, rgb } from 'pdf-lib';
import { CV_ACADEMIC_HEADLINE, type CvDraft } from './cvStorage';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN_X = 42;
const MARGIN_TOP = 42;
const MARGIN_BOTTOM = 42;

function safeFileName(value: string): string {
  return value.trim().replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'MonStage_CV';
}

export function normalizeCvPdfText(value: string): string {
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

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = normalizeCvPdfText(text).trim().split(/\s+/).filter(Boolean);
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
  const compact = draft.email === 'kamenan.kume@eleves.ec-nantes.fr' && /Computer Vision/i.test(draft.headline);
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

  const drawCentered = (value: string, size: number, font: any) => {
    const tokens = richTokens(value, font);
    const naturalWidth = tokens.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.value, size), 0);
    const fittedSize = naturalWidth > usableWidth ? size * usableWidth / naturalWidth : size;
    const width = tokens.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.value, fittedSize), 0);
    let x = (A4_WIDTH - width) / 2;
    for (const part of tokens) {
      page.drawText(part.value, { x, y, size: fittedSize, font: part.font, color: textColor });
      x += part.font.widthOfTextAtSize(part.value, fittedSize);
    }
    y -= size + (compact ? 2 : 5);
  };


  // Treat **...** as bold spans, not visible Markdown punctuation.
  const richTokens = (raw: string, defaultFont = regular) =>
    raw.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).flatMap((part) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const font = isBold ? bold : defaultFont;
      return (normalizeCvPdfText(isBold ? part.slice(2, -2) : part).match(/\s+|\S+/g) || [])
        .map((value) => ({ value, font }));
    });

  // PDF URI link annotations make the header links usable in standard PDF readers.
  const addLink = (x: number, baseline: number, width: number, size: number, uri: string) => {
    if (!uri || !width) return;
    const annotation = pdf.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, baseline - 2, x + width, baseline + size + 2],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri) },
    });
    page.node.addAnnot(pdf.context.register(annotation));
  };

  const portfolioUrl = (raw: string, service: 'linkedin' | 'github'): string | null => {
    const input = raw.trim();
    if (!input) return null;
    const url = /^https?:\/\//i.test(input) ? input : 'https://' + input.replace(/^\/+/, '');
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const allowed = service === 'linkedin'
        ? (host === 'linkedin.com' || host === 'www.linkedin.com')
        : (host === 'github.com' || host === 'www.github.com');
      return parsed.protocol === 'https:' && allowed ? parsed.href : null;
    } catch { return null; }
  };

  const drawCenteredLinkedParts = (items: { text: string; uri?: string | null }[], size: number) => {
    const parts = items.filter(item => item.text.trim());
    if (!parts.length) return;
    const separator = ' | ';
    const rawWidths = parts.map(item => regular.widthOfTextAtSize(normalizeCvPdfText(item.text), size));
    const delimiterWidth = regular.widthOfTextAtSize(separator, size);
    const total = rawWidths.reduce((sum, width) => sum + width, 0) + delimiterWidth * (parts.length - 1);
    const fitted = total > usableWidth ? size * usableWidth / total : size;
    const widths = parts.map(item => regular.widthOfTextAtSize(normalizeCvPdfText(item.text), fitted));
    const gapWidth = regular.widthOfTextAtSize(separator, fitted);
    const fittedTotal = widths.reduce((sum, width) => sum + width, 0) + gapWidth * (parts.length - 1);
    let x = (A4_WIDTH - fittedTotal) / 2;
    parts.forEach((item, index) => {
      const value = normalizeCvPdfText(item.text);
      page.drawText(value, { x, y, size: fitted, font: regular, color: textColor });
      if (item.uri) addLink(x, y, widths[index], fitted, item.uri);
      x += widths[index];
      if (index < parts.length - 1) {
        page.drawText(separator, { x, y, size: fitted, font: regular, color: textColor });
        x += gapWidth;
      }
    });
    y -= size + (compact ? 2 : 5);
  };

  const drawRichSingleLine = (raw: string, x: number, baseSize: number, maxWidth: number, defaultFont = regular) => {
    const tokens = richTokens(raw, defaultFont);
    const naturalWidth = tokens.reduce((sum, token) => sum + token.font.widthOfTextAtSize(token.value, baseSize), 0);
    const size = naturalWidth > maxWidth ? baseSize * maxWidth / naturalWidth : baseSize;
    let cursor = x;
    for (const token of tokens) {
      page.drawText(token.value, { x: cursor, y, size, font: token.font, color: textColor });
      cursor += token.font.widthOfTextAtSize(token.value, size);
    }
  };

  const drawLines = (value: string, size = 9.5, font = regular, indent = 0, leading = size + 3) => {
    const paragraphs = value.split('\n').filter(Boolean);
    for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
      if (paragraphIndex) y -= Math.max(3, leading * 0.5);
      let x = MARGIN_X + indent;
      let started = false;
      ensureSpace(leading + 4);
      for (const token of richTokens(paragraph, font)) {
        if (!started && !token.value.trim()) continue;
        const width = token.font.widthOfTextAtSize(token.value, size);
        if (started && x + width > MARGIN_X + usableWidth) {
          y -= leading;
          ensureSpace(leading + 4);
          x = MARGIN_X + indent;
          started = false;
          if (!token.value.trim()) continue;
        }
        page.drawText(token.value, { x, y, size, font: token.font, color: textColor });
        x += width;
        started = true;
      }
      y -= leading;
    }
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(24);
    y -= compact ? 7 : 4;
    page.drawText(normalizeCvPdfText(title.toUpperCase()), { x: MARGIN_X, y, size: 10.5, font: bold, color: textColor });
    y -= 5;
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: A4_WIDTH - MARGIN_X, y }, thickness: 0.8, color: ruleColor });
    y -= compact ? 11 : 12;
  };

  // Helvetica's built-in encoding cannot display an en dash; use consistently spaced dates.
  const formatPeriod = (period: string) => period
    .replace(/(\d{4})\s*[-–—]\s*(\d{4})/g, '$1 - $2')
    .replace(/(\d{4})\s*[-–—]\s*(En cours|Ongoing|Present)/gi, '$1 - $2')
    .replace(/(\b(?:Déc\.|Sept\.|Sep\.|Dec\.)?)\s*[-–—]\s*((?:Déc\.|Sept\.|Sep\.|Dec\.)\s*\d{4})/g, '$1 - $2');
  const drawEducationDetails = (details: string, size: number) => {
    const activity = details.split('\n');
    drawLines(activity[0], size);
    for (const line of activity.slice(1).filter(Boolean)) {
      const match = line.match(/^(Activité associative :|Student leadership:)\s*(.+?)\s+[—-]\s+(.+)$/);
      if (!match) { drawLines(line, size); continue; }
      const heading = match[1] + ' ' + match[2].replace(/(\d{4})\s*[-–—]\s*(\d{4})/g, '$1 - $2');
      y -= 4;
      drawLines(heading, size, bold);
      drawLines(match[3], size);
    }
  };

  const drawRightAligned = (value: string, yValue: number, size = 9.5, font = regular) => {
    const tokens = richTokens(value, font);
    const width = tokens.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.value, size), 0);
    let x = A4_WIDTH - MARGIN_X - width;
    for (const part of tokens) {
      page.drawText(part.value, { x, y: yValue, size, font: part.font, color: textColor });
      x += part.font.widthOfTextAtSize(part.value, size);
    }
  };

  const drawEntryHeader = (left: string, right: string, font = bold) => {
    ensureSpace(18);
    drawRichSingleLine(left, MARGIN_X, 9.5, usableWidth - (right ? 100 : 0), font);
    if (right) drawRightAligned(formatPeriod(right), y, 9.5, regular);
    y -= compact ? 13 : 13;
  };

  const drawBullet = (value: string) => {
    ensureSpace(16);
    page.drawCircle({ x: MARGIN_X + 2.4, y: y + 3.4, size: 1.7, color: textColor });
    drawLines(value, compact ? 9.1 : 9.2, regular, 12, compact ? 11.7 : 12);
  };

  // Preserve each experience bullet on one line in the exported CV.
  const drawExperienceBullet = (value: string) => {
    if (!value.trim()) return;
    ensureSpace(15);
    page.drawCircle({ x: MARGIN_X + 2.4, y: y + 3.4, size: 1.7, color: textColor });
    drawRichSingleLine(value, MARGIN_X + 12, compact ? 9.1 : 9.2, usableWidth - 12);
    y -= compact ? 11.7 : 12;
  };

  // Education bullets use a measured, single-line font size so PDF matches the
  // Studio preview instead of silently wrapping and pushing sections to page 2.
  const drawEducationBullet = (value: string) => {
    if (!value.trim()) return;
    ensureSpace(compact ? 11.7 : 12);
    page.drawCircle({ x: MARGIN_X + 2.4, y: y + 3.4, size: 1.7, color: textColor });
    drawRichSingleLine(value, MARGIN_X + 12, compact ? 9.1 : 9.2, usableWidth - 12);
    y -= compact ? 11.7 : 12;
  };

  drawCentered(draft.name, 18, bold);
  drawCentered(draft.academicHeadline ?? CV_ACADEMIC_HEADLINE, 9.5, regular);
  drawCentered(draft.headline, 10.5, bold);
  drawCenteredLinkedParts([
    { text: draft.location },
    { text: draft.email, uri: draft.email.trim() ? 'mailto:' + draft.email.trim() : null },
    { text: draft.phone, uri: draft.phone.trim() ? 'tel:' + draft.phone.replace(/[^+\d]/g, '') : null },
  ], 8.5);
  drawCenteredLinkedParts([
    { text: draft.linkedin.trim() ? 'LinkedIn' : '', uri: portfolioUrl(draft.linkedin, 'linkedin') },
    { text: draft.github.trim() ? 'GitHub' : '', uri: portfolioUrl(draft.github, 'github') },
  ], 8.5);
  // No separator beneath the centered header: give the profile breathing room.
  y -= compact ? 15 : 20;

  if (draft.summary.trim()) {
    drawSectionTitle(draft.language === 'FR' ? 'Profil' : 'Profile');
    drawLines(draft.summary.trim(), compact ? 9.3 : 9.5);
  }

  const sectionOrder = draft.sectionOrder?.length
    ? draft.sectionOrder
    : ['education', 'projects', 'experience', 'skills', 'languages', 'leadership', 'interests'] as const;

  for (const sectionKey of sectionOrder) {
    if (sectionKey === 'education' && draft.education.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Formation' : 'Education');
      for (const item of draft.education) {
        drawEntryHeader(item.school, item.period);
        drawEntryHeader(item.degree, item.location, regular);
        if (item.bullets?.some(value => value.trim())) {
          for (const bullet of item.bullets.filter(value => value.trim())) drawEducationBullet(bullet.trim());
        } else if (item.details.trim()) drawEducationDetails(item.details.trim(), compact ? 8.7 : 9.2);
        if (item.keyCourses?.trim()) drawLines((draft.language === 'FR' ? '**Cours clés :** ' : '**Key courses:** ') + item.keyCourses.trim(), compact ? 8.7 : 9.2);
        y -= compact ? 6 : 4;
      }
    }

    if (sectionKey === 'projects' && draft.projects.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Projets sélectionnés' : 'Selected Projects');
      for (const item of draft.projects) {
        drawEntryHeader(item.name, item.period || '');
        for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
        y -= compact ? 8 : 4;
      }
    }

    if (sectionKey === 'experience' && draft.experience.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Expérience' : 'Experience');
      for (const item of draft.experience) {
        drawEntryHeader(item.role + ' — ' + item.company, item.period);
        if (item.location) drawLines(item.location, 9.2);
        for (const bullet of item.bullets.filter((value) => value.trim())) drawExperienceBullet(bullet.trim());
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
      for (const line of draft.skills.split('\n').filter(value => value.trim())) drawLines(line.trim(), compact ? 9.1 : 9.5);
    }

    if (sectionKey === 'languages' && draft.languages.trim()) {
      drawSectionTitle(draft.language === 'FR' ? 'Langues' : 'Languages');
      drawLines(draft.languages.trim());
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
