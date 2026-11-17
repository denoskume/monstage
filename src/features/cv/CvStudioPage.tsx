import { ThierryCvPreview } from './ThierryCvPreview';
import {
  CvLiveEditingProvider, CvLiveText, CvLiveBullets, CvLiveAddEntry, CvLiveDraftLine, CvLiveAddLine,
  updateCvLiveTarget, updateCvLiveBullets, createCvLiveEntry,
} from './cvLiveEditing';
import { cvNarrativeFields, cvNarrativeBullets } from './cvNarrative';
import { useAuth } from '../../auth/useAuth';
import { useOffers } from '../../hooks/useOffers';
import { loadApplicationDossier, prepareApplicationDossier, updateApplicationCv } from '../applications/applicationDossiers';
import { tailorCvForOffer } from '../applications/tailoredPackage';
import { EDF_EOD_DOSSIER_ID, prepareEdfEodDossier, buildEdfEodCv } from '../applications/edfEodDossier';
import { THALES_DATA_DOSSIER_ID, prepareThalesDataDossier, buildThalesDataCv, isCurrentThalesCv, refreshThalesCvContent } from '../applications/thalesDataDossier';
import { edfSavedOffer } from '../applications/edfSavedOffer';
import { thalesSavedOffer } from '../applications/thalesSavedOffer';
import { currentCvNoticeOffer } from './cvOfferNotice';
import { CvEvidencePicker } from './CvEvidencePicker';
import { certificateCatalog, selectedCertifications } from './cvEvidenceCatalog';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { loadCvDraft, resetCvDraft, saveCvDraft, type CvDraft, type CvLanguage, type CvPlan, type CvSectionKey, CV_ACADEMIC_HEADLINE, cvProjectDescription, cvExperienceDescription, cvEducationDisplay, cvSkillsForDisplay, cvExperienceLocationForDisplay, cvLanguagesForDisplay, cvKeySkillsForDisplay, cvSummaryTitle, type CvSummaryHeading } from './cvStorage';
import { buildCvPdfBytes, cvPdfFileName } from './pdfExport';
import { saveApplicationDocument } from '../workspace/documentVault';

function updateAt<T>(items: T[], index: number, next: T): T[] {
  return items.map((item, current) => current === index ? next : item);
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, current) => current !== index);
}

function uid(prefix: string): string {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function sectionLabel(section: CvSectionKey, language: CvLanguage): string {
  const labels: Record<CvSectionKey, [string, string]> = {
    education: ['Formation', 'Education'],
    projects: ['Projets sélectionnés', 'Selected Projects'],
    experience: ['Expérience', 'Experience'],
    leadership: ['Leadership', 'Leadership'],
    skills: ['Compétences techniques', 'Technical Skills'],
    certifications: ['Certifications & formations', 'Certifications & training'],
    languages: ['Langues', 'Languages'],
    interests: ['Centres d’intérêt', 'Interests'],
  };
  return language === 'FR' ? labels[section][0] : labels[section][1];
}

function renderCvBold(value: string) {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <span key={index}>{part}</span>
  );
}


function cvExternalUrl(value: string, service: 'linkedin' | 'github'): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const url = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed.replace(/^\/+/, '');
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const valid = service === 'linkedin'
      ? (host === 'linkedin.com' || host === 'www.linkedin.com')
      : (host === 'github.com' || host === 'www.github.com');
    return parsed.protocol === 'https:' && valid ? parsed.href : null;
  } catch {
    return null;
  }
}

function CvPreviewSection({ section, draft }: { section: CvSectionKey; draft: CvDraft }) {
  if (section === 'education') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.education.map(item => <div className="cv-entry cv-education-entry" key={item.id}>
        <div className="cv-entry__top">
          <strong><CvLiveText value={cvEducationDisplay(item).school} target={{scope:'education',id:item.id,field:'school'}} placeholder="Établissement" label="Établissement" /></strong>
          <span><CvLiveText value={item.period} target={{scope:'education',id:item.id,field:'period'}} placeholder="Période" /></span>
        </div>
        <div className="cv-entry__top">
          <span><CvLiveText value={item.degree} target={{scope:'education',id:item.id,field:'degree'}} placeholder="Diplôme" /></span>
          <span><CvLiveText value={cvEducationDisplay(item).location} target={{scope:'education',id:item.id,field:'location'}} placeholder="Ville" /></span>
        </div>
        <p><CvLiveText value={item.details ?? ''} target={{scope:'education',id:item.id,field:'details'}} placeholder="Description de la formation" multiline /></p>
        {(item.bullets?.length || 0) > 0 ? <CvLiveBullets scope="education" id={item.id} bullets={item.bullets ?? []} label="Formation" /> : null}
        <p><strong>{draft.language === 'FR' ? 'Cours pertinents : ' : 'Relevant courses: '}</strong><CvLiveText value={item.keyCourses ?? ''} target={{scope:'education',id:item.id,field:'keyCourses'}} placeholder="Ajouter des cours" multiline /></p>
      </div>)}
      <CvLiveAddEntry scope="education" label={draft.language === 'FR' ? 'Formation' : 'Education'} />
    </section>
  );

  if (section === 'projects') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.projects.map(item => <div className="cv-entry cv-project-entry" key={item.id}>
        <div className="cv-entry__top"><strong><CvLiveText value={item.name} target={{scope:'projects',id:item.id,field:'name'}} placeholder="Nom du projet" /></strong>
          <span><CvLiveText value={item.period} target={{scope:'projects',id:item.id,field:'period'}} placeholder="Période" /></span></div>
        <p className="cv-project-description"><CvLiveText value={cvProjectDescription(item, draft.language)} target={{scope:'projects',id:item.id,field:'description'}} placeholder="Description du projet" multiline /></p>
        {cvNarrativeFields(item, draft.language).map(field =>
          <p key={field.key} className="cv-narrative-field">
            <strong>{field.label} : </strong>
            <CvLiveText value={field.value} target={{scope:'projects',id:item.id,field:field.key}} multiline />
          </p>
        )}
        <details className="cv-live-empty-narrative">
          <summary>+ {draft.language === 'FR' ? 'Mission / acquis / résultats' : 'Mission / skills gained / results'}</summary>
          {(['mission','acquired','results'] as const).filter(key => !item[key]?.trim()).map(key =>
            <p key={key} className="cv-narrative-field">
              <strong>{key==='mission'?'Mission':key==='acquired'?(draft.language==='FR'?'Expériences acquises':'Skills gained'):(draft.language==='FR'?'Résultats':'Results')} : </strong>
              <CvLiveText value={item[key] ?? ''} target={{scope:'projects',id:item.id,field:key}} placeholder="Ajouter" multiline />
            </p>)}
        </details>
        <CvLiveBullets scope="projects" id={item.id} bullets={item.bullets} label="Projet" />
      </div>)}
      <CvLiveAddEntry scope="projects" label={draft.language === 'FR' ? 'Projet' : 'Project'} />
    </section>
  );

  if (section === 'experience') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.experience.map(item => <div className="cv-entry cv-experience-entry" key={item.id}>
        <div className="cv-entry__top">
          <strong><CvLiveText value={item.role} target={{scope:'experience',id:item.id,field:'role'}} placeholder="Poste" /> — <CvLiveText value={item.company} target={{scope:'experience',id:item.id,field:'company'}} placeholder="Entreprise" /></strong>
          <span><CvLiveText value={item.period} target={{scope:'experience',id:item.id,field:'period'}} placeholder="Période" /></span>
        </div>
        <div className="cv-entry__top"><span><CvLiveText value={item.location} target={{scope:'experience',id:item.id,field:'location'}} placeholder="Localisation" /></span></div>
        <p className="cv-experience-description"><CvLiveText value={cvExperienceDescription(item, draft.language)} target={{scope:'experience',id:item.id,field:'description'}} placeholder="Description de l'expérience" multiline /></p>
        {cvNarrativeFields(item, draft.language).map(field =>
          <p key={field.key} className="cv-narrative-field">
            <strong>{field.label} : </strong>
            <CvLiveText value={field.value} target={{scope:'experience',id:item.id,field:field.key}} multiline />
          </p>
        )}
        <details className="cv-live-empty-narrative">
          <summary>+ {draft.language === 'FR' ? 'Mission / acquis / résultats' : 'Mission / skills gained / results'}</summary>
          {(['mission','acquired','results'] as const).filter(key => !item[key]?.trim()).map(key =>
            <p key={key} className="cv-narrative-field">
              <strong>{key==='mission'?'Mission':key==='acquired'?(draft.language==='FR'?'Expériences acquises':'Skills gained'):(draft.language==='FR'?'Résultats':'Results')} : </strong>
              <CvLiveText value={item[key] ?? ''} target={{scope:'experience',id:item.id,field:key}} placeholder="Ajouter" multiline />
            </p>)}
        </details>
        <CvLiveBullets scope="experience" id={item.id} bullets={item.bullets} label="Expérience" />
      </div>)}
      <CvLiveAddEntry scope="experience" label={draft.language === 'FR' ? 'Expérience' : 'Experience'} />
    </section>
  );

  if (section === 'leadership') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.leadership.map(item => <div className="cv-entry" key={item.id}>
        <div className="cv-entry__top">
          <strong><CvLiveText value={item.role} target={{scope:'leadership',id:item.id,field:'role'}} placeholder="Fonction" /> — <CvLiveText value={item.organization} target={{scope:'leadership',id:item.id,field:'organization'}} placeholder="Organisation" /></strong>
          <span><CvLiveText value={item.period} target={{scope:'leadership',id:item.id,field:'period'}} placeholder="Période" /></span>
        </div>
        <CvLiveBullets scope="leadership" id={item.id} bullets={item.bullets} label="Responsabilité" />
      </div>)}
      <CvLiveAddEntry scope="leadership" label={draft.language === 'FR' ? 'Responsabilité' : 'Leadership'} />
    </section>
  );

  if (section === 'skills') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.skills.split('\n').map((line,index) =>
        <p key={index}><CvLiveDraftLine field="skills" index={index} value={line} multiline label="Compétence technique" /></p>
      )}
      <CvLiveAddLine field="skills" label={draft.language === 'FR' ? 'Compétence' : 'Skill'} />
    </section>
  );

  if (section === 'certifications') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {(draft.certifications ?? []).filter(cert => cert.visible !== false).map(cert =>
        <p key={cert.id}>
          <strong><CvLiveText value={cert.title} target={{scope:'certifications',id:cert.id,field:'title'}} placeholder="Certification" /></strong>
          {' — '}<CvLiveText value={cert.issuer} target={{scope:'certifications',id:cert.id,field:'issuer'}} placeholder="Organisme" />
          {' · '}<CvLiveText value={cert.date} target={{scope:'certifications',id:cert.id,field:'date'}} placeholder="Date" />
        </p>
      )}
      <CvLiveAddEntry scope="certifications" label={draft.language === 'FR' ? 'Certification' : 'Certification'} />
    </section>
  );
  if (section === 'languages' || section === 'interests') {
    const first = draft.sectionOrder.find(key => key === 'languages' || key === 'interests');
    if (section !== first) return null;
    return <section><h2>{draft.language === 'FR' ? 'Langues et centres d’intérêt' : 'Languages & Interests'}</h2>
      <p><strong>{draft.language === 'FR' ? 'Langues : ' : 'Languages: '}</strong><CvLiveText value={draft.languages} target={{scope:'draft',field:'languages'}} placeholder="Langues" multiline /></p>
      <p><strong>{draft.language === 'FR' ? 'Centres d’intérêt : ' : 'Interests: '}</strong><CvLiveText value={draft.interests} target={{scope:'draft',field:'interests'}} placeholder="Centres d’intérêt" multiline /></p>
    </section>;
  }
  return null;
}

function AtsScore({ draft }: { draft: CvDraft }) {
  const checks = useMemo(() => {
    const hasContact = Boolean(draft.email && draft.location);
    const hasAcademicHeading = Boolean((draft.academicHeadline ?? CV_ACADEMIC_HEADLINE).trim() && draft.headline.trim());
    const hasSummary = draft.summary.trim().length >= 60;
    const hasSkills = draft.skills.split(',').filter(Boolean).length >= 6;
    const hasExperienceBullets = draft.experience.every((item) => item.bullets.filter(Boolean).length >= 2);
    const hasProjectBullets = draft.projects.length <= 3 && draft.projects.every((item) => item.bullets.filter(Boolean).length >= 2 && item.bullets.filter(Boolean).length <= 4);
    const onePageFriendly = draft.projects.length <= 3 && draft.experience.length <= 3;
    return [
      ['Contact details', hasContact],
      ['Degree and target roles', hasAcademicHeading],
      ['Focused profile', hasSummary],
      ['Keyword-rich skills', hasSkills],
      ['Experience bullets', hasExperienceBullets],
      ['Project evidence', hasProjectBullets],
      ['Compact ATS layout', onePageFriendly],
    ] as const;
  }, [draft]);

  const score = Math.round((checks.filter(([, ok]) => ok).length / checks.length) * 100);

  return (
    <div className="cv-ats-card">
      <div><strong>{score}%</strong><span>ATS readiness</span></div>
      <ul>{checks.map(([label, ok]) => <li key={label} className={ok ? 'is-ok' : ''}>{ok ? '✓' : '○'} {label}</li>)}</ul>
    </div>
  );
}

/** Enforce the unique approved CV template without deleting any previous draft data. */
function thierryOnlyDraft(value: CvDraft, plan: CvPlan): CvDraft {
  const oldTrack = /data analyst|business intelligence|industrial analytics|data analysis/i.test(value.headline);
  const genericA = /^(data science|data science &|applied machine learning|computer vision & data science)/i.test(value.headline);
  return {
    ...value,
    template: 'thierry',
    pageColor: 'white',
    thierryShowProfile: false,
    headline: plan === 'B' && oldTrack ? 'Data Scientist'
      : plan === 'A' && genericA ? 'Computer Vision Engineer' : value.headline,
  };
}

export function CvStudioPage() {
  const { token } = useAuth();
  const { data: offersData } = useOffers();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const languageParam = params.get('language') === 'EN' ? 'EN' : 'FR';
  const offerParam = params.get('offer');
  const [plan, setPlan] = useState<CvPlan>(() => params.get('plan') === 'B' ? 'B' : 'A');
  const [draft, setDraft] = useState<CvDraft>(() => thierryOnlyDraft(loadCvDraft(languageParam, params.get('plan') === 'B' ? 'B' : 'A'), params.get('plan') === 'B' ? 'B' : 'A'));
  // A feed refresh must never rehydrate an already-open CV and overwrite typing.
  // The identity changes only when the user opens another CV or switches language/plan.
  const viewKey = offerParam ? 'offer:' + offerParam + ':' + languageParam : 'master:' + languageParam + ':' + plan;
  const [loadedViewKey, setLoadedViewKey] = useState('');
  const selectedOffer = offersData?.offers.find(item => item.id === offerParam);
  const noticeOffer = currentCvNoticeOffer(
    offerParam,
    offerParam === EDF_EOD_DOSSIER_ID ? edfSavedOffer
      : offerParam === THALES_DATA_DOSSIER_ID ? thalesSavedOffer : selectedOffer,
    loadedViewKey === viewKey,
  );
  const selectedOfferId = selectedOffer?.id;
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (loadedViewKey === viewKey) return;
    let next: CvDraft;
    if (!offerParam) {
      next = loadCvDraft(languageParam, plan);
    } else if (offerParam === EDF_EOD_DOSSIER_ID) {
      next = prepareEdfEodDossier(languageParam).cv;
    } else if (offerParam === THALES_DATA_DOSSIER_ID) {
      next = prepareThalesDataDossier(languageParam).cv;
    } else {
      // For a new offer, hydrate once after its metadata becomes available.
      if (!selectedOffer) return;
      next = (loadApplicationDossier(selectedOffer.id, languageParam) ??
        prepareApplicationDossier(selectedOffer, languageParam)).cv;
    }
    setDraft(thierryOnlyDraft(next, plan));
    setLoadedViewKey(viewKey);
    setSaved(true);
  }, [viewKey, loadedViewKey, selectedOfferId]);

  // Persist the latest editable CV immediately, not only an exported PDF.
  // There is no debounce to lose the last keystrokes on a quick navigation.
  useEffect(() => {
    if (loadedViewKey !== viewKey || draft.language !== languageParam) return;
    if (offerParam) updateApplicationCv(offerParam, draft.language, draft);
    else saveCvDraft(draft);
    setSaved(true);
  }, [draft, loadedViewKey, viewKey, languageParam, offerParam]);
  const [certificateToAdd, setCertificateToAdd] = useState('');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [photoError, setPhotoError] = useState('');

  function patch<K extends keyof CvDraft>(key: K, value: CvDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function uploadPortraitPhoto(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError(draft.language === 'FR' ? 'Choisis une image JPG, PNG ou WebP.' : 'Select a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError(draft.language === 'FR' ? 'La photo ne doit pas dépasser 8 Mo.' : 'Photo must be smaller than 8 MB.');
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = 448;
      canvas.height = 528;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const width = bitmap.width * scale;
      const height = bitmap.height * scale;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      bitmap.close();
      // Compact, centered portrait: exact same data URL drives preview and PDF.
      patch('photoDataUrl', canvas.toDataURL('image/jpeg', 0.84));
      setPhotoError('');
    } catch {
      setPhotoError(draft.language === 'FR' ? 'Impossible de lire cette photo.' : 'Could not read this photo.');
    }
  }

  function moveSection(section: CvSectionKey, direction: -1 | 1) {
    setDraft((current) => {
      const index = current.sectionOrder.indexOf(section);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.sectionOrder.length) return current;
      const sectionOrder = [...current.sectionOrder];
      [sectionOrder[index], sectionOrder[nextIndex]] = [sectionOrder[nextIndex], sectionOrder[index]];
      return { ...current, sectionOrder };
    });
    setSaved(false);
  }

  function save() {
    if (offerParam) updateApplicationCv(offerParam, draft.language, draft);
    else saveCvDraft(draft);
    setSaved(true);
  }

  function switchPlan(nextPlan: CvPlan) {
    if (nextPlan === plan || offerParam) return;
    saveCvDraft(draft);
    setPlan(nextPlan);
    setDraft(thierryOnlyDraft(loadCvDraft(draft.language, nextPlan), nextPlan));
    setSaved(false);
  }

  function switchLanguage(language: CvLanguage) {
    if (draft.language === language) return;
    save();
    // Keep the URL language synchronized with the open draft. Previously a
    // feed refresh could silently switch back to the language in the old URL.
    const nextParams = new URLSearchParams(params);
    nextParams.set('language', language);
    setParams(nextParams, { replace: true });
  }

  function updateThalesCv() {
    if (!window.confirm('Actualiser le contenu du CV Thales ? Le projet et les cours seront remplacés. Les expériences, coordonnées, modèle, couleur et lettre resteront inchangés.')) return;
    const next = refreshThalesCvContent(draft);
    updateApplicationCv(THALES_DATA_DOSSIER_ID, draft.language, next);
    setDraft(next);
    setSaved(true);
  }

  function generateCv() {
    // Regeneration refreshes the targeted content, not the chosen visual layout.
    const preserveLayout = (next: CvDraft): CvDraft => ({
      ...next,
      template: 'thierry',
      thierryShowProfile: false,
      pageColor: draft.pageColor ?? 'white',
      photoDataUrl: draft.photoDataUrl,
    });
    if (offerParam === THALES_DATA_DOSSIER_ID) {
      if (!window.confirm('Régénérer le CV Thales ? Les modifications de ce CV seront remplacées, pas celles de la lettre.')) return;
      const next = preserveLayout(buildThalesDataCv(draft.language));
      updateApplicationCv(THALES_DATA_DOSSIER_ID, draft.language, next);
      setDraft(next);
      setSaved(true);
      return;
    }
    if (offerParam === EDF_EOD_DOSSIER_ID) {
      if (!window.confirm('Régénérer le CV EDF ? Les modifications manuelles du CV EDF seront remplacées, pas celles de la lettre.')) return;
      const next = preserveLayout(buildEdfEodCv(draft.language));
      updateApplicationCv(EDF_EOD_DOSSIER_ID, draft.language, next);
      setDraft(next);
      setSaved(true);
      return;
    }
    const offer = offersData?.offers.find(item => item.id === offerParam);
    if (!offer || !window.confirm('Régénérer le CV pour cette offre ? Les modifications manuelles de ce CV seront remplacées, pas celles de la lettre.')) return;
    prepareApplicationDossier(offer, draft.language);
    const next = preserveLayout(tailorCvForOffer(offer, draft.language));
    updateApplicationCv(offer.id, draft.language, next);
    setDraft(next);
    setSaved(true);
  }

  function reset() {
    if (offerParam === THALES_DATA_DOSSIER_ID) {
      const next = thierryOnlyDraft(buildThalesDataCv(draft.language), plan);
      updateApplicationCv(THALES_DATA_DOSSIER_ID, draft.language, next);
      setDraft(next);
      setSaved(false);
      return;
    }
    if (offerParam === EDF_EOD_DOSSIER_ID) {
      const next = thierryOnlyDraft(buildEdfEodCv(draft.language), plan);
      updateApplicationCv(EDF_EOD_DOSSIER_ID, draft.language, next);
      setDraft(next);
      setSaved(false);
      return;
    }
    const next = thierryOnlyDraft(resetCvDraft(draft.language, plan), plan);
    setDraft(next);
    setSaved(false);
  }

  async function downloadPreparedPdf() {
    if (!pdfReady || !pdfBytes) return;

    try {
      const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      let archiveError = '';
      if (offerParam) {
        try { await saveApplicationDocument(offerParam, 'cv', new File([blob], cvPdfFileName(draft.name), { type: 'application/pdf' }), token, ''); }
        catch (error) { archiveError = error instanceof Error ? error.message : 'Erreur GitHub privé'; }
      }
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = cvPdfFileName(draft.name);
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
      setDownloadError(archiveError ? 'PDF téléchargé, mais non enregistré dans GitHub privé : ' + archiveError : '');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to download the PDF.');
    }
  }

  useEffect(() => {
    let cancelled = false;
    setPdfReady(false);
    setDownloadError('');

    void buildCvPdfBytes(draft)
      .then((bytes) => {
        if (cancelled) return;
        setPdfBytes(bytes);
        setPdfReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setDownloadError(error instanceof Error ? error.message : 'Unable to generate the PDF.');
      });

    return () => {
      cancelled = true;
    };
  }, [draft]);


  // Archive a stable CV draft automatically; downloading is no longer required.
  useEffect(() => {
    if (!offerParam || !token || !pdfReady || !pdfBytes) return;
    if (offerParam === THALES_DATA_DOSSIER_ID && loadedViewKey !== viewKey) return;
    const snapshot = JSON.stringify(draft);
    const key = 'monstage:github-autosave:cv:' + offerParam + ':' + draft.language;
    if (sessionStorage.getItem(key) === snapshot) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const filename = 'BROUILLON_' + cvPdfFileName(draft.name);
      void saveApplicationDocument(offerParam, 'cv', new File([buffer], filename, { type: 'application/pdf' }), token, '')
        .then(() => { if (!cancelled) { sessionStorage.setItem(key, snapshot); setDownloadError(''); } })
        .catch(error => { if (!cancelled) setDownloadError('Sauvegarde automatique GitHub privé impossible : ' + (error instanceof Error ? error.message : 'Erreur inconnue')); });
    }, 2500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [offerParam, token, draft, pdfReady, pdfBytes, loadedViewKey, viewKey]);

  // Never show an unrelated master CV while a requested offer is loading.
  if (loadedViewKey !== viewKey) {
    return <section className="page cv-studio-page" role="status">
      {languageParam === 'FR' ? 'Chargement du CV sélectionné…' : 'Loading the selected CV…'}
    </section>;
  }

  return (
    <section className="page cv-studio-page">
      <div className="page-header cv-studio-header">
        <h1 className="sr-only">CV Studio</h1>
        <div className="cv-studio-toolbar">
          <div className="cv-header-selectors">
            {!offerParam ? (
              <label className="cv-header-select">
                <span>CV</span>
                <select aria-label={draft.language === 'FR' ? 'Orientation du CV' : 'CV track'}
                  value={plan}
                  onChange={(event) => switchPlan(event.target.value as CvPlan)}>
                  <option value="A">A · Computer Vision</option>
                  <option value="B">B · Data Scientist</option>
                </select>
              </label>
            ) : null}
            <div className="cv-header-select" aria-label="Modèle de CV unique"><span>Modèle</span><strong>Thierry KUME</strong></div>    </label>
    </label>
          </div>
          <div className="cv-studio-action-group">
          <div className="cl-language-toggle" aria-label="CV language">
            <button type="button" className={draft.language === 'FR' ? 'is-active' : ''} onClick={() => switchLanguage('FR')}>FR</button>
            <button type="button" className={draft.language === 'EN' ? 'is-active' : ''} onClick={() => switchLanguage('EN')}>EN</button>
          </div>
          {offerParam ? <button className="button button--primary" type="button" disabled={offerParam !== EDF_EOD_DOSSIER_ID && offerParam !== THALES_DATA_DOSSIER_ID && !offersData?.offers.some(item => item.id === offerParam)} onClick={generateCv}>Générer CV</button> : null}
          <button className="button button--secondary" type="button" onClick={reset}>Réinitialiser</button>
          <button className="button button--secondary" type="button" onClick={save}>{saved ? 'Enregistré' : 'Enregistrer'}</button>
          {offerParam ? <button className="button button--secondary" type="button" onClick={() => { save(); navigate(`/workspace?offer=${encodeURIComponent(offerParam)}`); }}>Dossier</button> : null}
          {pdfReady && pdfBytes ? (
            <button className="button button--primary cv-download-button" type="button" onClick={() => void downloadPreparedPdf()} aria-label="Download CV PDF" title="Download CV PDF">⇩</button>
          ) : (
            <button className="button button--primary cv-download-button" type="button" disabled aria-label="Preparing CV PDF" title="Preparing CV PDF">…</button>
          )}
          </div>
        </div>
      </div>

      {noticeOffer ? <p role="status" className="workspace-note"><strong>CV pour {noticeOffer.company} — {noticeOffer.title}.</strong> Vérifie les missions, les résultats et les expériences acquises avant toute validation. Aucun envoi sans ton OK.</p> : null}
      {offerParam === THALES_DATA_DOSSIER_ID && !isCurrentThalesCv(draft) ? (
        <div role="status" className="workspace-note" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span><strong>Nouvelle version du CV Thales disponible.</strong> Un seul projet MonStage (4 réalisations), cours ciblés et formation en premier.</span>
          <button className="button button--primary" type="button" onClick={updateThalesCv}>Appliquer la mise à jour Thales</button>
        </div>
      ) : null}
      {downloadError ? <div className="native-application-result native-application-result--error">{downloadError}</div> : null}

      <div className="cv-studio-layout">
        <aside className="cv-editor card">
          {draft.template === 'portrait' ? (
            <section className="cv-editor-section cv-photo-editor" aria-label={draft.language === 'FR' ? 'Photo du CV' : 'CV photo'}>
              <h2>{draft.language === 'FR' ? 'Photo du CV (facultative)' : 'CV photo (optional)'}</h2>
              <label className="cv-photo-editor__file">
                {draft.language === 'FR' ? 'Importer une photo' : 'Upload a photo'}
                <input aria-label={draft.language === 'FR' ? 'Ajouter une photo au CV' : 'Add a photo to the CV'}
                  type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => { void uploadPortraitPhoto(event.target.files?.[0]); event.target.value = ''; }} />
              </label>
              {draft.photoDataUrl ? (
                <button className="button button--secondary" type="button"
                  onClick={() => { patch('photoDataUrl', undefined); setPhotoError(''); }}>
                  {draft.language === 'FR' ? 'Supprimer la photo' : 'Remove photo'}
                </button>
              ) : null}
              <p className="cv-editor-hint">{draft.language === 'FR'
                ? 'Recadrage automatique au centre. La photo apparaît dans l’aperçu et le PDF uniquement pour ce modèle.'
                : 'Automatically center-cropped. The photo appears in this template preview and PDF only.'}</p>
              {photoError ? <p role="alert" className="cv-photo-editor__error">{photoError}</p> : null}
            </section>
          ) : null}
          <AtsScore draft={draft} />
          <section className="cv-editor-section" aria-label={draft.language === 'FR' ? 'Gérer les certifications de ce CV' : 'Manage certifications in this CV'}>
            <div className="cv-editor-section__header">
              <h2>{draft.language === 'FR' ? 'Certifications & formations · ce CV' : 'Certifications & training · this CV'}</h2>
              <button className="button button--secondary cv-add-button" type="button"
                onClick={() => patch('certifications', [...(draft.certifications ?? []),
                  { id: uid('cert'), title: '', issuer: '', date: '', visible: true }])}>
                + {draft.language === 'FR' ? 'Ajouter manuellement' : 'Add manually'}
              </button>
            </div>
            <p className="cv-editor-hint">{draft.language === 'FR'
              ? 'Modifier, masquer ou retirer une certification ici ne change ni la bibliothèque ni les autres CV. Les changements apparaissent dans l’aperçu et le PDF.'
              : 'Editing, hiding or removing a certificate here does not change the library or other CVs. Changes appear in the preview and PDF.'}</p>
            {(draft.certifications ?? []).length === 0 ? (
              <p className="cv-editor-hint">{draft.language === 'FR' ? 'Aucune certification sélectionnée pour ce CV.' : 'No certificates selected for this CV.'}</p>
            ) : null}
            {(draft.certifications ?? []).map((cert, index) => (
              <div className="cv-editor-block" key={cert.id}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" style={{ width: 'auto' }} checked={cert.visible !== false}
                    onChange={e => patch('certifications', (draft.certifications ?? []).map((item, position) =>
                      position === index ? { ...item, visible: e.target.checked } : item))} />
                  {draft.language === 'FR' ? 'Afficher dans ce CV' : 'Show in this CV'}
                </label>
                <label>{draft.language === 'FR' ? 'Intitulé de la certification' : 'Certification name'}
                  <input value={cert.title} onChange={e => patch('certifications', (draft.certifications ?? []).map((item, position) =>
                    position === index ? { ...item, title: e.target.value } : item))} />
                </label>
                <div className="cv-editor-grid">
                  <label>{draft.language === 'FR' ? 'Organisme' : 'Issuer'}
                    <input value={cert.issuer} onChange={e => patch('certifications', (draft.certifications ?? []).map((item, position) =>
                      position === index ? { ...item, issuer: e.target.value } : item))} />
                  </label>
                  <label>{draft.language === 'FR' ? 'Date' : 'Date'}
                    <input value={cert.date} onChange={e => patch('certifications', (draft.certifications ?? []).map((item, position) =>
                      position === index ? { ...item, date: e.target.value } : item))} />
                  </label>
                </div>
                <button className="cv-remove-button" type="button"
                  onClick={() => patch('certifications', (draft.certifications ?? []).filter((_, position) => position !== index))}>
                  {draft.language === 'FR' ? 'Retirer de ce CV' : 'Remove from this CV'}
                </button>
              </div>
            ))}
            <div className="cv-editor-grid">
              <label>{draft.language === 'FR' ? 'Ajouter depuis la bibliothèque' : 'Add from library'}
                <select value={certificateToAdd} onChange={e => setCertificateToAdd(e.target.value)}>
                  <option value="">{draft.language === 'FR' ? 'Sélectionner une certification…' : 'Select a certification…'}</option>
                  {certificateCatalog.filter(entry => !(draft.certifications ?? []).some(cert => cert.id === entry.id))
                    .map(entry => <option key={entry.id} value={entry.id}>{entry.title}{entry.issuer ? ' — ' + entry.issuer : ''}</option>)}
                </select>
              </label>
              <button type="button" className="button button--secondary" disabled={!certificateToAdd ||
                (draft.certifications ?? []).some(cert => cert.id === certificateToAdd)}
                onClick={() => {
                  const entry = selectedCertifications([certificateToAdd])[0];
                  if (!entry) return;
                  patch('certifications', [...(draft.certifications ?? []), { ...entry, visible: true }]);
                  setCertificateToAdd('');
                }}>
                {draft.language === 'FR' ? 'Ajouter au CV' : 'Add to CV'}
              </button>
            </div>
          </section>

          <CvEvidencePicker key={`${draft.language}:${plan}:${offerParam ?? 'master'}`} draft={draft} offerId={offerParam} onChange={(next) => { setDraft(next); setSaved(false); }} />

          {draft.template === 'keywords' ? (
            <section className="cv-editor-section">
              <h2>{draft.language === 'FR' ? 'Compétences clés pour cette offre' : 'Key skills for this role'}</h2>
              <label>{draft.language === 'FR' ? 'Mots-clés vérifiables (séparés par ·)' : 'Verified skills (separated by ·)'}
                <textarea rows={2} value={cvKeySkillsForDisplay(draft)}
                  onChange={(event) => patch('keySkills', event.target.value)} />
              </label>
              <p className="cv-template-field-note">{draft.language === 'FR'
                ? 'Choisis uniquement des compétences réellement maîtrisées, adaptées aux mots-clés de l’offre.'
                : 'Use only skills you can demonstrate, tailored to the job description.'}</p>
            </section>
          ) : null}

          <section className="cv-editor-section">
            <div className="cv-editor-section__header">
              <h2>{draft.language === 'FR' ? 'Ordre des sections' : 'Section order'}</h2>
            </div>
            {draft.sectionOrder.map((section, index) => (
              <div className="cv-interest-row" key={section}>
                <span>{sectionLabel(section, draft.language)}</span>
                <div className="cv-inline-actions">
                  <button className="button button--secondary cv-add-button" type="button" disabled={index === 0} onClick={() => moveSection(section, -1)} aria-label={`Move ${section} up`}>↑</button>
                  <button className="button button--secondary cv-add-button" type="button" disabled={index === draft.sectionOrder.length - 1} onClick={() => moveSection(section, 1)} aria-label={`Move ${section} down`}>↓</button>
                </div>
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <h2>Header</h2>
            <label>Name<input value={draft.name} onChange={(e) => patch('name', e.target.value)} /></label>
            <label>{draft.language === 'FR' ? 'Formation (sous le nom)' : 'Degree heading (under name)'}<input value={draft.academicHeadline ?? CV_ACADEMIC_HEADLINE} onChange={(e) => patch('academicHeadline', e.target.value)} /></label>
            <label>{draft.language === 'FR' ? 'Postes visés (Plan A ou B)' : 'Target roles (Plan A or B)'}<input value={draft.headline} onChange={(e) => patch('headline', e.target.value)} /></label>
            <div className="cv-editor-grid">
              <label>Location<input value={draft.location} onChange={(e) => patch('location', e.target.value)} /></label>
              <label>Email<input value={draft.email} onChange={(e) => patch('email', e.target.value)} /></label>
              <label>Phone<input value={draft.phone} onChange={(e) => patch('phone', e.target.value)} /></label>
              <label>LinkedIn<input value={draft.linkedin} onChange={(e) => patch('linkedin', e.target.value)} /></label>
              <label>GitHub<input value={draft.github} onChange={(e) => patch('github', e.target.value)} /></label>
            </div>
          </section>

          {(draft.template === 'thierry') ? <section className="cv-editor-section" aria-label="Réglages du modèle Thierry KUME">
            <h2>Modèle Thierry KUME — éditeur direct</h2>
            <p className="cv-editor-hint">Modèle unique : colonne grise, titres bleus, Mission → Résultats → Expériences acquises. Le PDF reste constitué de texte extractible.</p>
            <label>Âge (facultatif)<input value={draft.thierryAge ?? ''} onChange={e => patch('thierryAge', e.target.value)} /></label>
            <label>Logiciels / outils (une ligne par élément)<textarea rows={3} value={draft.thierryTools ?? ''} onChange={e => patch('thierryTools', e.target.value)} /></label>
            <label>Normes / méthodes<textarea rows={2} value={draft.thierryStandards ?? ''} onChange={e => patch('thierryStandards', e.target.value)} /></label>
            <label>Atouts<textarea rows={2} value={draft.thierryAdvantages ?? ''} onChange={e => patch('thierryAdvantages', e.target.value)} /></label>
            <label>Savoir-être<textarea rows={2} value={draft.thierrySoftSkills ?? ''} onChange={e => patch('thierrySoftSkills', e.target.value)} /></label>
            
          </section> : null}
          <section className="cv-editor-section">
            <h2>{cvSummaryTitle(draft.summaryHeading, draft.language)}</h2>
            <label>{draft.language === 'FR' ? 'Titre de la section' : 'Section heading'}
              <select value={draft.summaryHeading ?? 'profile'} onChange={(e) => patch('summaryHeading', e.target.value as CvSummaryHeading)}>
                <option value="profile">{draft.language === 'FR' ? 'Profil' : 'Profile'}</option>
                <option value="objective">{draft.language === 'FR' ? 'Objectif professionnel' : 'Career Objective'}</option>
              </select>
            </label>
            <p className="cv-editor-hint">{draft.language === 'FR' ? 'Utilisez **texte** pour afficher du gras dans le CV.' : 'Use **text** to show bold in the CV.'}</p>
            <textarea rows={4} value={draft.summary} onChange={(e) => patch('summary', e.target.value)} />
          </section>

          <section className="cv-editor-section">
            <div className="cv-editor-section__header">
              <h2>{draft.language === 'FR' ? 'Formation' : 'Education'}</h2>
              <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('education', [...draft.education, { id: uid('edu'), school: '', degree: '', location: '', period: '', details: '' }])}>+ {draft.language === 'FR' ? 'Ajouter' : 'Add'}</button>
            </div>
            {draft.education.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>School<input value={item.school} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, school: e.target.value }))} /></label>
                <label>Degree<input value={item.degree} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, degree: e.target.value }))} /></label>
                <div className="cv-editor-grid">
                  <label>Location<input value={item.location} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, location: e.target.value }))} /></label>
                  <label>Period<input value={item.period} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, period: e.target.value }))} /></label>
                </div>
                <label>{draft.language === 'FR' ? 'Description (si aucune puce)' : 'Description (if no bullets)'}<textarea rows={2} value={item.details} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, details: e.target.value }))} /></label>
                <label>{draft.language === 'FR' ? 'Cours pertinents' : 'Relevant courses'}
                  <textarea rows={2} value={item.keyCourses ?? ''} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, keyCourses: e.target.value }))} />
                </label>
                {(item.bullets ?? []).map((bullet, bulletIndex) => (
                  <div className="cv-bullet-row" key={bulletIndex}>
                    <label>{draft.language === 'FR' ? 'Puce' : 'Bullet'} {bulletIndex + 1}
                      <textarea rows={2} value={bullet} onChange={(e) => {
                        const bullets = (item.bullets ?? []).map((value, current) => current === bulletIndex ? e.target.value : value);
                        patch('education', updateAt(draft.education, index, { ...item, bullets }));
                      }} />
                    </label>
                    <button className="cv-remove-button cv-remove-button--compact" type="button" onClick={() => patch('education', updateAt(draft.education, index, { ...item, bullets: removeAt(item.bullets ?? [], bulletIndex) }))}>−</button>
                  </div>
                ))}
                <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('education', updateAt(draft.education, index, { ...item, bullets: [...(item.bullets ?? []), ''] }))}>+ {draft.language === 'FR' ? 'Ajouter une puce' : 'Add bullet'}</button>
                <button className="cv-remove-button" type="button" onClick={() => patch('education', removeAt(draft.education, index))}>{draft.language === 'FR' ? 'Supprimer' : 'Remove'}</button>
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <div className="cv-editor-section__header">
              <h2>{draft.language === 'FR' ? 'Expérience' : 'Experience'}</h2>
              <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('experience', [...draft.experience, { id: uid('exp'), role: '', company: '', location: '', period: '', bullets: [''] }])}>+ {draft.language === 'FR' ? 'Ajouter' : 'Add'}</button>
            </div>
            {draft.experience.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>Role<input value={item.role} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, role: e.target.value }))} /></label>
                <label>Company<input value={item.company} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, company: e.target.value }))} /></label>
                <div className="cv-editor-grid">
                  <label>Location<input value={item.location} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, location: e.target.value }))} /></label>
                  <label>Period<input value={item.period} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, period: e.target.value }))} /></label>
                </div>
                <label>{draft.language === 'FR' ? 'Description courte de l’expérience' : 'Short experience description'}
                  <textarea rows={2} value={cvExperienceDescription(item, draft.language)} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, description: e.target.value }))} />
                </label>
                <div className="cv-editor-grid cv-narrative-editor">
                  <label>{draft.language === 'FR' ? 'Mission' : 'Mission'}<textarea rows={2} value={item.mission ?? ''} onChange={e => patch('experience', updateAt(draft.experience, index, { ...item, mission: e.target.value }))} /></label>
                  <label>{draft.language === 'FR' ? 'Expériences acquises' : 'Skills gained'}<textarea rows={2} value={item.acquired ?? ''} onChange={e => patch('experience', updateAt(draft.experience, index, { ...item, acquired: e.target.value }))} /></label>
                  <label>{draft.language === 'FR' ? 'Résultats' : 'Results'}<textarea rows={2} value={item.results ?? ''} onChange={e => patch('experience', updateAt(draft.experience, index, { ...item, results: e.target.value }))} /></label>
                </div>
                {item.bullets.map((bullet, bulletIndex) => (
                  <div className="cv-bullet-row" key={bulletIndex}>
                    <label>Bullet {bulletIndex + 1}
                      <textarea rows={2} value={bullet} onChange={(e) => {
                        const bullets = item.bullets.map((value, current) => current === bulletIndex ? e.target.value : value);
                        patch('experience', updateAt(draft.experience, index, { ...item, bullets }));
                      }} />
                    </label>
                    <button className="cv-remove-button cv-remove-button--compact" type="button" onClick={() => patch('experience', updateAt(draft.experience, index, { ...item, bullets: removeAt(item.bullets, bulletIndex) }))}>−</button>
                  </div>
                ))}
                <div className="cv-inline-actions">
                  <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('experience', updateAt(draft.experience, index, { ...item, bullets: [...item.bullets, ''] }))}>+ {draft.language === 'FR' ? 'Ajouter un bullet' : 'Add bullet'}</button>
                  <button className="cv-remove-button" type="button" onClick={() => patch('experience', removeAt(draft.experience, index))}>{draft.language === 'FR' ? 'Supprimer l’expérience' : 'Remove experience'}</button>
                </div>
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <div className="cv-editor-section__header">
              <h2>{draft.language === 'FR' ? 'Projets' : 'Projects'}</h2>
              <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('projects', [...draft.projects, { id: uid('project'), name: '', period: '', bullets: [''] }])}>+ {draft.language === 'FR' ? 'Ajouter' : 'Add'}</button>
            </div>
            {draft.projects.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>Project<input value={item.name} onChange={(e) => patch('projects', updateAt(draft.projects, index, { ...item, name: e.target.value }))} /></label>
                <label>{draft.language === 'FR' ? 'Période' : 'Period'}<input value={item.period} onChange={(e) => patch('projects', updateAt(draft.projects, index, { ...item, period: e.target.value }))} /></label>
                <label>{draft.language === 'FR' ? 'Description courte du projet' : 'Short project description'}
                  <textarea rows={2} value={cvProjectDescription(item, draft.language)} onChange={(e) => patch('projects', updateAt(draft.projects, index, { ...item, description: e.target.value }))} />
                </label>
                <div className="cv-editor-grid cv-narrative-editor">
                  <label>{draft.language === 'FR' ? 'Mission' : 'Mission'}<textarea rows={2} value={item.mission ?? ''} onChange={e => patch('projects', updateAt(draft.projects, index, { ...item, mission: e.target.value }))} /></label>
                  <label>{draft.language === 'FR' ? 'Expériences acquises' : 'Skills gained'}<textarea rows={2} value={item.acquired ?? ''} onChange={e => patch('projects', updateAt(draft.projects, index, { ...item, acquired: e.target.value }))} /></label>
                  <label>{draft.language === 'FR' ? 'Résultats' : 'Results'}<textarea rows={2} value={item.results ?? ''} onChange={e => patch('projects', updateAt(draft.projects, index, { ...item, results: e.target.value }))} /></label>
                </div>
                {item.bullets.map((bullet, bulletIndex) => (
                  <div className="cv-bullet-row" key={bulletIndex}>
                    <label>Bullet {bulletIndex + 1}
                      <textarea rows={2} value={bullet} onChange={(e) => {
                        const bullets = item.bullets.map((value, current) => current === bulletIndex ? e.target.value : value);
                        patch('projects', updateAt(draft.projects, index, { ...item, bullets }));
                      }} />
                    </label>
                    <button className="cv-remove-button cv-remove-button--compact" type="button" onClick={() => patch('projects', updateAt(draft.projects, index, { ...item, bullets: removeAt(item.bullets, bulletIndex) }))}>−</button>
                  </div>
                ))}
                <div className="cv-inline-actions">
                  <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('projects', updateAt(draft.projects, index, { ...item, bullets: [...item.bullets, ''] }))}>+ {draft.language === 'FR' ? 'Ajouter un bullet' : 'Add bullet'}</button>
                  <button className="cv-remove-button" type="button" onClick={() => patch('projects', removeAt(draft.projects, index))}>{draft.language === 'FR' ? 'Supprimer le projet' : 'Remove project'}</button>
                </div>
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <div className="cv-editor-section__header">
              <h2>{draft.language === 'FR' ? 'Leadership' : 'Leadership'}</h2>
              <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('leadership', [...draft.leadership, { id: uid('lead'), role: '', organization: '', period: '', bullets: [''] }])}>+ {draft.language === 'FR' ? 'Ajouter' : 'Add'}</button>
            </div>
            {draft.leadership.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>{draft.language === 'FR' ? 'Rôle' : 'Role'}<input value={item.role} onChange={(e) => patch('leadership', updateAt(draft.leadership, index, { ...item, role: e.target.value }))} /></label>
                <label>{draft.language === 'FR' ? 'Organisation' : 'Organization'}<input value={item.organization} onChange={(e) => patch('leadership', updateAt(draft.leadership, index, { ...item, organization: e.target.value }))} /></label>
                <label>{draft.language === 'FR' ? 'Période' : 'Period'}<input value={item.period} onChange={(e) => patch('leadership', updateAt(draft.leadership, index, { ...item, period: e.target.value }))} /></label>
                {item.bullets.map((bullet, bulletIndex) => (
                  <div className="cv-bullet-row" key={bulletIndex}>
                    <label>Bullet {bulletIndex + 1}
                      <textarea rows={2} value={bullet} onChange={(e) => {
                        const bullets = item.bullets.map((value, current) => current === bulletIndex ? e.target.value : value);
                        patch('leadership', updateAt(draft.leadership, index, { ...item, bullets }));
                      }} />
                    </label>
                    <button className="cv-remove-button cv-remove-button--compact" type="button" onClick={() => patch('leadership', updateAt(draft.leadership, index, { ...item, bullets: removeAt(item.bullets, bulletIndex) }))}>−</button>
                  </div>
                ))}
                <div className="cv-inline-actions">
                  <button className="button button--secondary cv-add-button" type="button" onClick={() => patch('leadership', updateAt(draft.leadership, index, { ...item, bullets: [...item.bullets, ''] }))}>+ {draft.language === 'FR' ? 'Ajouter un bullet' : 'Add bullet'}</button>
                  <button className="cv-remove-button" type="button" onClick={() => patch('leadership', removeAt(draft.leadership, index))}>{draft.language === 'FR' ? 'Supprimer' : 'Remove'}</button>
                </div>
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <h2>{draft.language === 'FR' ? 'Compétences, langues & centres d’intérêt' : 'Skills, languages & interests'}</h2>
            <div className="cv-interest-editor">
              <span className="cv-interest-editor__label">{draft.language === 'FR' ? 'Compétences techniques' : 'Technical skills'}</span>
              {(draft.skills.split('\n').length ? draft.skills.split('\n') : ['']).map((value, index, values) => (
                <div className="cv-interest-row" key={index}>
                  <input
                    aria-label={`${draft.language === 'FR' ? 'Compétence' : 'Skill'} ${index + 1}`}
                    placeholder={draft.language === 'FR' ? 'Ex. Python & Calcul scientifique : Python, NumPy, SciPy...' : 'e.g. Python & Scientific Computing: Python, NumPy, SciPy...'}
                    value={value}
                    onChange={(e) => {
                      const next = [...values];
                      next[index] = e.target.value;
                      patch('skills', next.join('\n'));
                    }}
                  />
                  <button className="cv-remove-button cv-remove-button--compact" type="button" aria-label={draft.language === 'FR' ? 'Supprimer la compétence' : 'Remove skill'} onClick={() => {
                    const next = values.filter((_, current) => current !== index);
                    patch('skills', next.join('\n'));
                  }}>−</button>
                </div>
              ))}
              <button className="button button--secondary cv-add-button" type="button" onClick={() => {
                const values = draft.skills ? draft.skills.split('\n') : [];
                patch('skills', [...values, ''].join('\n'));
              }}>+ {draft.language === 'FR' ? 'Ajouter' : 'Add'}</button>
            </div>
            <label>{draft.language === 'FR' ? 'Langues' : 'Languages'}<input value={draft.languages} onChange={(e) => patch('languages', e.target.value)} /></label>
            <div className="cv-interest-editor">
              <span className="cv-interest-editor__label">{draft.language === 'FR' ? 'Centres d’intérêt (max. 2)' : 'Interests (max. 2)'}</span>
              {draft.interests.split('|').map((value, index, values) => (
                <div className="cv-interest-row" key={index}>
                  <input value={value.trim()} onChange={(e) => {
                    const next = values.map((item) => item.trim());
                    next[index] = e.target.value;
                    patch('interests', next.filter((item, current) => item || current === index).join(' | '));
                  }} />
                  <button className="cv-remove-button cv-remove-button--compact" type="button" onClick={() => {
                    const next = values.map((item) => item.trim()).filter((_, current) => current !== index);
                    patch('interests', next.join(' | '));
                  }}>−</button>
                </div>
              ))}
              {draft.interests.split('|').filter((item) => item.trim()).length < 2 ? (
                <button className="button button--secondary cv-add-button" type="button" onClick={() => {
                  const values = draft.interests.split('|').map((item) => item.trim()).filter(Boolean);
                  patch('interests', [...values, ''].join(' | '));
                }}>+ {draft.language === 'FR' ? 'Ajouter un intérêt' : 'Add interest'}</button>
              ) : null}
            </div>
          </section>
        </aside>

        <div className="cv-preview-viewport">
        <CvLiveEditingProvider value={{
          draft,
          update: (target, value) => {
            setDraft(current => updateCvLiveTarget(current, target, value));
            setSaved(false);
          },
          updateBullets: (scope, id, values) => {
            setDraft(current => updateCvLiveBullets(current, scope, id, values));
            setSaved(false);
          },
          addEntry: scope => {
            setDraft(current => createCvLiveEntry(current, scope, uid(scope)));
            setSaved(false);
          },
        }}>
        <article className={`cv-preview cv-preview--${draft.template ?? 'classic'}`} style={{ backgroundColor: cvPageColorHex(draft.pageColor) }} id="cv-print-area">
          <ThierryCvPreview draft={draft} />
        </article>
        </CvLiveEditingProvider>
        </div>
      </div>
    </section>
  );
}
