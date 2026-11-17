import {
  freshCvDraft, loadCvDraft, saveCvDraft,
  type CvDraft, type CvLanguage, type CvPlan,
} from './cvStorage';

/**
 * One-time, reversible migration from the older CV gallery to the two
 * recruiter-oriented Thierry CV masters. A full snapshot of the old master
 * is saved under monstage:cv-before-thierry:v1:* before any replacement.
 */
const version = 'v1';
const doneKey=(lang:CvLanguage,plan:CvPlan)=>'monstage:thierry-studio:'+version+':'+lang+':'+plan;
const backupKey=(lang:CvLanguage,plan:CvPlan)=>'monstage:cv-before-thierry:'+version+':'+lang+':'+plan;

export function referenceThierryCv(previous:CvDraft, plan:CvPlan):CvDraft {
  const fr=previous.language==='FR';
  const base: CvDraft = {
    ...previous,
    name: previous.name || 'Denos KUME',
    plan,
    template: 'thierry',
    pageColor: 'white',
    thierryShowProfile: false,
    headline: plan==='A'?'Computer Vision Engineer':'Data Scientist',
    thierryAge: '',
    languages: fr?'Français : langue maternelle | Anglais : niveau C1':'French: native | English: C1',
    interests: fr?'Organisation d’événements':'Event organizing',
    thierrySoftSkills: fr?'Rigueur\nEsprit d’analyse\nTravail d’équipe\nAdaptabilité':'Rigor\nAnalytical thinking\nTeamwork\nAdaptability',
    sectionOrder: ['education','projects','experience','skills','certifications','languages','interests'],
  };
  if(plan==='A') {
    base.thierryTools='Python\nOpenCV\nPyTorch\nMATLAB\nNumPy, scikit-learn\nMatplotlib, Git';
    base.thierryAdvantages=fr?'Traitement d’images\nVision par ordinateur\nMachine Learning appliqué':'Image processing\nComputer vision\nApplied machine learning';
    base.thierryStandards='';
    base.projects=[
      {id:'background',name:'Background Subtraction — Segmentation de micro-cathéters',period:'Janvier–avril 2026 — Nantes',
        description:'Centrale Nantes : Projet de Master 1 réalisé en binôme',
        mission:'Développer une méthode permettant de repérer des micro-cathéters difficiles à distinguer dans des images médicales bruitées.',
        results:'Mise au point et test d’un pipeline permettant de repérer et d’isoler les micro-cathéters sur les images étudiées.',
        acquired:'Débruitage, soustraction de fond, seuillage et comparaison quantitative des méthodes de segmentation.',bullets:[]},
      {id:'visionlabs',name:'Computer Vision & Image Processing — Travaux de MSc',period:'2025–2026 — Nantes',
        description:'Centrale Nantes : Travaux pratiques et projets académiques',
        mission:'Concevoir et évaluer des pipelines de traitement d’images et de vision par ordinateur.',
        results:'Réalisation et documentation de huit laboratoires techniques, avec notebooks, méthodes et visualisations.',
        acquired:'Calibration caméra, ORB/RANSAC, filtrage, segmentation, suivi d’objets et expérimentation PyTorch.',bullets:[]},
    ];
    base.skills='Vision par ordinateur et traitement d’images : Segmentation, débruitage, soustraction de fond, seuillage et suivi d’objets\nMéthodes de vision : Calibration caméra, ORB/RANSAC, évaluation et comparaison des approches\nMachine Learning et développement : Python, OpenCV, PyTorch, scikit-learn, Jupyter et Git';
  } else {
    base.thierryTools='Python, SQL\npandas, NumPy\nscikit-learn, PyTorch\nMatplotlib, Power BI\nStreamlit, Git';
    base.thierryAdvantages=fr?'Modélisation prédictive\nAnalyse de données\nMachine Learning':'Predictive modeling\nData analysis\nMachine learning';
    base.thierryStandards='';
    base.projects=[
      {id:'clap',name:'CLAP Zero-Shot — Classification audio',period:'2025–2026 — Nantes',
        description:'Centrale Nantes : Projet académique de Machine Learning',
        mission:'Améliorer la reconnaissance automatique de différentes catégories de sons sur un jeu de 2 000 enregistrements.',
        results:'Identification d’une stratégie de formulation améliorant les bonnes classifications de 83,05 % à 91,15 %.',
        acquired:'Comparaison de dix stratégies, embeddings, similarité cosinus et évaluation de modèles.',bullets:[]},
      {id:'healthcare',name:'Healthcare Insurance — Predictive Analytics',period:'Projet personnel',
        description:'Projet Python : Modélisation prédictive',
        mission:'Prédire les coûts d’hospitalisation et identifier les cas à coûts élevés.',
        results:'Développement et évaluation de modèles permettant d’estimer les coûts et de repérer les cas à coûts élevés.',
        acquired:'Préparation de données, Random Forest, Gradient Boosting, validation croisée et analyse de performances.',bullets:[]},
      {id:'monstage',name:'MonStage — Data Analytics & Automation',period:'Depuis septembre 2026',
        description:'Projet personnel : Plateforme de suivi de candidatures',
        mission:'Centraliser les offres de stage multi-sources et faciliter le suivi des candidatures.',
        results:'Mise en place d’une plateforme regroupant les offres, le suivi des candidatures et des indicateurs interactifs.',
        acquired:'Intégration de sources, dédoublonnage, automatisation et réalisation de tableaux de bord.',bullets:[]},
    ];
    base.skills='Data Science et Machine Learning : Préparation, nettoyage, analyse exploratoire, régression et classification\nModélisation prédictive : Random Forest, Gradient Boosting, validation croisée et évaluation des modèles\nAnalyse et visualisation : Python, SQL, pandas, NumPy, scikit-learn, Matplotlib, Power BI et Streamlit';
  }
  base.experience=[
    {id:'rws',role:'Speech AI Evaluation Specialist',company:'RWS Moravia',location:'À distance',period:'Août–octobre 2026',
      mission:'Évaluer la qualité et la pertinence des réponses de systèmes d’intelligence artificielle vocale.',
      results:'Production d’évaluations structurées et traçables permettant d’identifier et de signaler les réponses non conformes.',
      acquired:'Contrôle qualité, identification des anomalies, analyse des écarts et documentation des décisions.',bullets:[]},
    {id:'unified',role:'Data Analyst Intern',company:'Unified Mentor Pvt. Ltd.',location:'Bengaluru, Inde',period:'Septembre–décembre 2024 — Stage de fin d’études de Bachelor',
      mission:'Préparer et analyser des jeux de données structurées pour en faciliter l’exploitation.',
      results:'Mise à disposition de données préparées et de visualisations facilitant l’identification des tendances.',
      acquired:'Nettoyage avec pandas et NumPy, analyse exploratoire et visualisation avec Matplotlib.',bullets:[]},
  ];
  if(plan==='B')base.sectionOrder=['education','projects','experience','skills','certifications','languages','interests'];
  base.summary=fr?'Stage de fin d’études de 6 mois à partir de février 2027.':'Six-month final-year internship from February 2027.';
  return base;
}

export function loadThierryStudioCv(language:CvLanguage,plan:CvPlan):CvDraft {
  const previous=loadCvDraft(language,plan);
  try {
    if(localStorage.getItem(doneKey(language,plan)))return {
      ...previous,template:'thierry',pageColor:'white',thierryShowProfile:false,
    };
    // Never destroy old CV content: store an exact backup before migration.
    localStorage.setItem(backupKey(language,plan),JSON.stringify(previous));
    const next=referenceThierryCv(previous,plan);
    saveCvDraft(next);
    localStorage.setItem(doneKey(language,plan),'done');
    return next;
  } catch {
    return referenceThierryCv(previous,plan);
  }
}

export function resetThierryStudioCv(language:CvLanguage,plan:CvPlan):CvDraft {
  const next=referenceThierryCv(freshCvDraft(language,plan),plan);
  saveCvDraft(next);
  try{localStorage.setItem(doneKey(language,plan),'done');}catch{}
  return next;
}
