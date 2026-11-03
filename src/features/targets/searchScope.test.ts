import { describe, it, expect } from 'vitest';
import { TARGET_COMPANIES, BACKUP_COMPANIES, targetCompany, originalTargetCompany, getOfferPlan, isTargetOffer, restrictOffersPayload } from '../../../shared/searchScope';

describe('three-track discovery scope', () => {
  it('keeps the twenty original groups plus exactly ten additional B-only giants', () => {
    expect(TARGET_COMPANIES).toHaveLength(20);
    expect(BACKUP_COMPANIES).toHaveLength(10);
    expect(new Set([...TARGET_COMPANIES, ...BACKUP_COMPANIES].map(group => group[0])).size).toBe(30);
    for (const [company] of TARGET_COMPANIES) {
      expect(getOfferPlan({company,title:'Stage Computer Vision'})).toBe('A');
    }
    for (const [company] of BACKUP_COMPANIES) {
      expect(getOfferPlan({company,title:'Stage Computer Vision'})).toBeNull();
      expect(getOfferPlan({company,title:'Stage Data Analyst Power BI'})).toBe('B2');
    }
    for (const company of ['Safran.AI', 'Airbus Atlantic', 'Olea Medical', 'Faurecia', 'Ampere SAS']) expect(originalTargetCompany(company)).not.toBeNull();
  });
  it('classifies predictive industrial data as B1, general analytics and BI as B2', () => {
    expect(getOfferPlan({company:'Alstom', title:'Stage Data Analyst Fiabilité RAMS'})).toBe('B1');
    expect(getOfferPlan({company:'EDF Enedis', title:'Stage Data Analyst - Anticipation des pannes sur le réseau électrique'})).toBe('B1');
    expect(getOfferPlan({company:'Veolia', title:'Stage Data Analyst Power BI'})).toBe('B2');
    expect(getOfferPlan({company:'Orange', title:'Stage Business Intelligence & Reporting'})).toBe('B2');
    expect(getOfferPlan({company:'Safran',title:'Stage IA',domain:'Computer Vision / traitement d’images'})).toBe('A');
    expect(getOfferPlan({company:'GE HealthCare',title:'Stage imagerie médicale'})).toBe('A');
    expect(getOfferPlan({company:'Schneider Electric',title:'Stage maintenance prédictive'})).toBe('B1');
  });
  it('rejects Data Scientist roles in every plan and every group', () => {
    const titles = ['Stage Data Scientist', 'Stage Data Science', 'Data Scientist Maintenance Prédictive',
      'Stage Data Science - anticipation des pannes'];
    for (const company of ['Airbus', 'Alstom', 'EDF', 'Veolia', 'Capgemini']) {
      for (const title of titles) expect(getOfferPlan({company, title, domain:'Computer Vision / Predictive Maintenance'})).toBeNull();
    }
    expect(getOfferPlan({company:'Safran',title:'Stage Machine Learning Engineer - Computer Vision'})).toBe('A');
    expect(getOfferPlan({company:'Alstom',title:'Stage Machine Learning Engineer - Maintenance prédictive'})).toBeNull();
    expect(getOfferPlan({company:'Alstom',title:'Stage Data Analyst - maintenance prédictive'})).toBe('B1');
    expect(getOfferPlan({company:'Orange',title:'Stage Data Analyst SQL & Power BI'})).toBe('B2');
  });
  it('excludes arbitrary jobs even in target companies', () => {
    for(const title of ['Stage RAG / LLM', 'Stage Python', 'Stage NLP', 'Stage Marketing Scanner', 'Stage Développement Commercial']) expect(isTargetOffer({company:'Safran',title})).toBe(false);
    expect(isTargetOffer({company:'Google',title:'Stage Computer Vision'})).toBe(false);
    expect(isTargetOffer({company:'Google',title:'Stage Data Analyst'})).toBe(false);
    expect(isTargetOffer({company:'EDF',title:'Stage Computer Vision'})).toBe(false);
  });
  it('excludes financial positions even inside industrial groups', () => {
    expect(getOfferPlan({company:'Veolia',title:'Stage Data Analyst Finance'})).toBeNull();
    expect(getOfferPlan({company:'EDF',title:'Stage Analyste de données comptabilité'})).toBeNull();
    expect(getOfferPlan({company:'Michelin',title:'Stage Data Analyst Power BI'})).toBe('B2');
    expect(getOfferPlan({company:'Capgemini',title:'Stage Consultant en stratégie financière'})).toBeNull();
  });
  it('does not confuse Siemens divisions or match companies by partial words', () => {
    expect(targetCompany('Siemens')).toBeNull();
    expect(targetCompany('Boschman')).toBeNull();
    expect(targetCompany('Siemens Mobility')).toBe('Siemens Mobility');
    expect(targetCompany('Siemens Healthineers')).toBe('Siemens Healthineers');
    expect(targetCompany('EDF Enedis')).toBe('EDF / Enedis');
    for (const company of ['AXA', 'BNP Paribas', 'Société Générale']) expect(targetCompany(company)).toBeNull();
  });
  it('restricts visibility without destroying archived out-of-scope records', () => {
    const offers = [
      {company:'Google',title:'Data Analyst'},
      {company:'Stimio',title:'Stage Python',applicationStatus:'Candidature envoyée'},
      {company:'Alstom',title:'Stage Computer Vision'},
      {company:'EDF Enedis',title:'Stage maintenance prédictive'},
      {company:'Veolia',title:'Stage Business Intelligence'},
    ];
    expect((restrictOffersPayload({offers}) as {offers:unknown[]}).offers).toEqual(offers.slice(2));
    expect(offers).toHaveLength(5);
  });
});
