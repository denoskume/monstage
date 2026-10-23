import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProspectionPage } from './ProspectionPage';

describe('ProspectionPage', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it('adds a targeted spontaneous opportunity and persists it', () => {
    render(<MemoryRouter><ProspectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /nouvelle piste/i }));
    fireEvent.change(screen.getByPlaceholderText('Ex. Safran'), {target:{value:'Safran'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Analyse de données industrielles'), {target:{value:'Vision industrielle'}});
    fireEvent.click(screen.getByRole('button', { name: /enregistrer la piste/i }));
    expect(screen.getByText('Safran')).toBeInTheDocument();
    expect(screen.getByText(/Vision industrielle/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')[0].company).toBe('Safran');
  });
  it('imports Safran targets once without duplicates', () => {
    render(<MemoryRouter><ProspectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button',{name:/Ajouter les pistes Safran/}));
    expect(screen.getByText('Safran Trusted 4D')).toBeInTheDocument();
    expect(screen.getByText('Safran.AI')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Préparer le CV dans Studio'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Préparer la lettre dans Studio'})).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button',{name:/Ajouter les pistes Safran/}));
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')).toHaveLength(4);
  });
  it('migrates existing three Safran targets to four without deleting data', () => {
    const names = ['Safran Trusted 4D', 'Safran Aircraft Engines', 'Safran Helicopter Engines'];
    const sites = ['Nantes', 'Villaroche (Réau / Moissy-Cramayel)', 'Bordes'];
    localStorage.setItem('monstage.prospection.v1', JSON.stringify(names.map((company,i)=>({id:String(i),company,site:sites[i],team:'',role:'Saved role',contact:'',contactLink:'',channel:'',status:'À identifier',date:'',followUp:'',notes:'Original note'}))));
    render(<MemoryRouter><ProspectionPage /></MemoryRouter>);
    expect(screen.getByText('Safran.AI')).toBeInTheDocument();
    const saved=JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]');
    expect(saved).toHaveLength(4);
    expect(saved.filter((x:{notes:string})=>x.notes==='Original note')).toHaveLength(3);
  });
  it('filters a locally saved lead by keyword', () => {
    localStorage.setItem('monstage.prospection.v1', JSON.stringify([{id:'1',company:'Safran',site:'Nantes',team:'R&D',role:'Computer Vision',contact:'',contactLink:'',channel:'',status:'À contacter',date:'',followUp:'',notes:''}]));
    render(<MemoryRouter><ProspectionPage /></MemoryRouter>);
    const input=screen.getByRole('textbox',{name:'Rechercher une piste'});
    fireEvent.change(input,{target:{value:'Airbus'}});
    expect(screen.getByText(/Aucune piste pour ce filtre/)).toBeInTheDocument();
    fireEvent.change(input,{target:{value:'Safran'}});
    expect(screen.getByText('Safran')).toBeInTheDocument();
  });
});
