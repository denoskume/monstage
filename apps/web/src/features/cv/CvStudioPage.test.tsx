import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CvStudioPage } from './CvStudioPage';

describe('Studio CV — éditeur HTML unique', () => {
  test('affiche uniquement le nouvel éditeur Thierry, sans ancienne interface React', () => {
    render(<MemoryRouter><CvStudioPage /></MemoryRouter>);
    const editor = screen.getByTitle('Éditeur CV Thierry KUME — Plan A et Plan B');
    expect(editor).toHaveAttribute('src', '/monstage/cv/thierry-editor.html');
    expect(screen.queryByLabelText('Modèle de CV')).not.toBeInTheDocument();
    expect(screen.queryByText('Régénérer CV')).not.toBeInTheDocument();
  });

  test('une navigation sans plan explicite conserve le dernier CV édité', () => {
    render(<MemoryRouter initialEntries={['/cv']}><CvStudioPage /></MemoryRouter>);
    expect(screen.getByTitle('Éditeur CV Thierry KUME — Plan A et Plan B'))
      .toHaveAttribute('src', '/monstage/cv/thierry-editor.html');
  });

  test('la version B explicitement demandée continue de s’ouvrir directement', () => {
    render(<MemoryRouter initialEntries={['/cv?plan=B']}><CvStudioPage /></MemoryRouter>);
    expect(screen.getByTitle('Éditeur CV Thierry KUME — Plan A et Plan B'))
      .toHaveAttribute('src', '/monstage/cv/thierry-editor.html?plan=B');
  });

  test('sert le fichier HTML approuvé avec A/B, édition directe et exports PDF/Word', () => {
    const html = readFileSync(resolve('apps/web/public/cv/thierry-editor.html'), 'utf8');
    expect(html).toContain('data-tab="B"');
    expect(html).toContain('Data Scientist');
    expect(html).toContain('contenteditable');
    expect(html).toContain('id="export-docx"');
    expect(html).toContain('id="export-pdf"');
    expect(html).toContain('function exportPDF');
    expect(html).toContain('Résultats :');
    expect(html).toContain('Expériences acquises :');
  });
  test('propose une barre mini-Word et permet l’édition de tous les titres de sections', () => {
    const html = readFileSync(resolve('apps/web/public/cv/thierry-editor.html'), 'utf8');
    for (const control of [
      'font-family','font-size','font-color','highlight-color','block-bg',
      'paper-bg','sidebar-bg','underline','strike','align-left','align-center',
      'align-right','align-justify','bullets','numbering','undo','redo','clear-format',
    ]) {
      expect(html).toContain('id="' + control + '"');
    }
    expect(html).toContain('class="heading" contenteditable="true"');
    expect(html).toContain('class="right-heading" contenteditable="true"');
    expect(html).toContain('class="side-heading" contenteditable="true"');
    expect(html).toContain('class="blue-heading" contenteditable="true"');
    expect(html).toContain('monstage:thierry-miniword:v1:');
    expect(html).toContain('id="save-cv"');
    expect(html).toContain('id="cv-versions-panel"');
    expect(html).toContain('monstage:thierry-miniword:v2:versions:');
    expect(html).toContain('function saveSnapshot(');
    expect(html).toContain('window.addEventListener(\'pagehide\'');
    expect(html).toContain('part.font,part.shade,part.strike');
    expect(html).toContain("const extraFonts=['Helvetica'");
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeDefined();
    expect(() => new Function(script ?? '')).not.toThrow();
  });

});
