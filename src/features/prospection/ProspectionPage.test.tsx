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
    fireEvent.change(screen.getByPlaceholderText('Ex. Computer Vision / traitement d’images'), {target:{value:'Vision industrielle'}});
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
    expect(screen.getByText(/Candidature spontanée clôturée/)).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Consulter le dossier conservé'})).toHaveAttribute('href','/workspace?offer=EXT-SAFRANAI-20261025');
    expect(screen.queryByRole('link',{name:'Candidature spontanée officielle'})).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button',{name:/Ajouter les pistes Safran/}));
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]')).toHaveLength(3);
  });
  it('prefills and saves an Alstom Plan B spontaneous application', () => {
    render(<MemoryRouter initialEntries={['/prospection?company=Alstom&plan=B']}><ProspectionPage /></MemoryRouter>);
    expect(screen.getByDisplayValue('Alstom')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Data Analyst/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /enregistrer la piste/i }));
    expect(screen.getByText('Alstom')).toBeInTheDocument();
    expect(screen.getAllByText(/Plan B/).length).toBeGreaterThan(0);
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
  it('migrates the exact Safran.AI spontaneous application into Refus with no follow-up',()=>{
    const lead = {id:'safran-original',company:'Safran.AI',site:'Paris (9e)',team:'Computer Vision',role:'Stage de fin d’études — Machine Learning et Computer Vision',contact:'',contactLink:'',channel:'Lever',status:'Candidature envoyée',date:'2026-10-25',followUp:'2026-11-09',notes:'CV v9 et lettre v3 envoyés'};
    localStorage.setItem('monstage.prospection.v1',JSON.stringify([lead]));
    render(<MemoryRouter><ProspectionPage/></MemoryRouter>);
    const saved=JSON.parse(localStorage.getItem('monstage.prospection.v1')||'[]');
    expect(saved[0]).toMatchObject({status:'Refus',followUp:'',date:'2026-10-25'});
    expect(saved[0].notes).toContain('CV v9 et lettre v3 envoyés');
    expect(saved[0].notes).toContain('02/11/2026');
    expect(screen.getByText(/Candidature spontanée clôturée/)).toBeInTheDocument();
    expect(screen.queryByText(/Relance : 2026-11-09/)).not.toBeInTheDocument();
  });
  it('allows drafting but blocks outreach without a specific team, site, rationale and channel',()=>{
    render(<MemoryRouter><ProspectionPage/></MemoryRouter>);
    fireEvent.click(screen.getByRole('button',{name:/nouvelle piste/i}));
    fireEvent.change(screen.getByPlaceholderText('Ex. Safran'),{target:{value:'Alstom'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Computer Vision / traitement d’images'),{target:{value:'Stage Data Analyst Power BI'}});
    fireEvent.change(screen.getByLabelText('Statut'),{target:{value:'À contacter'}});
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(screen.getByRole('alert')).toHaveTextContent('préciser le site et l’équipe');
    expect(localStorage.getItem('monstage.prospection.v1')).toBe('[]');
    fireEvent.change(screen.getByPlaceholderText('Ex. Nantes'),{target:{value:'Villeurbanne'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Qualité, R&D'),{target:{value:'Équipe maintenance prédictive'}});
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(screen.getByRole('alert')).toHaveTextContent('expliquer le besoin');
    fireEvent.change(screen.getByPlaceholderText('Pourquoi cette équipe ? Quelle contribution concrète ?'),{target:{value:'Analyser les historiques de pannes et construire des indicateurs de fiabilité Power BI.'}});
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(screen.getByRole('alert')).toHaveTextContent('préciser le canal');
    fireEvent.change(screen.getByPlaceholderText('Site carrières, LinkedIn, forum…'),{target:{value:'Portail carrières Alstom'}});
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1')||'[]')).toHaveLength(1);
  });
  it('requires a submission date and confirmation before recording an application as sent',()=>{
    render(<MemoryRouter><ProspectionPage/></MemoryRouter>);
    fireEvent.click(screen.getByRole('button',{name:/nouvelle piste/i}));
    fireEvent.change(screen.getByPlaceholderText('Ex. Safran'),{target:{value:'Alstom'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Computer Vision / traitement d’images'),{target:{value:'Stage Data Analyst'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Nantes'),{target:{value:'Villeurbanne'}});
    fireEvent.change(screen.getByPlaceholderText('Ex. Qualité, R&D'),{target:{value:'Analyse maintenance'}});
    fireEvent.change(screen.getByPlaceholderText('Pourquoi cette équipe ? Quelle contribution concrète ?'),{target:{value:'Tableaux de bord de suivi des incidents et indicateurs qualité sur la flotte ferroviaire.'}});
    fireEvent.change(screen.getByPlaceholderText('Site carrières, LinkedIn, forum…'),{target:{value:'Site officiel Alstom'}});
    fireEvent.change(screen.getByLabelText('Statut'),{target:{value:'Candidature envoyée'}});
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(screen.getByRole('alert')).toHaveTextContent('date réelle de soumission');
    fireEvent.change(screen.getByLabelText('Date de candidature / contact'),{target:{value:'2026-11-03'}});
    vi.spyOn(window,'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(localStorage.getItem('monstage.prospection.v1')).toBe('[]');
    vi.spyOn(window,'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button',{name:/enregistrer la piste/i}));
    expect(JSON.parse(localStorage.getItem('monstage.prospection.v1')||'[]')[0].status).toBe('Candidature envoyée');
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
