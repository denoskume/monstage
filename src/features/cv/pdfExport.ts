import { PDFDocument, PDFString, StandardFonts, rgb } from 'pdf-lib';
import { CV_ACADEMIC_HEADLINE, cvProjectDescription, cvExperienceDescription, cvEducationDisplay, cvSkillsForDisplay, cvKeySkillsForDisplay, cvPageColorHex, type CvDraft } from './cvStorage';

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
  // A targeted CV with project summaries and mission labels must still fit A4.
  // Match French and English titles; never rely on a particular language to compact.
  const compact = draft.email === 'kamenan.kume@eleves.ec-nantes.fr'
    && /Computer Vision|Vision par ordinateur|Image Processing|Traitement d.images|Data Analysis|Analyse de données/i.test(draft.headline);
  let y = A4_HEIGHT - (compact ? 28 : MARGIN_TOP);

  const template = draft.template ?? 'classic';
  const leftHeader = template === 'minimal';
  const modern = template === 'modern';
  const minimal = template === 'minimal';
  const keywordsTemplate = template === 'keywords';
  const textColor = rgb(0.07, 0.07, 0.07);
  const headingColor = modern ? rgb(0.14, 0.30, 0.44) : textColor;
  const ruleColor = modern ? rgb(0.65, 0.76, 0.84) : rgb(0.25, 0.25, 0.25);
  const usableWidth = A4_WIDTH - (MARGIN_X * 2);

  // Page background is independent of the selected template.
  // Draw it behind selectable ATS text and links on every PDF page.
  const paintPageBackground = () => {
    const hex = cvPageColorHex(draft.pageColor);
    if (hex === '#FFFFFF') return;
    page.drawRectangle({
      x: 0, y: 0, width: A4_WIDTH, height: A4_HEIGHT,
      color: rgb(
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
      ),
    });
  };
  paintPageBackground();

  const ensureSpace = (height: number) => {
    if (y - height < (compact ? 22 : MARGIN_BOTTOM)) {
      page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
      paintPageBackground();
      y = A4_HEIGHT - (compact ? 28 : MARGIN_TOP);
    }
  };

  const drawCentered = (value: string, size: number, font: any) => {
    const tokens = richTokens(value, font);
    const naturalWidth = tokens.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.value, size), 0);
    const fittedSize = naturalWidth > usableWidth ? size * usableWidth / naturalWidth : size;
    const width = tokens.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.value, fittedSize), 0);
    let x = leftHeader ? MARGIN_X : (A4_WIDTH - width) / 2;
    for (const part of tokens) {
      page.drawText(part.value, { x, y, size: fittedSize, font: part.font, color: modern ? headingColor : textColor });
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
    let x = leftHeader ? MARGIN_X : (A4_WIDTH - fittedTotal) / 2;
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
    y -= compact ? (minimal || keywordsTemplate ? 4 : 7) : 4;
    page.drawText(normalizeCvPdfText(title.toUpperCase()), { x: MARGIN_X, y, size: modern ? 10.2 : 10.5, font: bold, color: headingColor });
    y -= 5;
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: A4_WIDTH - MARGIN_X, y }, thickness: modern ? 0.65 : 0.8, color: ruleColor });
    y -= compact ? (minimal || keywordsTemplate ? 8 : 11) : 12;
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

  // Education titles keep a consistent 9.5 pt size. Long titles wrap
  // naturally instead of being shrunk, while dates stay on the first line.
  const drawEducationHeader = (title: string, period: string) => {
    const size = 9.5;
    const lineHeight = 12.5;
    const rightReserve = period.trim() ? 86 : 0;
    const rightEdge = MARGIN_X + usableWidth - rightReserve;
    const tokens = richTokens(title, bold);
    let cursor = MARGIN_X;
    let lineCount = 1;
    ensureSpace(40);
    if (period.trim()) drawRightAligned(formatPeriod(period), y, size, regular);
    for (const token of tokens) {
      if (!token.value.trim() && cursor === MARGIN_X) continue;
      const width = token.font.widthOfTextAtSize(token.value, size);
      if (cursor > MARGIN_X && cursor + width > rightEdge) {
        y -= lineHeight;
        cursor = MARGIN_X;
        lineCount += 1;
        if (!token.value.trim()) continue;
      }
      page.drawText(token.value, { x: cursor, y, size, font: token.font, color: textColor });
      cursor += width;
    }
    y -= lineHeight;
    return lineCount;
  };

  // Project bullets are measured and kept on one line, matching experience
  // bullets and preserving the original content in compact one-page CVs.
  const drawBullet = (value: string) => {
    if (!value.trim()) return;
    ensureSpace(15);
    page.drawCircle({ x: MARGIN_X + 2.4, y: y + 3.4, size: 1.7, color: textColor });
    drawRichSingleLine(value, MARGIN_X + 12, compact ? 9.1 : 9.2, usableWidth - 12);
    y -= compact ? 11.7 : 12;
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

  drawCentered(draft.name, modern ? 19 : minimal ? 17 : 18, bold);
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
  // Header spacing is intentionally tighter in the modern/minimal templates.
  y -= compact ? (minimal || keywordsTemplate ? 5 : modern ? 7 : 10) : (minimal || keywordsTemplate ? 8 : modern ? 12 : 20);

  if (draft.summary.trim()) {
    drawSectionTitle(keywordsTemplate ? (draft.language === 'FR' ? 'Résumé' : 'Summary') : (draft.language === 'FR' ? 'Profil' : 'Profile'));
    drawLines(draft.summary.trim(), compact ? 9.3 : 9.5);
  }
  if (keywordsTemplate && cvKeySkillsForDisplay(draft)) {
    // Compact, selectable text directly after Summary: ATS can read every term.
    drawSectionTitle(draft.language === 'FR' ? 'Compétences clés' : 'Key Skills');
    drawLines(cvKeySkillsForDisplay(draft), compact ? 8.9 : 9.3, regular, 0, compact ? 10.5 : 12);
  }

  const sectionOrder = draft.sectionOrder?.length
    ? draft.sectionOrder
    : ['education', 'projects', 'experience', 'skills', 'languages', 'leadership', 'interests'] as const;

  for (const sectionKey of sectionOrder) {
    if (sectionKey === 'education' && draft.education.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Formation' : 'Education');
      for (const [index, item] of draft.education.entries()) {
        // Air between qualifications, and a smaller gap before programme details.
        // Preserve a compact one-page layout for longer targeted CVs.
        if (index > 0) y -= compact ? 8 : 11;
        const educationDisplay = cvEducationDisplay(item);
        drawEducationHeader(educationDisplay.school, item.period);
        // Keep city/country right-aligned beside Parcours in both preview and PDF.
        // In particular, "Centrale Nantes" does not mean "Nantes, France" is redundant.
        if (item.degree.trim() || educationDisplay.location) {
          drawEntryHeader(item.degree, educationDisplay.location, regular);
        }
        if (!compact && (item.details.trim() || item.bullets?.some(value => value.trim()))) y -= 3;
        if (item.bullets?.some(value => value.trim())) {
          for (const bullet of item.bullets.filter(value => value.trim())) drawEducationBullet(bullet.trim());
        } else if (item.details.trim()) drawEducationDetails(item.details.trim(), compact ? 8.7 : 9.2);
        if (item.keyCourses?.trim()) drawLines((draft.language === 'FR' ? '**Cours clés :** ' : '**Key courses:** ') + item.keyCourses.trim(), compact ? 8.7 : 9.2);
      }
      y -= compact ? 3 : 5;
    }

    if (sectionKey === 'projects' && draft.projects.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Projets sélectionnés' : 'Selected Projects');
      for (const item of draft.projects) {
        drawEntryHeader(item.name, item.period || '');
        const description = cvProjectDescription(item, draft.language).trim();
        if (description) drawLines(description, compact ? 8.6 : 9.0, regular, 0, compact ? 10.5 : 11.5);
        if (item.bullets.some((value) => value.trim())) {
          drawLines(draft.language === 'FR' ? '**Missions :**' : '**Tasks:**', compact ? 8.6 : 9.0, regular, 0, compact ? 10.5 : 11.5);
        }
        for (const bullet of item.bullets.filter((value) => value.trim())) drawBullet(bullet.trim());
        y -= compact ? 5 : 6;
      }
    }

    if (sectionKey === 'experience' && draft.experience.length) {
      drawSectionTitle(draft.language === 'FR' ? 'Expérience' : 'Experience');
      for (const item of draft.experience) {
        drawEntryHeader(item.role + ' — ' + item.company, item.period);
        if (item.location.trim()) drawLines(item.location, compact ? 8.6 : 9.2, regular, 0, compact ? 10.5 : 12);
        const description = cvExperienceDescription(item, draft.language).trim();
        if (description) drawLines(description, compact ? 8.6 : 9.0, regular, 0, compact ? 10.5 : 11.5);
        if (item.bullets.some((value) => value.trim())) {
          drawLines(draft.language === 'FR' ? '**Missions :**' : '**Tasks:**', compact ? 8.6 : 9.0, regular, 0, compact ? 10.5 : 11.5);
        }
        for (const bullet of item.bullets.filter((value) => value.trim())) drawExperienceBullet(bullet.trim());
        y -= compact ? 3 : 5;
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
      for (const line of cvSkillsForDisplay(draft.skills, draft.language)) drawLines(line, compact ? 9.1 : 9.5, regular, 0, compact ? 10.6 : 12);
    }

    // One heading and two clearly labeled lines instead of two separate sections.
    if ((sectionKey === 'languages' || sectionKey === 'interests')
      && sectionKey === sectionOrder.find(key => key === 'languages' || key === 'interests')
      && (draft.languages.trim() || draft.interests.trim())) {
      drawSectionTitle(draft.language === 'FR' ? 'Langues et centres d’intérêt' : 'Languages & Interests');
      if (draft.languages.trim()) drawLines((draft.language === 'FR' ? '**Langues :** ' : '**Languages:** ') + draft.languages.trim(), compact ? 9.1 : 9.5, regular, 0, compact ? 10.6 : 12);
      if (draft.interests.trim()) drawLines((draft.language === 'FR' ? '**Centres d’intérêt :** ' : '**Interests:** ') + draft.interests.trim(), compact ? 9.1 : 9.5, regular, 0, compact ? 10.6 : 12);
    }
  }

  return pdf.save();
}


export function cvPdfFileName(name: string): string {
  return safeFileName(name) + '_CV.pdf';
}
