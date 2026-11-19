import { renderAsync } from 'docx-preview';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import embeddedFonts from 'pdfmake/build/vfs_fonts';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

const points = (css: string) => (parseFloat(css) || 0) * 0.75;

// docx-preview resolves named Word styles through CSS. Carry those computed
// values into the PDF definition before detaching the document.
function sectionContent(section: HTMLElement): Content {
  const view = section.ownerDocument.defaultView!;
  const clone = section.cloneNode(true) as HTMLElement;
  const targets = clone.querySelectorAll<HTMLElement>('*');
  section.querySelectorAll<HTMLElement>('*').forEach((node, index) => {
    const target = targets[index];
    const css = view.getComputedStyle(node);
    for (const prop of ['color', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration-line']) {
      target.style.setProperty(prop === 'text-decoration-line' ? 'text-decoration' : prop, css.getPropertyValue(prop));
    }
    if (css.backgroundColor !== 'rgba(0, 0, 0, 0)') target.style.backgroundColor = css.backgroundColor;
    if (node.tagName === 'P') target.style.margin = css.margin;
    if (node.tagName === 'TABLE') {
      const cols = Array.from(node.querySelectorAll(':scope > colgroup > col'));
      const widths = cols.map(col => parseFloat(view.getComputedStyle(col).width));
      const total = widths.reduce((a, b) => a + b, 0);
      if (total > 0) target.dataset.pdfmake = JSON.stringify({ widths: widths.map(w => (100*w/total)+'%') });
    }
    if (node.tagName === 'TR') target.style.removeProperty('height');
  });
  // A line break inside a contact address can prevent extraction as one email.
  clone.querySelectorAll('p').forEach(paragraph => {
    const address = paragraph.textContent?.trim();
    if (address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(address)) {
      paragraph.style.whiteSpace = 'nowrap';
      paragraph.dataset.pdfmake = JSON.stringify({ noWrap: true, link: 'mailto:' + address });
    }
  });
  return htmlToPdfmake(clone.innerHTML, {
    tableAutoSize: true, ignoreStyles: ['font-family'],
    defaultStyles: { p: { margin: 0 }, table: { margin: 0 } },
  });
}

export async function documentPdf(source: Uint8Array): Promise<{ bytes: Uint8Array }> {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-10000px;width:900px;height:1000px;border:0';
  document.body.append(frame);
  try {
    const dom = frame.contentDocument!;
    await renderAsync(source, dom.body, dom.head, { inWrapper: false, useBase64URL: true, renderAltChunks: false });
    const sections = Array.from(dom.querySelectorAll<HTMLElement>('section.docx'));
    if (!sections.length) throw new Error('Aucune page à exporter.');
    const css = frame.contentWindow!.getComputedStyle(sections[0]);
    const size = { width: points(css.width) || 595.28, height: points(css.minHeight) || 841.89 };
    const definition: TDocumentDefinitions = {
      pageSize: size, pageMargins: [points(css.paddingLeft), points(css.paddingTop), points(css.paddingRight), points(css.paddingBottom)],
      defaultStyle: { font: 'Roboto', fontSize: 11 },
      content: sections.map((section, index) => ({
        stack: [sectionContent(section)], ...(index ? { pageBreak: 'before' as const } : {}),
      })),
    };
    const fonts = embeddedFonts as unknown as Record<string, string>;
    const stream = pdfMake.createPdf(definition, undefined, undefined, fonts).getStream();
    return await new Promise((resolve, reject) => {
      const parts: Uint8Array[] = [];
      stream.on('data', part => parts.push(part));
      stream.on('error', reject);
      stream.on('end', () => {
        const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
        let pos = 0;
        for (const part of parts) { bytes.set(part, pos); pos += part.length; }
        resolve({ bytes });
      });
      stream.end();
    });
  } finally { frame.remove(); }
}
