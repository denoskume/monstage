import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import {
  cvEducationDisplay, cvExperienceDescription, cvExperienceLocationForDisplay,
  cvLanguagesForDisplay, cvProjectDescription, cvSkillsForDisplay, cvSummaryTitle,
  cvPageColorHex, type CvDraft, type CvSectionKey,
} from './cvStorage';
import { cvColumnSections } from './twoColumnLayout';
import { normalizeCvPdfText } from './cvPdfText';

// A true full-height two-column A4 design: the mint rail starts at the top,
// while the teal name banner spans the page above both content columns.
// All CV copy remains selectable PDF text; only the optional portrait is raster.
const W = 595.28;
const H = 841.89;
const SIDE_X = 28;
const SIDE_W = 176;
const MAIN_X = 222;
const MAIN_W = W - MAIN_X - 28;
const LOW = 29;
const TEAL = rgb(0.20, 0.72, 0.67);
const DEEP_TEAL = rgb(0.08, 0.33, 0.34);
const MINT = rgb(0.88, 0.95, 0.94);
const DARK = rgb(0.12, 0.17, 0.19);
const MUTED = rgb(0.38, 0.44, 0.46);
const RULE = rgb(0.75, 0.85, 0.83);

type Word = { value: string; font: PDFFont };
function fromHex(hex: string) {
  return rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);
}
function splitWords(text: string, regular: PDFFont, bold: PDFFont): Word[] {
  const output: Word[] = [];
  for (const part of text.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    const highlighted = part.startsWith('**') && part.endsWith('**');
    const value = normalizeCvPdfText(highlighted ? part.slice(2, -2) : part);
    for (const word of value.split(/\s+/).filter(Boolean)) output.push({ value: word, font: highlighted ? bold : regular });
  }
  return output;
}
function linesFor(words: Word[], maxWidth: number, fontSize: number, font: PDFFont): Word[][] {
  const lines: Word[][] = [];
  let row: Word[] = [];
  let used = 0;
  const space = font.widthOfTextAtSize(' ', fontSize);
  for (const word of words) {
    const wordW = word.font.widthOfTextAtSize(word.value, fontSize);
    if (row.length && used + space + wordW > maxWidth) {
      lines.push(row);
      row = [];
      used = 0;
    }
    used += (row.length ? space : 0) + wordW;
    row.push(word);
  }
  if (row.length) lines.push(row);
  return lines;
}

export async function buildPortraitCvPdfBytes(draft: CvDraft): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages: PDFPage[] = [];

  const makePage = (first = false) => {
    const page = pdf.addPage([W, H]);
    const paper = cvPageColorHex(draft.pageColor);
    if (paper !== '#FFFFFF') page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: fromHex(paper) });
    page.drawRectangle({ x: SIDE_X, y: 25, width: SIDE_W, height: H - 50, color: MINT });
    if (first) {
      page.drawRectangle({ x: SIDE_X, y: H - 132, width: W - SIDE_X - 28, height: 107, color: TEAL });
      page.drawRectangle({ x: SIDE_X, y: H - 137, width: W - SIDE_X - 28, height: 5, color: DEEP_TEAL });
    }
    pages.push(page);
    return page;
  };

  let pageIndex = 0;
  let page = makePage(true);
  let x = MAIN_X;
  let columnWidth = MAIN_W;
  let y = H - 167;
  let fontSize = 8.65;
  let leading = 10.9;

  const ensure = (height: number) => {
    if (y - height >= LOW) return;
    pageIndex += 1;
    page = pages[pageIndex] ?? makePage();
    y = H - 47;
  };

  const paragraph = (text: string, options: {
    size?: number; step?: number; after?: number; font?: PDFFont;
    color?: ReturnType<typeof rgb>; bullet?: boolean;
  } = {}) => {
    if (!text.trim()) return;
    const size = options.size ?? fontSize;
    const step = options.step ?? leading;
    const bullet = options.bullet ?? false;
    const left = x + (bullet ? 10 : 0);
    const width = columnWidth - (bullet ? 10 : 0);
    let first = true;
    for (const rawLine of text.split(/\n/)) {
      const lines = linesFor(splitWords(rawLine, options.font ?? regular, bold), width, size, regular);
      for (const words of lines) {
        ensure(step + 1);
        if (bullet && first) page.drawCircle({ x: x + 3, y: y + 3, size: 1.25, color: DEEP_TEAL });
        let cursor = left;
        for (const [i, word] of words.entries()) {
          if (i) cursor += regular.widthOfTextAtSize(' ', size);
          const natural = word.font.widthOfTextAtSize(word.value, size);
          const fitted = natural > width ? size * width / natural : size;
          page.drawText(word.value, { x: cursor, y, font: word.font, size: fitted, color: options.color ?? DARK });
          cursor += word.font.widthOfTextAtSize(word.value, fitted);
        }
        y -= step;
        first = false;
      }
    }
    y -= options.after ?? 0;
  };

  const heading = (title: string) => {
    ensure(28);
    paragraph(title.toUpperCase(), { font: bold, size: x === MAIN_X ? 9.15 : 8.9, step: 11, after: 4, color: DEEP_TEAL });
    page.drawLine({ start: { x, y: y + 2 }, end: { x: x + columnWidth, y: y + 2 }, color: RULE, thickness: 0.65 });
    y -= 9;
  };

  const item = (title: string, detail?: string, subtitle?: string) => {
    ensure(27);
    paragraph('**' + title + '**', { size: 8.4, step: 10.3, after: 1 });
    if (detail) paragraph(detail, { size: 7.6, step: 9.3, after: 2, color: MUTED });
    if (subtitle) paragraph(subtitle, { size: 8.0, step: 10.0, after: 3 });
  };

  const fr = draft.language === 'FR';

  // Teal name plate; the portrait, when supplied, overlaps its left edge.
  x = MAIN_X + 10;
  columnWidth = MAIN_W - 17;
  y = H - 62;
  const name = normalizeCvPdfText(draft.name);
  const rawNameW = bold.widthOfTextAtSize(name, 20);
  const nameSize = Math.min(20, 20 * columnWidth / Math.max(rawNameW, 1));
  page.drawText(name, { x, y, size: nameSize, font: bold, color: rgb(1, 1, 1) });
  y -= 22;
  const bannerText = normalizeCvPdfText(draft.headline || draft.academicHeadline || '');
  for (const line of linesFor(splitWords(bannerText, regular, bold), columnWidth, 8.5, regular).slice(0, 3)) {
    const value = line.map(word => word.value).join(' ');
    page.drawText(value, { x, y, font: regular, size: 8.5, color: rgb(1, 1, 1) });
    y -= 11;
  }

  // A photo is never invented or rendered as a dummy portrait in the PDF.
  // The uploader crops and converts accepted images to a compact JPEG.
  let hasPhoto = false;
  if (draft.photoDataUrl?.startsWith('data:image/')) {
    const matched = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(draft.photoDataUrl);
    if (matched) {
      try {
        const bytes = Uint8Array.from(atob(matched[2]), char => char.charCodeAt(0));
        const photo = matched[1] === 'png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        page.drawImage(photo, { x: SIDE_X + 24, y: H - 205, width: 128, height: 151 });
        page.drawRectangle({ x: SIDE_X + 24, y: H - 205, width: 128, height: 151, borderColor: rgb(1, 1, 1), borderWidth: 2 });
        hasPhoto = true;
      } catch {
        // A damaged saved data URL must not prevent an otherwise valid CV export.
      }
    }
  }

  // Main narrative is laid out separately from the sidebar from page 1 onward.
  pageIndex = 0;
  page = pages[0];
  x = MAIN_X;
  columnWidth = MAIN_W;
  y = H - 164;
  heading(cvSummaryTitle(draft.summaryHeading, draft.language));
  paragraph(draft.summary, { size: 8.55, step: 11, after: 12 });

  const sections = cvColumnSections(draft.sectionOrder);
  for (const key of sections.main) {
    if (key === 'experience' && draft.experience.length) {
      heading(fr ? 'Parcours professionnel' : 'Professional experience');
      for (const exp of draft.experience) {
        item(exp.role + ' — ' + exp.company, [exp.period, cvExperienceLocationForDisplay(exp.location)].filter(Boolean).join(' | '), cvExperienceDescription(exp, draft.language));
        for (const bullet of exp.bullets.filter(Boolean)) paragraph(bullet, { size: 8.15, step: 10.4, bullet: true, after: 2 });
        y -= 5;
      }
    }
    if (key === 'projects' && draft.projects.length) {
      heading(fr ? 'Projets sélectionnés' : 'Selected projects');
      for (const project of draft.projects) {
        item(project.name, project.period, cvProjectDescription(project, draft.language));
        for (const bullet of project.bullets.filter(Boolean)) paragraph(bullet, { size: 8.15, step: 10.4, bullet: true, after: 2 });
        y -= 5;
      }
    }
  }

  pageIndex = 0;
  page = pages[0];
  x = SIDE_X + 13;
  columnWidth = SIDE_W - 27;
  y = hasPhoto ? H - 227 : H - 158;
  fontSize = 8.1;
  leading = 10.2;
  heading(fr ? 'Coordonnées' : 'Contact');
  for (const value of [draft.location, draft.phone, draft.email]) paragraph(value, { size: 7.5, step: 9.8, after: 2 });
  if (draft.linkedin.trim()) paragraph('LinkedIn: ' + draft.linkedin.replace(/^https?:\/\//, ''), { size: 7.0, step: 9.1, after: 2 });
  if (draft.github.trim()) paragraph('GitHub: ' + draft.github.replace(/^https?:\/\//, ''), { size: 7.0, step: 9.1, after: 4 });

  for (const key of sections.sidebar) {
    if (key === 'education' && draft.education.length) {
      heading(fr ? 'Formation' : 'Education');
      for (const edu of draft.education) {
        const display = cvEducationDisplay(edu);
        item(display.school, edu.period, [edu.degree, display.location].filter(Boolean).join(' | '));
        for (const bullet of (edu.bullets || []).filter(Boolean)) paragraph(bullet, { size: 7.5, step: 9.6, bullet: true });
        if (!edu.bullets?.some(Boolean) && edu.details.trim()) paragraph(edu.details, { size: 7.4, step: 9.7 });
        if (edu.keyCourses?.trim()) paragraph('**' + (fr ? 'Cours pertinents : ' : 'Relevant courses: ') + '**' + edu.keyCourses, { size: 7.25, step: 9.5 });
        y -= 5;
      }
    }
    if (key === 'skills' && draft.skills.trim()) {
      heading(fr ? 'Compétences' : 'Skills');
      for (const skill of cvSkillsForDisplay(draft.skills, draft.language)) paragraph(skill, { size: 7.5, step: 9.5, after: 3 });
    }
    if (key === 'certifications' && draft.certifications?.some(cert => cert.visible !== false && cert.title.trim())) {
      heading(fr ? 'Certifications' : 'Certifications');
      for (const cert of draft.certifications.filter(cert => cert.visible !== false && cert.title.trim())) item(cert.title, [cert.issuer, cert.date].filter(Boolean).join(' | '));
    }
    if (key === 'leadership' && draft.leadership.length) {
      heading('Leadership');
      for (const lead of draft.leadership) {
        item([lead.role, lead.organization].filter(Boolean).join(' — '), lead.period);
        for (const bullet of lead.bullets.filter(Boolean)) paragraph(bullet, { size: 7.4, step: 9.4, bullet: true });
      }
    }
    if (key === 'languages' && draft.languages.trim()) {
      heading(fr ? 'Langues' : 'Languages');
      paragraph(cvLanguagesForDisplay(draft.languages), { size: 7.7, step: 9.8, after: 4 });
    }
    if (key === 'interests' && draft.interests.trim()) {
      heading(fr ? 'Centres d’intérêt' : 'Interests');
      paragraph(draft.interests, { size: 7.7, step: 9.8, after: 4 });
    }
  }
  return pdf.save();
}
