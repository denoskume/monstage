import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { CompanyBriefs } from './CompanyBriefs';

const offer=(id:string,company:string,title:string,status='À candidater')=>({
  id, company, title, skills:[], applicationStatus:status,
  appliedAt: status==='Candidature envoyée' ? '01/11/2026' : null,
}) as unknown as InternshipOffer;

describe('one company dossier, many distinct A/B applications',()=>{
  beforeEach(()=>localStorage.clear());
  it('shows both A and B applications within the same Alstom call brief',()=>{
    render(<MemoryRouter><CompanyBriefs sectorId="ferroviaire" offers={[
      offer('a','Alstom','Stage Computer Vision - inspection','Candidature envoyée'),
      offer('b','Alstom','Stage Data Analyst - fiabilité','Candidature envoyée'),
      offer('b2','Alstom','Stage Data Analyst Power BI'),
    ]}/></MemoryRouter>);
    const alstom=screen.getByRole('heading',{name:'Alstom'}).closest('article')!;
    expect(alstom).toHaveTextContent('Plan A');
    expect(alstom).toHaveTextContent('Plan B');
    expect(alstom).toHaveTextContent('Envoyées');
    fireEvent.click(alstom.querySelector('summary')!);
    expect(alstom).toHaveTextContent('Stage Computer Vision - inspection');
    expect(alstom).toHaveTextContent('Stage Data Analyst - fiabilité');
    expect(alstom).toHaveTextContent('Stage Data Analyst Power BI');
    expect(alstom.querySelectorAll('li')).toHaveLength(3);
    const note=alstom.querySelector('textarea')!;
    fireEvent.change(note,{target:{value:'Alstom : appel RH, candidature CV du 1er novembre et Data Analyst en parallèle.'}});
    expect(JSON.parse(localStorage.getItem('monstage:company-call-notes:v1')||'{}').Alstom).toContain('appel RH');
  });
});
