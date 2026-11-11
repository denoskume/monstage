import { PDFDocument, PDFString, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import {
  CV_ACADEMIC_HEADLINE, cvEducationDisplay, cvExperienceDescription,
  cvExperienceLocationForDisplay, cvLanguagesForDisplay, cvPageColorHex,
  cvProjectDescription, cvSkillsForDisplay, cvSummaryTitle,
  type CvDraft, type CvSectionKey,
} from './cvStorage';
import { cvColumnSections } from './twoColumnLayout';
import { normalizeCvPdfText } from './cvPdfText';

const W = 595.28;
const H = 841.89;
const M = 35;
const GAP = 17;
const MAIN_W = 327;
const SIDE_W = W - 2 * M - GAP - MAIN_W;
const BOTTOM = 37;
const TOP_NEXT = H - 43;
const TITLE_COLOR = rgb(0.12, 0.25, 0.36);
const MUTED_COLOR = rgb(0.34, 0.40, 0.44);
const INK = rgb(0.10, 0.12, 0.15);
const TEAL = rgb(0.07, 0.38, 0.41);
const SIDEBAR_FILL = rgb(0.92, 0.96, 0.965);
const DIVIDER = rgb(0.76, 0.83, 0.86);

type Word = { text: string; font: PDFFont };

function rgbFromHex(hex: string) {
  return rgb(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  );
}

function wordsWithFonts(input: string, regular: PDFFont, bold: PDFFont): Word[] {
  const output: Word[] = [];
  for (const part of input.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    const isBold = part.startsWith('**') && part.endsWith('**');
    const clean = normalizeCvPdfText(isBold ? part.slice(2, -2) : part);
    for (const word of clean.split(/\s+/).filter(Boolean)) {
      output.push({ text: word, font: isBold ? bold : regular });
    }
  }
  return output;
}

function toLines(words: Word[], width: number, size: number, regular: PDFFont): Word[][] {
  const lines: Word[][] = [];
  let line: Word[] = [];
  let lineWidth = 0;
  const space = regular.widthOfTextAtSize(' ', size);
  for (const word of words) {
    const wordWidth = word.font.widthOfTextAtSize(word.text, size);
    if (line.length && lineWidth + space + wordWidth > width) {
      lines.push(line);
      line = [];
      lineWidth = 0;
    }
    lineWidth += (line.length ? space : 0) + wordWidth;
    line.push(word);
  }
  if (line.length) lines.push(line);
  return lines;
}

export async function buildTwoColumnCvPdfBytes(draft: CvDraft): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const isSidebarLeft = draft.template === 'sidebar';
  const mainX = isSidebarLeft ? M + SIDE_W + GAP : M;
  const sideX = isSidebarLeft ? M : M + MAIN_W + GAP;
  const colors = { heading: isSidebarLeft ? TEAL : TITLE_COLOR, text: INK };
  const paper = cvPageColorHex(draft.pageColor);
  const pages: PDFPage[] = [];
  let pageIndex = 0;
  let currentPage: PDFPage;
  let x = mainX;
  let width = MAIN_W;
  let y = TOP_NEXT;
  let topOfColumns = TOP_NEXT;
  let size = 8.65;
  let leading = 10.8;

  // Backgrounds and vertical dividers are painted before selectable text.
  const makePage = (index: number): PDFPage => {
    const p = pdf.addPage([W, H]);
    if (paper !== '#FFFFFF') {
      p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgbFromHex(paper) });
    }
    const top = index === 0 ? topOfColumns + 10 : TOP_NEXT + 14;
    if (isSidebarLeft) {
      p.drawRectangle({
        x: M - 10, y: BOTTOM - 10, width: SIDE_W + 20,
        height: top - BOTTOM + 14, color: SIDEBAR_FILL,
      });
    } else {
      p.drawLine({
        start: { x: sideX - GAP / 2, y: BOTTOM - 3 },
        end: { x: sideX - GAP / 2, y: top },
        thickness: 0.8, color: DIVIDER,
      });
    }
    pages.push(p);
    return p;
  };

  // Reserve a full-width header and summary before painting sidebar panels.
  // Both remain in the logical reading order before the two columns.
  currentPage = pdf.addPage([W, H]);
  pages.push(currentPage);
  if (paper !== '#FFFFFF') {
    currentPage.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgbFromHex(paper) });
  }

  const ensure = (height: number) => {
    if (y - height >= BOTTOM) return;
    pageIndex += 1;
    currentPage = pages[pageIndex] || makePage(pageIndex);
    y = TOP_NEXT;
  };

  const putLine = (
    content: Word[], left: number, baseline: number,
    fontSize: number, color = INK, maxWidth?: number,
  ) => {
    let cursor = left;
    for (let i = 0; i < content.length; i += 1) {
      const word = content[i];
      const required = word.font.widthOfTextAtSize(word.text, fontSize);
      // Extremely long unbroken words are scaled independently, rather than
      // escaping the printed column or clipping at the page edge.
      const fittedSize = maxWidth && required > maxWidth ? fontSize * maxWidth / required : fontSize;
      if (i) cursor += regular.widthOfTextAtSize(' ', fontSize);
      currentPage.drawText(word.text, {
        x: cursor, y: baseline, size: fittedSize, font: word.font, color,
      });
      cursor += word.font.widthOfTextAtSize(word.text, fittedSize);
    }
  };

  const printParagraph = (value: string, options: {
    font?: PDFFont; size?: number; leading?: number; left?: number;
    width?: number; color?: ReturnType<typeof rgb>; after?: number;
    bullet?: boolean;
  } = {}) => {
    if (!value.trim()) return;
    const sz = options.size ?? size;
    const step = options.leading ?? leading;
    const left = options.left ?? x;
    const maxWidth = options.width ?? width;
    const bullet = options.bullet ?? false;
    const effectiveLeft = left + (bullet ? 10 : 0);
    const effectiveWidth = maxWidth - (bullet ? 10 : 0);
    const words = wordsWithFonts(value, options.font || regular, bold);
    const lines = toLines(words, effectiveWidth, sz, regular);
    if (!lines.length) return;
    if (bullet) ensure(step * Math.min(lines.length, 2) + 3);
    lines.forEach((line, index) => {
      ensure(step + 2);
      if (bullet && index === 0) {
        currentPage.drawCircle({ x: left + 2.4, y: y + 2.9, size: 1.25, color: colors.heading });
      }
      putLine(line, effectiveLeft, y, sz, options.color || INK, effectiveWidth);
      y -= step;
    });
    y -= options.after ?? 0;
  };

  const addLink = (left: number, baseline: number, value: string, uri: string) => {
    const rectW = regular.widthOfTextAtSize(normalizeCvPdfText(value), 8.1);
    const annotation = pdf.context.obj({
      Type: 'Annot', Subtype: 'Link',
      Rect: [left, baseline - 2, left + rectW, baseline + 10],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri) },
    });
    currentPage.node.addAnnot(pdf.context.register(annotation));
  };

  // Shared header (single spanning block). No photo, graphics-as-text or tables.
  y = H - 38;
  const name = normalizeCvPdfText(draft.name);
  const fullWidth = W - 2 * M;
  const headingSize = 19.5;
  const nameWidth = bold.widthOfTextAtSize(name, headingSize);
  currentPage.drawText(name, {
    x: (W - nameWidth) / 2, y, font: bold, size: headingSize, color: colors.heading,
  });
  y -= 17;
  const headerLine = (value: string, fontSize: number, font = regular) => {
    const cleaned = normalizeCvPdfText(value).trim();
    if (!cleaned) return null;
    const measured = font.widthOfTextAtSize(cleaned, fontSize);
    const adjusted = measured > fullWidth ? fontSize * fullWidth / measured : fontSize;
    const fitted = font.widthOfTextAtSize(cleaned, adjusted);
    y -= 3;
    const left = (W - fitted) / 2;
    const baseline = y;
    currentPage.drawText(cleaned, {
      x: left, y, font, size: adjusted, color: INK,
    });
    y -= 8.5;
    return { left, baseline, fontSize: adjusted };
  };
  headerLine(draft.academicHeadline ?? CV_ACADEMIC_HEADLINE, 8.2);
  headerLine(draft.headline, 9.4, bold);
  const contacts = [draft.location, draft.email, draft.phone].filter(Boolean).join(' | ');
  headerLine(contacts, 7.9);
  const links = [draft.linkedin ? 'LinkedIn' : '', draft.github ? 'GitHub' : ''].filter(Boolean).join(' | ');
  const linkPosition = headerLine(links, 8.1);
  const secureProfileUrl = (raw: string, host: string) => {
    if (!raw.trim()) return null;
    try {
      const url = new URL(/^https:\/\//i.test(raw) ? raw : 'https://' + raw);
      return url.protocol === 'https:' && (url.hostname === host || url.hostname === 'www.' + host)
        ? url.href : null;
    } catch { return null; }
  };
  if (linkPosition) {
    const { left, baseline, fontSize } = linkPosition;
    const linkedin = secureProfileUrl(draft.linkedin, 'linkedin.com');
    const github = secureProfileUrl(draft.github, 'github.com');
    if (linkedin) addLink(left, baseline, 'LinkedIn', linkedin);
    if (github) {
      const githubLeft = left + (draft.linkedin ? regular.widthOfTextAtSize('LinkedIn | ', fontSize) : 0);
      addLink(githubLeft, baseline, 'GitHub', github);
    }
  }
  y -= 8;
  currentPage.drawLine({
    start: { x: M, y }, end: { x: W - M, y },
    thickness: isSidebarLeft ? 1.9 : 1.25, color: colors.heading,
  });
  y -= 20;
  const profileHeading = cvSummaryTitle(draft.summaryHeading, draft.language).toUpperCase();
  printParagraph(profileHeading, { size: 9.5, font: bold, width: fullWidth, left: M, color: colors.heading, leading: 11.7, after: 4 });
  printParagraph(draft.summary.trim(), { size: 8.9, leading: 11.7, width: fullWidth, left: M, after: 8 });
  topOfColumns = y - 1;
  // Create the first-page column treatment *after* the full-width profile.
  // Geometry is behind all future column text and does not rasterize text.
  if (isSidebarLeft) {
    currentPage.drawRectangle({
      x: M - 10, y: BOTTOM - 10, width: SIDE_W + 20,
      height: topOfColumns - BOTTOM + 17, color: SIDEBAR_FILL,
    });
  } else {
    currentPage.drawLine({
      start: { x: sideX - GAP / 2, y: BOTTOM - 3 },
      end: { x: sideX - GAP / 2, y: topOfColumns + 12 },
      thickness: 0.8, color: DIVIDER,
    });
  }

  const sectionHeading = (value: string) => {
    ensure(29);
    y -= 4;
    printParagraph(value.toUpperCase(), {
      font: bold, size: 9.2, leading: 11, color: colors.heading, after: 2,
    });
    currentPage.drawLine({
      start: { x, y: y + 2 }, end: { x: x + width, y: y + 2 },
      color: DIVIDER, thickness: 0.55,
    });
    y -= 9;
  };

  const entry = (title: string, date: string, description?: string) => {
    ensure(32);
    printParagraph('**' + title + '**', { size: 9.0, leading: 11.3, after: 1 });
    if (date.trim()) printParagraph(date, { size: 7.95, color: MUTED_COLOR, leading: 9.5, after: 2 });
    if (description?.trim()) printParagraph(description, { size: 8.4, leading: 10.55, after: 3 });
  };

  const renderSection = (key: CvSectionKey) => {
    const fr = draft.language === 'FR';
    if (key === 'education' && draft.education.length) {
      sectionHeading(fr ? 'Formation' : 'Education');
      for (const item of draft.education) {
        const edu = cvEducationDisplay(item);
        entry(edu.school, item.period, [item.degree, edu.location].filter(Boolean).join(' | '));
        if (item.bullets?.some(Boolean)) {
          for (const bullet of item.bullets.filter(Boolean)) printParagraph(bullet, { bullet: true, after: 1 });
        } else if (item.details.trim()) printParagraph(item.details.trim(), { size: 8.4, leading: 10.55, after: 2 });
        if (item.keyCourses?.trim()) {
          printParagraph('**' + (fr ? 'Cours pertinents :' : 'Relevant courses:') + '** ' + item.keyCourses, {
            size: 8.1, leading: 10.1, after: 3,
          });
        }
        y -= 5;
      }
    }
    if (key === 'experience' && draft.experience.length) {
      sectionHeading(fr ? 'Expérience' : 'Experience');
      for (const item of draft.experience) {
        entry(item.role + ' - ' + item.company, item.period, cvExperienceLocationForDisplay(item.location));
        const desc = cvExperienceDescription(item, draft.language);
        if (desc) printParagraph(desc, { size: 8.3, leading: 10.5, after: 2 });
        for (const bullet of item.bullets.filter(Boolean)) printParagraph(bullet, { bullet: true, after: 1 });
        y -= 6;
      }
    }
    if (key === 'projects' && draft.projects.length) {
      sectionHeading(fr ? 'Projets sélectionnés' : 'Selected Projects');
      for (const item of draft.projects) {
        entry(item.name, item.period, cvProjectDescription(item, draft.language));
        if (draft.showMissionLabels !== false && item.bullets.some(Boolean)) {
          printParagraph(fr ? '**Missions :**' : '**Tasks:**', { size: 8.2, after: 1 });
        }
        for (const bullet of item.bullets.filter(Boolean)) printParagraph(bullet, { bullet: true, after: 1 });
        y -= 6;
      }
    }
    if (key === 'skills' && draft.skills.trim()) {
      sectionHeading(fr ? 'Compétences techniques' : 'Technical Skills');
      for (const line of cvSkillsForDisplay(draft.skills, draft.language)) {
        printParagraph(line, { size: 8.2, leading: 10.4, after: 3 });
      }
    }
    if (key === 'certifications' && draft.certifications?.some(cert => cert.visible !== false && cert.title.trim())) {
      sectionHeading(fr ? 'Certifications & formations' : 'Certifications & Training');
      for (const cert of draft.certifications.filter(cert => cert.visible !== false && cert.title.trim())) {
        printParagraph('**' + cert.title + '**', { size: 8.25, leading: 10.3, after: 0.5 });
        printParagraph([cert.issuer, cert.date].filter(Boolean).join(' | '), { size: 7.75, leading: 9.5, after: 4, color: MUTED_COLOR });
      }
    }
    if (key === 'leadership' && draft.leadership?.length) {
      sectionHeading('Leadership');
      for (const lead of draft.leadership) {
        entry([lead.role, lead.organization].filter(Boolean).join(' - '), lead.period);
        for (const bullet of lead.bullets.filter(Boolean)) printParagraph(bullet, { size: 8, leading: 10, bullet: true, after: 1 });
      }
    }
    if (key === 'languages' || key === 'interests') {
      const both = draft.sectionOrder.filter(section => section === 'languages' || section === 'interests');
      if (key !== both[0] || (!draft.languages.trim() && !draft.interests.trim())) return;
      sectionHeading(fr ? 'Langues & centres d’intérêt' : 'Languages & Interests');
      if (draft.languages.trim()) printParagraph(cvLanguagesForDisplay(draft.languages), { size: 8.2, leading: 10.4, after: 3 });
      if (draft.interests.trim()) printParagraph('**' + (fr ? 'Centres d’intérêt :' : 'Interests:') + '** ' + draft.interests, { size: 8.2, leading: 10.4, after: 3 });
    }
  };

  // Reading order in PDF text extraction: full-width header/profile, then the
  // complete professional/main column, then compact skills/sidebar column.
  const sections = cvColumnSections(draft.sectionOrder);
  const bodyStart = y;
  x = mainX;
  width = MAIN_W;
  size = 8.65;
  leading = 10.8;
  for (const section of sections.main) renderSection(section);

  pageIndex = 0;
  currentPage = pages[0];
  y = bodyStart;
  x = sideX;
  width = SIDE_W;
  size = 8.2;
  leading = 10.4;
  for (const section of sections.sidebar) renderSection(section);
  return pdf.save();
}
