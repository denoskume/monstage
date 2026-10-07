import { useMemo, useState } from 'react';
import { loadCvDraft, resetCvDraft, saveCvDraft, type CvDraft } from './cvStorage';
import { downloadCvPdf } from './pdfExport';

function updateAt<T>(items: T[], index: number, next: T): T[] {
  return items.map((item, current) => current === index ? next : item);
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
  const [draft, setDraft] = useState<CvDraft>(() => loadCvDraft());
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  function patch<K extends keyof CvDraft>(key: K, value: CvDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function save() {
    saveCvDraft(draft);
    setSaved(true);
  }

  function reset() {
    const next = resetCvDraft();
    setDraft(next);
    setSaved(false);
  }

  async function downloadPdf() {
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadCvPdf(draft);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to generate the PDF.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="page cv-studio-page">
      <div className="page-header cv-studio-header">
        <div>
          <h1>CV Studio</h1>
          <p>Create and tailor a clean ATS-friendly CV directly in MonStage.</p>
        </div>
        <div className="cv-studio-actions">
          <button className="button button--secondary" type="button" onClick={reset}>Reset</button>
          <button className="button button--secondary" type="button" onClick={save}>{saved ? 'Saved' : 'Save'}</button>
          <button className="button button--primary cv-download-button" type="button" onClick={() => void downloadPdf()} aria-label="Download CV PDF" title="Download CV PDF" disabled={downloading}>{downloading ? '…' : '⇩'}</button>
        </div>
      </div>

      {downloadError ? <div className="native-application-result native-application-result--error">{downloadError}</div> : null}

      <div className="cv-studio-layout">
        <aside className="cv-editor card">
          <AtsScore draft={draft} />

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
            <h2>Education</h2>
            {draft.education.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>School<input value={item.school} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, school: e.target.value }))} /></label>
                <label>Degree<input value={item.degree} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, degree: e.target.value }))} /></label>
                <div className="cv-editor-grid">
                  <label>Location<input value={item.location} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, location: e.target.value }))} /></label>
                  <label>Period<input value={item.period} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, period: e.target.value }))} /></label>
                </div>
                <label>Details<textarea rows={2} value={item.details} onChange={(e) => patch('education', updateAt(draft.education, index, { ...item, details: e.target.value }))} /></label>
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <h2>Experience</h2>
            {draft.experience.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>Role<input value={item.role} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, role: e.target.value }))} /></label>
                <label>Company<input value={item.company} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, company: e.target.value }))} /></label>
                <div className="cv-editor-grid">
                  <label>Location<input value={item.location} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, location: e.target.value }))} /></label>
                  <label>Period<input value={item.period} onChange={(e) => patch('experience', updateAt(draft.experience, index, { ...item, period: e.target.value }))} /></label>
                </div>
                {item.bullets.map((bullet, bulletIndex) => (
                  <label key={bulletIndex}>Bullet {bulletIndex + 1}
                    <textarea rows={2} value={bullet} onChange={(e) => {
                      const bullets = item.bullets.map((value, current) => current === bulletIndex ? e.target.value : value);
                      patch('experience', updateAt(draft.experience, index, { ...item, bullets }));
                    }} />
                  </label>
                ))}
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <h2>Projects</h2>
            {draft.projects.map((item, index) => (
              <div className="cv-editor-block" key={item.id}>
                <label>Project<input value={item.name} onChange={(e) => patch('projects', updateAt(draft.projects, index, { ...item, name: e.target.value }))} /></label>
                {item.bullets.map((bullet, bulletIndex) => (
                  <label key={bulletIndex}>Bullet {bulletIndex + 1}
                    <textarea rows={2} value={bullet} onChange={(e) => {
                      const bullets = item.bullets.map((value, current) => current === bulletIndex ? e.target.value : value);
                      patch('projects', updateAt(draft.projects, index, { ...item, bullets }));
                    }} />
                  </label>
                ))}
              </div>
            ))}
          </section>

          <section className="cv-editor-section">
            <h2>Skills & languages</h2>
            <label>Technical skills<textarea rows={3} value={draft.skills} onChange={(e) => patch('skills', e.target.value)} /></label>
            <label>Languages<input value={draft.languages} onChange={(e) => patch('languages', e.target.value)} /></label>
          </section>
        </aside>

        <article className="cv-preview" id="cv-print-area">
          <header className="cv-preview__header">
            <h1>{draft.name}</h1>
            <p className="cv-preview__headline">{draft.headline}</p>
            <p className="cv-preview__contact">{[draft.location, draft.email, draft.phone, draft.linkedin, draft.github].filter(Boolean).join(' | ')}</p>
          </header>

          <section><h2>Professional Summary</h2><p>{draft.summary}</p></section>

          <section><h2>Education</h2>
            {draft.education.map((item) => <div className="cv-entry" key={item.id}>
              <div className="cv-entry__top"><strong>{item.school}</strong><span>{item.period}</span></div>
              <div className="cv-entry__top"><span>{item.degree}</span><span>{item.location}</span></div>
              {item.details ? <p>{item.details}</p> : null}
            </div>)}
          </section>

          <section><h2>Experience</h2>
            {draft.experience.map((item) => <div className="cv-entry" key={item.id}>
              <div className="cv-entry__top"><strong>{item.role} — {item.company}</strong><span>{item.period}</span></div>
              <div className="cv-entry__top"><span>{item.location}</span><span /></div>
              <ul>{item.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
            </div>)}
          </section>

          <section><h2>Selected Projects</h2>
            {draft.projects.map((item) => <div className="cv-entry" key={item.id}>
              <strong>{item.name}</strong>
              <ul>{item.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
            </div>)}
          </section>

          <section><h2>Technical Skills</h2><p>{draft.skills}</p></section>
          <section><h2>Languages</h2><p>{draft.languages}</p></section>
        </article>
      </div>
    </section>
  );
}
