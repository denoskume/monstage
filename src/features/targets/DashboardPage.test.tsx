import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../dashboard/DashboardPage';

const makeOffer=(id:string, company:string, title:string, city:string, status:string, publishedAt='2026-11-10')=>({
  id, company, title, city, domain:'Plan A/B', specialization:title, region:null, m2Fit:'Oui',
  start:'Février 2027',duration:'6 mois',compensation:null, skills:['Python'],
  publishedAt,offerStatus:'Active', applicationStatus:status, nextAction:'Préparer dossier',
  applicationUrl:null, shortlist:false, appliedAt:status==='À candidater'?null:'10/11/2026',
  followUpAt:status==='Candidature envoyée'?'12/11/2026':null,
  technicalFit:95, decisionScore:95, priority:'A',freshness:null,verifiedAt:null,
  sourceQuality:'Officiel',actionLevel:null,calendarFit:null,confidence:null,relevance:null,gaps:null,
});
const feed = [
  makeOffer('test-airbus','Airbus','Stage Computer Vision - inspection','Paris','À candidater'),
  makeOffer('test-alstom','Alstom','Stage Data Analyst Power BI','Nantes','Candidature envoyée'),
  makeOffer('test-sncf','SNCF','Stage Computer Vision - sécurité','Nantes','Entretien'),
  makeOffer('test-renault','Renault Group','Stage Data Analyst - performance','Lyon','Refus'),
];
vi.mock('../../hooks/useOffers', () => ({useOffers:()=>({data:{
  source:'Stage Intelligence France',generatedAt:'2026-11-15T07:00:00Z',offers:feed
},loading:false,error:null,retry:vi.fn()})}));

function mount(path='/dashboard') {
  return render(<MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/dashboard/:sectorId" element={<DashboardPage/>}/></Routes>
  </MemoryRouter>);
}

describe('interactive decision dashboard',()=>{
  beforeEach(()=>localStorage.clear());
  it('replaces the old dashboard with KPI, charts, France map, filters and decision queue',()=>{
    mount();
    expect(screen.getByRole('heading',{name:'Dashboard'})).toBeInTheDocument();
    for (const title of ['Avancement des candidatures','Opportunités par secteur','Carte des opportunités','Chronologie des envois','À traiter en priorité']) {
      expect(screen.getByRole('heading',{name:title})).toBeInTheDocument();
    }
    expect(screen.getByLabelText('Filtres du Dashboard')).toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'30 entreprises · deux plans'})).not.toBeInTheDocument();
    expect(screen.getByText('Dossiers analysés').nextElementSibling).not.toHaveTextContent('0');
  });
  it('renders the three illustrated decision cards and filters Plan B directly',()=>{
    mount();
    expect(screen.getByRole('button',{name:/Computer Vision/})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:/Data & BI/})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:/Explorer les villes/})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Mon agenda de candidatures'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Data & BI/}));
    expect(screen.getByLabelText('Parcours · filtre rapide')).toHaveValue('B');
    expect(screen.getByRole('button',{name:/Data & BI/})).toHaveAttribute('aria-pressed','true');
    fireEvent.click(screen.getByRole('button',{name:/Data & BI/}));
    expect(screen.getByLabelText('Parcours · filtre rapide')).toHaveValue('all');
  });
  it('cross-filters the KPIs, sector chart and map from a sector click',()=>{
    mount();
    fireEvent.click(screen.getByRole('button',{name:'Filtrer secteur Ferroviaire & transport public'}));
    expect(screen.getByLabelText('Filtrer par secteur')).toHaveValue('ferroviaire');
    expect(screen.getByText('Dossiers analysés').nextElementSibling).toHaveTextContent('2');
    expect(screen.getByRole('button',{name:/Filtrer ville Nantes/})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Filtrer ville Nantes/}));
    expect(screen.getByLabelText('Filtrer par ville')).toHaveValue('Nantes');
    fireEvent.click(screen.getByRole('button',{name:'Réinitialiser'}));
    expect(screen.getByLabelText('Filtrer par secteur')).toHaveValue('');
    expect(screen.getByLabelText('Filtrer par ville')).toHaveValue('');
  });
  it('supports Plan B and exact status filtering, without modifying source data',()=>{
    mount();
    fireEvent.change(screen.getByLabelText('Filtrer par plan'),{target:{value:'B'}});
    expect(screen.getByLabelText('Filtrer par plan')).toHaveValue('B');
    fireEvent.click(screen.getByRole('button',{name:'Filtrer statut Envoyée'}));
    expect(screen.getByLabelText('Filtrer par statut')).toHaveValue('Envoyée');
    // Another saved manual application may also have been sent in Plan B.
    // Company drill-down isolates the Alstom source record.
    fireEvent.change(screen.getByLabelText('Filtrer par entreprise'),{target:{value:'Alstom'}});
    expect(screen.getByText('Dossiers analysés').nextElementSibling).toHaveTextContent('1');
    expect(feed[1].applicationStatus).toBe('Candidature envoyée');
  });
});
