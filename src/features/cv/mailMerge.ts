import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

export function parseRecipients(source: string) {
  const text = source.replace(/^\uFEFF/, '');
  const separator =
    text.match(/^(?:"(?:[^"]|"")*"|[^,;\t\r\n"])*([,;\t])/)?.[1] ?? ',';
  const records: string[][] = [];
  let row: string[] = [],
    field = '',
    quoted = false;
  function finishRow() {
    row.push(field);
    if (row.some((value) => value.trim())) records.push(row);
    row = [];
    field = '';
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && char === separator) {
      row.push(field);
      field = '';
    } else if (!quoted && /[\r\n]/.test(char)) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      finishRow();
    } else field += char;
  }
  if (quoted) throw Error('Guillemet non fermé dans le CSV.');
  finishRow();
  const headers = records.shift()?.map((value) => value.trim()) ?? [];
  if (
    !headers.length ||
    headers.some((h) => !h || /[«»]/.test(h)) ||
    new Set(headers).size !== headers.length
  )
    throw Error(
      'Chaque colonne doit avoir un titre unique et non vide, sans guillemets français.',
    );
  if (!records.length || records.some((row) => row.length !== headers.length))
    throw Error(
      'Vérifie que chaque destinataire a autant de colonnes que l’en-tête.',
    );
  return { headers, records };
}

const word = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export function mergeDocument(
  template: Uint8Array,
  headers: string[],
  record: string[],
) {
  const parts = unzipSync(template);
  const values = new Map(headers.map((name, i) => [name, record[i]]));
  let count = 0;
  for (const path of Object.keys(parts).filter((path) =>
    /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/.test(path),
  )) {
    const dom = new DOMParser().parseFromString(
      strFromU8(parts[path]),
      'application/xml',
    );
    if (dom.querySelector('parsererror')) throw Error('Partie DOCX illisible.');
    for (const paragraph of dom.getElementsByTagNameNS(word, 'p')) {
      const nodes = Array.from(
        paragraph.getElementsByTagNameNS(word, 't'),
      ).filter((node) => {
        let parent = node.parentElement;
        while (
          parent &&
          !(parent.namespaceURI === word && parent.localName === 'p')
        )
          parent = parent.parentElement;
        return parent === paragraph;
      });
      let offset = 0;
      const spans = nodes.map((node) => {
        const start = offset;
        offset += node.textContent?.length ?? 0;
        return { node, start, end: offset };
      });
      const text = nodes.map((node) => node.textContent).join('');
      for (const match of Array.from(text.matchAll(/«([^«»]+)»/g)).reverse()) {
        const value = values.get(match[1]);
        if (value === undefined)
          throw Error('Colonne CSV manquante pour ' + match[0]);
        const from = match.index!,
          to = from + match[0].length;
        for (const { node, start, end } of spans.filter(
          (s) => s.end > from && s.start < to,
        )) {
          const original = node.textContent ?? '';
          const first = start <= from;
          node.textContent =
            original.slice(0, Math.max(0, from - start)) +
            (first ? value : '') +
            original.slice(Math.max(0, to - start));
          node.setAttributeNS(
            'http://www.w3.org/XML/1998/namespace',
            'xml:space',
            'preserve',
          );
        }
        count++;
      }
      for (const node of nodes) {
        const lines = (node.textContent ?? '').split(/\r\n?|\n/);
        if (lines.length < 2) continue;
        node.textContent = lines.shift()!;
        let previous = node;
        for (const line of lines) {
          const next = node.cloneNode(false) as Element;
          next.textContent = line;
          previous.after(dom.createElementNS(word, 'w:br'), next);
          previous = next;
        }
      }
    }
    parts[path] = strToU8(new XMLSerializer().serializeToString(dom));
  }
  if (!count) throw Error('Insère un champ «NomDeColonne» dans le document.');
  return zipSync(parts);
}
