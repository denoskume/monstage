import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CvStudioPage } from './CvStudioPage';

describe('Studio CV — éditeur HTML unique', () => {
  test('affiche uniquement le nouvel éditeur Thierry, sans ancienne interface React', () => {
    render(<CvStudioPage />);
    const editor = screen.getByTitle('Éditeur CV Thierry KUME — Plan A et Plan B');
    expect(editor).toHaveAttribute('src', '/monstage/cv/thierry-editor.html');
    expect(screen.queryByLabelText('Modèle de CV')).not.toBeInTheDocument();
    expect(screen.queryByText('Régénérer CV')).not.toBeInTheDocument();
  });

  test('sert le fichier HTML approuvé avec A/B, édition directe et exports PDF/Word', () => {
    const html = readFileSync(resolve('public/cv/thierry-editor.html'), 'utf8');
    expect(html).toContain('CV B · Data Scientist');
    expect(html).toContain('contenteditable');
    expect(html).toContain('id="export-docx"');
    expect(html).toContain('id="export-pdf"');
    expect(html).toContain('function exportPDF');
    expect(html).toContain('Résultats :');
    expect(html).toContain('Expériences acquises :');
  });
});
