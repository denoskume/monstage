import { useEffect, useMemo, useState } from 'react';
import { loadCvDraft, resetCvDraft, saveCvDraft, type CvDraft, type CvLanguage, type CvSectionKey } from './cvStorage';
import { useAuth } from '../../auth/useAuth';
import { apiBaseUrl } from '../../api/authClient';
import { buildCvPdfBytes, cvPdfFileName } from './pdfExport';

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
    languages: ['Langues', 'Languages'],
    interests: ['Centres d’intérêt', 'Interests'],
  };
  return language === 'FR' ? labels[section][0] : labels[section][1];
}

function CvPreviewSection({ section, draft }: { section: CvSectionKey; draft: CvDraft }) {
  if (section === 'education') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.education.map((item) => <div className="cv-entry" key={item.id}>
        <div className="cv-entry__top"><strong>{item.school}</strong><span>{item.period}</span></div>
        <div className="cv-entry__top"><span>{item.degree}</span><span>{item.location}</span></div>
        {item.details ? <p>{item.details}</p> : null}
      </div>)}
    </section>
  );

  if (section === 'projects') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.projects.map((item) => <div className="cv-entry" key={item.id}>
        <div className="cv-entry__top"><strong>{item.name}</strong><span>{item.period}</span></div>
        <ul>{item.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
      </div>)}
    </section>
  );

  if (section === 'experience') return (
    <section><h2>{sectionLabel(section, draft.language)}</h2>
      {draft.experience.map((item) => <div className="cv-entry" key={item.id}>
        <div className="cv-entry__top"><strong>{item.role} — {item.company}</strong><span>{item.period}</span></div>
        <div className="cv-entry__top"><span>{item.location}</span><span /></div>
        <ul>{item.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
      </div>)}
    </section>
  );

  if (section === 'leadership') {
    if (!draft.leadership.length) return null;
    return (
      <section><h2>{sectionLabel(section, draft.language)}</h2>
        {draft.leadership.map((item) => <div className="cv-entry" key={item.id}>
          <div className="cv-entry__top"><strong>{item.role}{item.organization ? ` — ${item.organization}` : ''}</strong><span>{item.period}</span></div>
          <ul>{item.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
        </div>)}
      </section>
    );
  }

  if (section === 'skills') {
    if (!draft.skills.trim()) return null;
    return <section><h2>{sectionLabel(section, draft.language)}</h2>{draft.skills.split('\n').filter((line) => line.trim()).map((line, index) => <p key={index}>{line}</p>)}</section>;
  }

  if (section === 'languages') {
    if (!draft.languages.trim()) return null;
    return <section><h2>{sectionLabel(section, draft.language)}</h2><p>{draft.languages}</p></section>;
  }

  if (!draft.interests.trim()) return null;
  return <section><h2>{sectionLabel(section, draft.language)}</h2><p>{draft.interests}</p></section>;
}

function AtsScore({ draft }: { draft: CvDraft }) {
  const checks = useMemo(() => {
    const hasContact = Boolean(draft.email && draft.location);
    const hasSummary = draft.summary.trim().length >= 60;
    const hasSkills = draft.skills.split(',').filter(Boolean).length >= 6;
    const hasExperienceBullets = draft.experience.every((item) => item.bullets.filter(Boolean).length >= 2);
    const hasProjectBullets = draft.projects.every((item) => item.bullets.filter(Boolean).length >= 2);
    const onePageFriendly = draft.projects.length <= 3 && draft.experience.length <= 3;
    return [
      ['Contact details', hasContact],
      ['Focused summary', hasSummary],
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

export function CvStudioPage() {
  const { token } = useAuth();
  const [draft, setDraft] = useState<CvDraft>(() => loadCvDraft('EN'));
  const [saved, setSaved] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  function patch<K extends keyof CvDraft>(key: K, value: CvDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
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
    saveCvDraft(draft);
    setSaved(true);
  }

  function switchLanguage(language: CvLanguage) {
    saveCvDraft(draft);
    setDraft(loadCvDraft(language));
    setSaved(false);
  }

  function reset() {
    const next = resetCvDraft(draft.language);
    setDraft(next);
    setSaved(false);
  }

  async function downloadPreparedPdf() {
    if (!pdfReady || !pdfBytes) return;

    try {
      const isDesktop = window.matchMedia('(pointer: fine)').matches;

      if (isDesktop) {
        if (!token) throw new Error('Authentication required for PDF download.');

        const iframeName = 'monstage-cv-download-' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = apiBaseUrl() + '/api/cv/pdf';
        form.target = iframeName;
        form.style.display = 'none';

        const credentialInput = document.createElement('input');
        credentialInput.type = 'hidden';
        credentialInput.name = 'credential';
        credentialInput.value = token;

        const draftInput = document.createElement('input');
        draftInput.type = 'hidden';
        draftInput.name = 'draft';
        draftInput.value = JSON.stringify(draft);

        form.appendChild(credentialInput);
        form.appendChild(draftInput);
        document.body.appendChild(form);
        form.submit();
        form.remove();

        window.setTimeout(() => iframe.remove(), 15_000);
        setDownloadError('');
        return;
      }

      const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = cvPdfFileName(draft.name);
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      setDownloadError('');
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

  return (
    <section className="page cv-studio-page">
      <div className="page-header cv-studio-header">
        <div>
          <h1>CV Studio</h1>
          <p>{draft.language === 'FR' ? 'Créez et adaptez un CV ATS clair avec un contenu rédigé naturellement en français.' : 'Create and tailor a clean ATS-friendly CV written naturally for English-speaking recruiters.'}</p>
        </div>
        <div className="cv-studio-actions">
          <div className="cl-language-toggle" aria-label="CV language">
            <button type="button" className={draft.language === 'FR' ? 'is-active' : ''} onClick={() => switchLanguage('FR')}>FR</button>
            <button type="button" className={draft.language === 'EN' ? 'is-active' : ''} onClick={() => switchLanguage('EN')}>EN</button>
          </div>
          <button className="button button--secondary" type="button" onClick={reset}>Reset</button>
          <button className="button button--secondary" type="button" onClick={save}>{saved ? 'Saved' : 'Save'}</button>
          {pdfReady && pdfBytes ? (
            <button className="button button--primary cv-download-button" type="button" onClick={() => void downloadPreparedPdf()} aria-label="Download CV PDF" title="Download CV PDF">⇩</button>
          ) : (
            <button className="button button--primary cv-download-button" type="button" disabled aria-label="Preparing CV PDF" title="Preparing CV PDF">…</button>
          )}
        </div>
      </div>

      {downloadError ? <div className="native-application-result native-application-result--error">{downloadError}</div> : null}

      <div className="cv-studio-layout">
        <aside className="cv-editor card">
          <AtsScore draft={draft} />

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
            <label>Headline<input value={draft.headline} onChange={(e) => patch('headline', e.target.value)} /></label>
            <div className="cv-editor-grid">
              <label>Location<input value={draft.location} onChange={(e) => patch('location', e.target.value)} /></label>
              <label>Email<input value={draft.email} onChange={(e) => patch('email', e.target.value)} /></label>
              <label>Phone<input value={draft.phone} onChange={(e) => patch('phone', e.target.value)} /></label>
              <label>LinkedIn<input value={draft.linkedin} onChange={(e) => patch('linkedin', e.target.value)} /></label>
              <label>GitHub<input value={draft.github} onChange={(e) => patch('github', e.target.value)} /></label>
            </div>
          </section>

          <section className="cv-editor-section">
            <h2>Professional summary</h2>
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
                <label>Details<textarea rows={2} value={item.details} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, details: e.target.value }))} /></label>
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

        <article className="cv-preview" id="cv-print-area">
          <header className="cv-preview__header">
            <h1>{draft.name}</h1>
            <p className="cv-preview__headline">{draft.headline}</p>
            <p className="cv-preview__contact">{[draft.location, draft.email, draft.phone, draft.linkedin, draft.github].filter(Boolean).join(' | ')}</p>
          </header>

          <section><h2>{draft.language === 'FR' ? 'Profil' : 'Professional Summary'}</h2><p>{draft.summary}</p></section>

          {draft.sectionOrder.map((section) => <CvPreviewSection key={section} section={section} draft={draft} />)}
        </article>
      </div>
    </section>
  );
}
