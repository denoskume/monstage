import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
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
  // PDFMake treats an image as a block. Keep text on both sides of an
  // inline drawing, including its run styles and hyperlinks.
  clone.querySelectorAll('p:has(img)').forEach(paragraph => {
    if (!paragraph.textContent?.trim()) return;
    const range = paragraph.ownerDocument.createRange();
    range.selectNodeContents(paragraph);
    const output = paragraph.ownerDocument.createDocumentFragment();
    function appendText() {
      const fragment = range.cloneContents();
      if (!fragment.textContent?.length) return;
      const block = paragraph.cloneNode(false);
      block.appendChild(fragment);
      output.appendChild(block);
    }
    for (const image of paragraph.querySelectorAll('img')) {
      range.setEndBefore(image);
      appendText();
      const block = paragraph.cloneNode(false);
      block.appendChild(image.cloneNode(true));
      output.appendChild(block);
      range.setStartAfter(image);
    }
    range.setEnd(paragraph, paragraph.childNodes.length);
    appendText();
    paragraph.replaceWith(output);
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

// docx-preview paints a run containing a drawing as a drawing-only run.
function printableRuns(source: Uint8Array) {
  const parts = unzipSync(source);
  const word = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  let changed = false;
  for (const path of Object.keys(parts).filter(path => /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/.test(path))) {
    const xml = strFromU8(parts[path]);
    if (!xml.includes(':drawing')) continue;
    const dom = new DOMParser().parseFromString(xml, 'application/xml');
    let dirty = false;
    for (const run of Array.from(dom.getElementsByTagNameNS(word, 'r'))) {
      const children = Array.from(run.children);
      const properties = children.find(child => child.namespaceURI === word && child.localName === 'rPr');
      const content = children.filter(child => child !== properties);
      if (content.length < 2 || !content.some(child => child.namespaceURI === word && child.localName === 'drawing')) continue;
      for (const child of content) {
        const single = run.cloneNode(false);
        if (properties) single.appendChild(properties.cloneNode(true));
        single.appendChild(child);
        run.parentNode!.insertBefore(single, run);
      }
      run.remove();
      dirty = true;
    }
    if (dirty) {
      parts[path] = strToU8(new XMLSerializer().serializeToString(dom));
      changed = true;
    }
  }
  return changed ? zipSync(parts, {level:0}) : source;
}

export async function documentPdf(source: Uint8Array): Promise<{ bytes: Uint8Array }> {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-10000px;width:900px;height:1000px;border:0';
  document.body.append(frame);
  try {
    const dom = frame.contentDocument!;
    await renderAsync(printableRuns(source), dom.body, dom.head, { inWrapper: false, useBase64URL: true, renderAltChunks: false });
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
