import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../dashboard/DashboardPage';
import { AuthContext, type AuthContextValue } from '../../auth/useAuth';
const authValue:AuthContextValue={status:'authenticated',token:'test',user:{email:'test@example.test',name:'Candidate',picture:null},signInWithCredential:async()=>undefined,signOut:()=>undefined,invalidateSession:()=>undefined};

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
  return render(<AuthContext.Provider value={authValue}><MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/dashboard/:sectorId" element={<DashboardPage/>}/></Routes>
  </MemoryRouter></AuthContext.Provider>);
}

describe('single-screen MonStage decision dashboard',()=>{
  beforeEach(()=>localStorage.clear());
  it('shows three decision visuals in the main space and no obsolete Activity card',()=>{
    mount();
    expect(screen.getByRole('heading',{name:'Dashboard'})).toBeInTheDocument();
    expect(screen.queryByRole('group',{name:'Activité hebdomadaire des candidatures'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'Activité des candidatures'})).not.toBeInTheDocument();
    expect(document.querySelector('.db-activity-card')).not.toBeInTheDocument();
    expect(screen.queryByRole('button',{name:/Voir toutes mes candidatures/i})).not.toBeInTheDocument();
    expect(document.querySelector('.db-primary-cta')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation',{name:'Navigation MonStage'})).toBeInTheDocument();
    expect(screen.getByRole('combobox',{name:'Choisir un plan'})).toHaveValue('all');
    expect(document.querySelector('.db-visual-panels')).toBeInTheDocument();
    expect(document.querySelectorAll('.db-primary > .db-visual-panels > .db-mini-panel')).toHaveLength(3);
    expect(screen.getByRole('heading',{name:'Campagne de stages'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Statut des dossiers'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Carte des opportunités'})).toBeInTheDocument();
    expect(screen.getByRole('img',{name:/Graphique en courbes lissées avec axes X et Y de septembre 2026 à février 2027/})).toBeInTheDocument();
    expect(screen.getByTestId('google-maps-iframe')).toBeInTheDocument();
    expect(screen.getByText('sept. 26')).toBeInTheDocument();
    expect(screen.queryByText('févr. 27')).not.toBeInTheDocument();
    expect(document.querySelector('.db-campaign-chart svg')).toHaveTextContent('Date (mois)');
    expect(document.querySelector('.db-campaign-chart svg')).toHaveTextContent('Nombre de dossiers');
    expect(document.querySelectorAll('.db-campaign-chart svg path[stroke-width="3.5"]')).toHaveLength(3);
    expect(screen.getByRole('group',{name:/Explorer le graphique des offres/})).toBeInTheDocument();
    expect(screen.getByTestId('campaign-hover-area')).toBeInTheDocument();
    expect([...document.querySelectorAll('.db-campaign-chart svg path[stroke-width="3.5"]')].every(path=>path.getAttribute('d')?.includes(' C '))).toBe(true);
    expect(document.querySelector('.db-insight-tiles')).not.toBeInTheDocument();
    expect(screen.queryByRole('button',{name:/Computer Vision/})).not.toBeInTheDocument();
    expect(screen.queryByRole('button',{name:/Data & BI/})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'Mon agenda'})).not.toBeInTheDocument();
    expect(screen.queryByText('MonStage Intelligence')).not.toBeInTheDocument();
    expect(screen.queryByText('Voir toutes mes actions')).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary',{name:'Mon agenda de candidatures'})).not.toBeInTheDocument();
    expect(screen.getByText('Opportunités').nextElementSibling).not.toHaveTextContent('0');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('reveals 3 exact values on pointer hover, filters month on click and supports keyboard',()=>{
    mount();
    const area=screen.getByTestId('campaign-hover-area');
    const chart=screen.getByRole('group',{name:/Explorer le graphique des offres/});
    const getBounds=vi.spyOn(SVGSVGElement.prototype,'getBoundingClientRect').mockReturnValue({
      x:0,y:0,width:640,height:325,left:0,top:0,right:640,bottom:325,toJSON:()=>({}),
    } as DOMRect);
    try {
      fireEvent.pointerMove(area,{clientX:265,clientY:100});
      expect(screen.getByRole('status')).toHaveTextContent('Offres repérées');
      expect(screen.getByRole('status')).toHaveTextContent('Candidatures envoyées');
      expect(screen.getByRole('status')).toHaveTextContent('Non postulées');
      fireEvent.click(area);
      expect(screen.getByRole('button',{name:'Effacer le filtre du mois'})).toBeInTheDocument();
      expect(screen.getByRole('heading',{level:1})).toHaveTextContent(/^Dashboard — /);
      fireEvent.click(screen.getByRole('button',{name:'Effacer le filtre du mois'}));
      expect(screen.queryByRole('button',{name:'Effacer le filtre du mois'})).not.toBeInTheDocument();
      chart.focus();
      fireEvent.keyDown(chart,{key:'ArrowRight'});
      expect(screen.getByRole('status')).toBeInTheDocument();
      fireEvent.keyDown(chart,{key:'ArrowRight'});
      fireEvent.keyDown(chart,{key:'Enter'});
      expect(screen.getByRole('button',{name:'Effacer le filtre du mois'})).toBeInTheDocument();
    } finally {getBounds.mockRestore();}
  });
  it('zooms the timeline without filtering dossiers and restores the entire campaign',()=>{
    mount();
    const before=screen.getByText('Opportunités').nextElementSibling?.textContent;
    fireEvent.click(screen.getByRole('button',{name:'30 derniers jours'}));
    expect(screen.getByRole('button',{name:'30 derniers jours'})).toHaveAttribute('aria-pressed','true');
    expect(screen.getByText('Opportunités').nextElementSibling?.textContent).toBe(before);
    fireEvent.click(screen.getByRole('button',{name:'Toute la campagne'}));
    expect(screen.getByText('févr. 27')).toBeInTheDocument();
  });
  it('shows counts and percentages immediately on a status hover',()=>{
    mount();
    fireEvent.mouseEnter(screen.getByRole('button',{name:'Filtrer statut À candidater'}));
    expect(screen.getByRole('tooltip')).toHaveTextContent('À candidater');
    expect(screen.getByRole('tooltip')).toHaveTextContent('%');
  });
  it('toggles each campaign line from its legend',()=>{
    mount();
    const pending=screen.getByRole('button',{name:'Afficher la courbe Non postulées'});
    expect(pending).toHaveAttribute('aria-pressed','true');
    fireEvent.click(pending);
    expect(pending).toHaveAttribute('aria-pressed','false');
    expect(document.querySelectorAll('.db-campaign-chart svg path[stroke-width="3.5"]')).toHaveLength(2);
    fireEvent.click(pending);
    expect(document.querySelectorAll('.db-campaign-chart svg path[stroke-width="3.5"]')).toHaveLength(3);
  });
  it('filters all KPIs through the single header dropdown for Plan A and Plan B',()=>{
    mount();
    const plan = screen.getByRole('combobox',{name:'Choisir un plan'});
    expect(plan).toHaveValue('all');
    const countAll = Number(screen.getByText('Opportunités').nextElementSibling?.textContent?.replace(/[^0-9]/g,''));
    fireEvent.change(plan,{target:{value:'A'}});
    expect(plan).toHaveValue('A');
    const countA = Number(screen.getByText('Opportunités').nextElementSibling?.textContent?.replace(/[^0-9]/g,''));
    fireEvent.change(plan,{target:{value:'B'}});
    expect(plan).toHaveValue('B');
    const countB = Number(screen.getByText('Opportunités').nextElementSibling?.textContent?.replace(/[^0-9]/g,''));
    expect(countA).toBeGreaterThan(0);
    expect(countB).toBeGreaterThan(0);
    expect(countA).toBeLessThanOrEqual(countAll);
    expect(countB).toBeLessThanOrEqual(countAll);
    fireEvent.change(plan,{target:{value:'all'}});
    expect(screen.getByText('Opportunités').nextElementSibling).toHaveTextContent(String(countAll));
  });
  it('changes the Dashboard title dynamically for the city and combined filters',()=>{
    mount();
    const title=screen.getByRole('heading',{level:1});
    expect(title).toHaveTextContent('Dashboard');
    const plan=screen.getByRole('combobox',{name:'Choisir un plan'});
    fireEvent.change(plan,{target:{value:'B'}});
    expect(title).toHaveTextContent('Dashboard — Plan B');
    fireEvent.click(screen.getByRole('button',{name:'Ouvrir les filtres'}));
    fireEvent.change(screen.getByLabelText('Filtrer par ville'),{target:{value:'Nantes'}});
    expect(title).toHaveTextContent('Dashboard — Nantes · Plan B');
    fireEvent.change(screen.getByLabelText('Filtrer par entreprise'),{target:{value:'Alstom'}});
    expect(title).toHaveAttribute('title','Dashboard — Nantes · Alstom · Plan B');
    expect(title).toHaveTextContent('Dashboard — Nantes · Alstom (+1)');
    fireEvent.click(screen.getByRole('button',{name:'Fermer le panneau'}));
    fireEvent.click(screen.getByRole('button',{name:'Réinitialiser'}));
    expect(title).toHaveTextContent('Dashboard');
    expect(title).toHaveAttribute('title','Dashboard');
  });
  it('opens advanced filters as a dialog and retains cross-filtering without page scroll',()=>{
    mount();
    fireEvent.click(screen.getByRole('button',{name:'Ouvrir les filtres'}));
    const dialog=screen.getByRole('dialog',{name:'Filtres du Dashboard'});
    expect(dialog).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filtrer par plan'),{target:{value:'B'}});
    fireEvent.change(screen.getByLabelText('Filtrer par entreprise'),{target:{value:'Alstom'}});
    expect(screen.getByText('Opportunités').nextElementSibling).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button',{name:'Fermer le panneau'}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(feed[1].applicationStatus).toBe('Candidature envoyée');
  });
  it('applies an interactive pie-category filter to all KPIs and clears it',()=>{
    mount();
    const before=Number(screen.getByText('Opportunités').nextElementSibling?.textContent);
    fireEvent.click(screen.getByRole('button',{name:'Filtrer statut Clôturées'}));
    expect(screen.getByRole('button',{name:'Filtrer statut Clôturées'})).toHaveAttribute('aria-pressed','true');
    const after=Number(screen.getByText('Opportunités').nextElementSibling?.textContent);
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Clôturées');
    fireEvent.click(screen.getByRole('button',{name:'Filtrer statut Clôturées'}));
    expect(screen.getByText('Opportunités').nextElementSibling).toHaveTextContent(String(before));
  });
  it('opens Google Maps full-screen view and analytics from the rail',()=>{
    mount();
    fireEvent.click(screen.getByRole('button',{name:'Carte géographique'}));
    expect(screen.getByRole('dialog',{name:'Carte des opportunités'})).toBeInTheDocument();
    const dialog=screen.getByRole('dialog',{name:'Carte des opportunités'});
    expect(within(dialog).getByRole('heading',{name:'Carte des opportunités'})).toBeInTheDocument();
    const realMap = within(dialog).queryByTestId('google-maps-js') || within(dialog).queryByTestId('google-maps-iframe');
    expect(realMap).toBeInTheDocument();
    if (realMap?.getAttribute('data-testid') === 'google-maps-iframe') {
      expect(realMap).toHaveAttribute('src',expect.stringContaining('maps.google.com/maps?output=embed'));
    }
    expect(screen.queryByText(/Fond géographique : © IGN/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Fermer le panneau'}));
    fireEvent.click(screen.getByRole('button',{name:'Analyses avancées'}));
    expect(screen.getByRole('heading',{name:'Avancement des candidatures'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Opportunités par secteur'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Filtrer secteur Ferroviaire & transport public'}));
    expect(screen.getByText('Opportunités').nextElementSibling).toHaveTextContent('2');
  });
});
