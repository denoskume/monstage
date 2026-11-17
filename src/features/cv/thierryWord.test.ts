import { describe, expect, test } from 'vitest';
import { freshCvDraft } from './cvStorage';
import { referenceThierryCv } from './thierryStudioDefaults';
import { buildThierryWordBytes } from './thierryWord';

describe('Thierry-only Word export', () => {
  test.each(['A','B'] as const)('Plan %s exports an editable DOCX with two fixed columns', plan => {
    const draft=referenceThierryCv(freshCvDraft('FR',plan),plan);
    const bytes=buildThierryWordBytes(draft);
    expect(bytes[0]).toBe(0x50); // PK ZIP
    expect(bytes[1]).toBe(0x4b);
    const body=new TextDecoder().decode(bytes);
    expect(body).toContain('[Content_Types].xml');
    expect(body).toContain('word/document.xml');
    expect(body).toContain('<w:tblGrid><w:gridCol w:w="2960"/><w:gridCol w:w="8600"/>');
    expect(body).toContain('w:fill="BFBFBF"');
    expect(body).toContain('w:color="0070C0"');
    expect(body).toContain('w:pgSz w:w="11906" w:h="16838"');
    const start=body.indexOf('<w:document');
    const end=body.indexOf('</w:document>',start);
    expect(start).toBeGreaterThan(0);
    const xml=body.slice(start,end+'</w:document>'.length);
    const parsed=new DOMParser().parseFromString(xml,'application/xml');
    expect(parsed.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(parsed.getElementsByTagName('w:tc')).toHaveLength(2);
    expect(xml).toContain(draft.headline);
    expect(xml).toContain('Mission');
    expect(xml).toContain('Résultats');
    expect(xml).toContain('Expériences acquises');
    const mission=xml.indexOf('Mission');
    const results=xml.indexOf('Résultats');
    const acquired=xml.indexOf('Expériences acquises');
    expect(mission).toBeLessThan(results);
    expect(results).toBeLessThan(acquired);
  });
});
