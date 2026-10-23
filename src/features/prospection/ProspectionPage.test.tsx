import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProspectionPage } from './ProspectionPage';

describe('ProspectionPage', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it('adds a targeted spontaneous opportunity and persists it', () => {
    render(<ProspectionPage />);
    fireEvent.click(screen.getByRole('button', { name: /nouvelle piste/i }));
    fireEvent.change(screen.getByPlaceholderText('Ex. Safran'), {target:{value:'Safran'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Analyse de données industrielles'), {target:{value:'Vision industrielle'}});
    fireEvent.click(screen.getByRole('button', { name: /enregistrer la piste/i }));
    expect(screen.getByText('Safran')).toBeInTheDocument();
    expect(screen.getByText(/Vision industrielle/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')[0].company).toBe('Safran');
  });
  it('imports Safran targets once without duplicates', () => {
    render(<ProspectionPage />);
    fireEvent.click(screen.getByRole('button',{name:/Ajouter les pistes Safran/}));
    expect(screen.getByText('Safran Trusted 4D')).toBeInTheDocument();
    expect(screen.getByText('Safran.AI')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button',{name:/Ajouter les pistes Safran/}));
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')).toHaveLength(4);
  });
  it('filters a locally saved lead by keyword', () => {
    localStorage.setItem('monstage.prospection.v1', JSON.stringify([{id:'1',company:'Safran',site:'Nantes',team:'R&D',role:'Computer Vision',contact:'',contactLink:'',channel:'',status:'À contacter',date:'',followUp:'',notes:''}]));
    render(<ProspectionPage />);
    const input=screen.getByRole('textbox',{name:'Rechercher une piste'});
    fireEvent.change(input,{target:{value:'Airbus'}});
    expect(screen.getByText(/Aucune piste pour ce filtre/)).toBeInTheDocument();
    fireEvent.change(input,{target:{value:'Safran'}});
    expect(screen.getByText('Safran')).toBeInTheDocument();
  });
});
