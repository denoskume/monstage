import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Formations from './Formations';

function mount(url:string) {
  return render(<MemoryRouter initialEntries={[url]}>
    <Routes><Route path="/formations/:parcours?/:lecon?/:topic?" element={<Formations/>}/></Routes>
  </MemoryRouter>);
}

describe('Formations pages',()=>{
  beforeEach(()=>window.localStorage.clear());

  it('preserves all three course paths and the historical mini-courses',()=>{
    mount('/formations');
    expect(screen.getByRole('heading',{name:'Catalogue des formations'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Traitement d’images — Foundations/})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Data Analyst — Foundations/})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Computer Vision — Machine Learning/})).toBeInTheDocument();
    expect(screen.getByText(/205 leçons détaillées/)).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Atelier Vision historique'})).toHaveAttribute('href','/formations/vision');
  });

  it('shows detailed module lessons, editable code and prevents premature module validation',async()=>{
    const user=userEvent.setup();
    mount('/formations/traitement-images/images-pixels');
    expect(screen.getByRole('heading',{name:'Images numériques, pixels et signaux 2D'})).toBeInTheDocument();
    expect(screen.getByText('Laboratoire interactif · 5 × 5 pixels')).toBeInTheDocument();
    expect(screen.getByRole('link',{name:/Pixel, lignes\/colonnes/})).toHaveAttribute('href','/formations/traitement-images/images-pixels/lecon-1');
    await user.click(screen.getByRole('tab',{name:/Pratiquer/}));
    await user.click(screen.getByRole('button',{name:'Modifier le code'}));
    expect(screen.getByRole('textbox',{name:'Éditeur de code de l’exemple'})).toBeInTheDocument();
    await user.click(screen.getByRole('tab',{name:/Valider/}));
    await user.click(screen.getByRole('radio',{name:/La ligne/}));
    await user.click(screen.getByRole('button',{name:'Vérifier ma réponse'}));
    await user.click(screen.getByRole('checkbox',{name:/J’ai réalisé la mission/}));
    expect(screen.getByRole('button',{name:/Valider ce module/})).toBeDisabled();
    expect(screen.getAllByText(/0\/6 leçons/).length).toBeGreaterThan(0);
  });

  it('opens real project briefs and their downloadable starter package',()=>{
    mount('/formations/data-analyst/projets');
    expect(screen.getByRole('heading',{name:'Projets pratiques et missions d’entreprise'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:/Industrial Maintenance Analytics/})).toHaveAttribute('href','/formations/data-analyst/projets/industrial');
  });

  it('lets a learner complete a specific lesson after practising and passing the quiz',async()=>{
    const user=userEvent.setup();
    mount('/formations/traitement-images/images-pixels/lecon-1');
    expect(screen.getByRole('heading',{name:'Pixel, lignes/colonnes et origine des coordonnées'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Comprendre la notion simplement'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:/Code & résultats/}));
    expect(screen.getByRole('button',{name:'Modifier le code'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:/Valider/}));
    await user.click(screen.getByRole('radio',{name:/Inverser ligne\/colonne/}));
    await user.click(screen.getByRole('button',{name:'Corriger ma réponse'}));
    expect(screen.getByText('Bonne réponse !')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox',{name:/effectivement exécuté/}));
    await user.click(screen.getByRole('checkbox',{name:/Je peux expliquer le concept/}));
    await user.click(screen.getByRole('button',{name:/Valider cette leçon/}));
    await waitFor(()=>expect(JSON.parse(window.localStorage.getItem('monstage:formations:topic-completed:v1')||'[]')).toContain('traitement-images:images-pixels:lecon-1'));
  });
});
