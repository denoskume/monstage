import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Formations from './Formations';

function mount(url: string) {
  return render(<MemoryRouter initialEntries={[url]}><Routes><Route path="/formations/:parcours?/:lecon?" element={<Formations/>}/></Routes></MemoryRouter>);
}

describe('Formations pages',()=>{
  beforeEach(()=>window.localStorage.clear());
  it('shows the three curricula without replacing the legacy routes',()=>{
    mount('/formations');
    expect(screen.getByRole('heading',{name:'Catalogue des formations'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Traitement d’images — Foundations/})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Data Analyst — Foundations/})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Computer Vision — Machine Learning/})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Atelier Vision historique'})).toHaveAttribute('href','/formations/vision');
  });
  it('provides module concepts, editable code and a quiz-gated completion',async()=>{
    const user=userEvent.setup();
    mount('/formations/traitement-images/images-pixels');
    expect(screen.getByRole('heading',{name:'Images numériques, pixels et signaux 2D'})).toBeInTheDocument();
    expect(screen.getByText('Laboratoire interactif · 5 × 5 pixels')).toBeInTheDocument();
    await user.click(screen.getByRole('tab',{name:/Pratiquer/}));
    expect(screen.getByRole('button',{name:'Modifier le code'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Modifier le code'}));
    expect(screen.getByRole('textbox',{name:'Éditeur de code de l’exemple'})).toBeInTheDocument();
    await user.click(screen.getByRole('tab',{name:/Valider/}));
    expect(screen.getByRole('button',{name:/Valider ce module/})).toBeDisabled();
    await user.click(screen.getByRole('radio',{name:/La ligne/}));
    await user.click(screen.getByRole('button',{name:'Vérifier ma réponse'}));
    expect(screen.getByText('Bonne réponse !')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox',{name:/J’ai réalisé la mission/}));
    await user.click(screen.getByRole('button',{name:/Valider ce module/}));
    await waitFor(()=>expect(JSON.parse(window.localStorage.getItem('monstage:formations:completed:v2')||'[]')).toContain('traitement-images:images-pixels'));
  });
});
