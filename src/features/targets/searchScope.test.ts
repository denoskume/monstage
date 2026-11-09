import { describe, it, expect } from 'vitest';
import { TARGET_COMPANIES, targetCompany, getOfferPlan, isTargetOffer, restrictOffersPayload } from '../../../shared/searchScope';

describe('thirty target groups · A/B only', () => {
  it('targets exactly thirty groups in eight sectors', () => {
    expect(TARGET_COMPANIES).toHaveLength(30);
    expect(new Set(TARGET_COMPANIES.map(group => group[0])).size).toBe(30);
    for (const [company] of TARGET_COMPANIES) {
      expect(targetCompany(company)).toBe(company);
      expect(getOfferPlan({company,title:'Stage Computer Vision / traitement d’images'})).toBe('A');
      expect(getOfferPlan({company,title:'Stage Data Analyst Power BI'})).toBe('B');
    }
  });

  it('includes all fifteen new companies in both career plans', () => {
    for (const company of ['Danone','Nestlé','Lactalis','Bel Group','GE HealthCare','EssilorLuxottica','Sanofi','Siemens Healthineers','Schneider Electric','Saint-Gobain','Veolia','Air Liquide','EDF','ENGIE','L’Oréal']) {
      expect(targetCompany(company)).not.toBeNull();
      expect(getOfferPlan({company,title:'Stage Computer Vision / traitement d’images'})).toBe('A');
      expect(getOfferPlan({company,title:'Stage Data Analyst Power BI'})).toBe('B');
    }
    expect(targetCompany('GRDF')).toBe('ENGIE');
    expect(targetCompany('Siemens Mobility France')).toBe('Siemens Mobility');
    expect(targetCompany('Siemens Healthineers France')).toBe('Siemens Healthineers');
  });

  it('permits distinct A and B applications at the same employer', () => {
    const offers = [
      {id:'alstom-a',company:'Alstom',title:'Stage Computer Vision - inspection des trains'},
      {id:'alstom-b',company:'Alstom',title:'Stage Data Analyst - fiabilité ferroviaire'},
      {id:'alstom-b2',company:'Alstom',title:'Stage Data Analyst Power BI - maintenance'},
      {id:'airbus-a',company:'Airbus Atlantic',title:'Stage Image Processing'},
      {id:'airbus-b',company:'Airbus Atlantic',title:'Stage Data Analyst reporting industriel'},
    ];
    expect(offers.map(getOfferPlan)).toEqual(['A','B','B','A','B']);
    expect((restrictOffersPayload({offers}) as {offers:typeof offers}).offers).toHaveLength(5);
  });

  it('excludes companies outside the thirty, even if the title matches', () => {
    for (const company of ['Orange', 'Capgemini', 'Wabtec', 'Bosch', 'RTX', 'KPMG']) {
      expect(targetCompany(company)).toBeNull();
      expect(isTargetOffer({company,title:'Stage Computer Vision'})).toBe(false);
      expect(isTargetOffer({company,title:'Stage Data Analyst'})).toBe(false);
    }
    expect(targetCompany('Siemens')).toBeNull();
    expect(targetCompany('Siemens Healthineers')).toBe('Siemens Healthineers');
    expect(targetCompany('Siemens Mobility France')).toBe('Siemens Mobility');
    expect(targetCompany('SNCF Connect & Tech')).toBe('SNCF');
    expect(targetCompany('Air France Industries')).toBe('Air France-KLM');
  });

  it('includes Danone data-driven maintenance without accepting generic maintenance work', () => {
    expect(getOfferPlan({company:'Danone — Volvic Fruits',title:'STAGE - Ingénieur Maintenance Industrielle - Février 2027',domain:'Plan B — Data Analyst / Maintenance industrielle / KPI'})).toBe('B');
    expect(getOfferPlan({company:'Danone',title:'Stage technicien maintenance mécanique',domain:'Maintenance mécanique'})).toBeNull();
  });

  it('rejects finance and Data Scientist; only vision-centric ML remains eligible for A', () => {
    expect(isTargetOffer({company:'Michelin',title:'Stage Data Analyst Finance'})).toBe(false);
    expect(isTargetOffer({company:'Renault Group',title:'Stage Data Scientist maintenance prédictive'})).toBe(false);
    expect(isTargetOffer({company:'Alstom',title:'Stage Machine Learning Engineer maintenance prédictive'})).toBe(false);
    expect(isTargetOffer({company:'Alstom',title:'Stage Marketing'})).toBe(false);
    expect(getOfferPlan({company:'Safran',title:'Stage Machine Learning Engineer Computer Vision'})).toBe('A');
    expect(getOfferPlan({company:'RATP',title:'Stage Data Analyst exploitation Power BI'})).toBe('B');
    expect(getOfferPlan({company:'Air France-KLM',title:'Stage Data Analyst',domain:'Imagerie'})).toBe('B');
  });

  it('never deletes original records when narrowing discovery', () => {
    const offers = [
      {company:'EDF',title:'Stage Data Analyst',applicationStatus:'Candidature envoyée'},
      {company:'Alstom',title:'Stage Computer Vision'},
      {company:'Alstom',title:'Stage Data Analyst'},
    ];
    expect((restrictOffersPayload({offers}) as {offers:unknown[]}).offers).toHaveLength(3);
    expect(offers).toHaveLength(3);
  });
});
