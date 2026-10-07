import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { InternshipOffer } from '../../api/contract';
import { submitNativeApplication } from '../../api/applications';
import { useAuth } from '../../auth/useAuth';
import { detectApplicationCapability } from './applicationAdapters';

interface CandidateProfile {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  message: string;
}

interface EncodedAttachment {
  name: string;
  mimeType: string;
  dataBase64: string;
}

const PROFILE_KEY = 'monstage:candidate-profile:v1';

function loadProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { firstName: '', lastName: '', phone: '', location: '', message: '', ...JSON.parse(raw) };
  } catch {}
  return { firstName: '', lastName: '', phone: '', location: '', message: '' };
}

function saveProfile(profile: CandidateProfile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

async function encodeFiles(files: FileList | null): Promise<EncodedAttachment[]> {
  if (!files) return [];
  const selected = Array.from(files).slice(0, 2);
  return Promise.all(selected.map(async (file) => {
    if (file.size > 5 * 1024 * 1024) throw new Error(file.name + ' exceeds the 5 MB limit.');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Unable to read ' + file.name));
      reader.readAsDataURL(file);
    });
    return {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      dataBase64: dataUrl.split(',')[1] || '',
    };
  }));
}

export function ApplyCenter({ offer, onClose }: { offer: InternshipOffer; onClose: () => void }) {
  const { token, user } = useAuth();
  const capability = useMemo(() => detectApplicationCapability(offer.applicationUrl), [offer.applicationUrl]);
  const [profile, setProfile] = useState<CandidateProfile>(() => loadProfile());
  const [files, setFiles] = useState<FileList | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('apply-center-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('apply-center-open');
    };
  }, [onClose]);

  if (!offer.applicationUrl) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      saveProfile(profile);
      const attachments = await encodeFiles(files);
      const response = await submitNativeApplication(token, {
        offerId: offer.id,
        applicationUrl: offer.applicationUrl!,
        provider: capability.provider,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: user?.email || '',
        phone: profile.phone,
        location: profile.location,
        message: profile.message,
        consent,
        company: offer.company,
        title: offer.title,
        attachments,
      });

      setResult({
        tone: response.submitted ? 'success' : 'info',
        text: response.message,
      });
    } catch (error) {
      setResult({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Application submission failed.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="apply-center" role="dialog" aria-modal="true" aria-label={'Apply to ' + offer.title}>
      <div className="apply-center__shell">
        <header className="apply-center__header">
          <div className="apply-center__brand">
            <strong>MonStage</strong>
            <span>Apply Center</span>
          </div>
          <div className="apply-center__role">
            <strong>{offer.title}</strong>
            <span>{offer.company} · {capability.label}</span>
          </div>
          <button className="apply-center__close" type="button" onClick={onClose} aria-label="Close application">×</button>
        </header>

        <div className="apply-center__notice" role="status">
          MonStage only marks an application as submitted after a successful backend submission or independently verified confirmation.
        </div>

        <div className="apply-center__content">
          <aside className="apply-center__form-panel">
            <form className="native-application-form" onSubmit={submit}>
              <div className="native-application-form__heading">
                <h2>Application</h2>
                <span>{capability.reason}</span>
              </div>

              <div className="native-application-form__grid">
                <label><span>First name</span><input required value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label>
                <label><span>Last name</span><input required value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label>
                <label className="native-application-form__wide"><span>Email</span><input value={user?.email || ''} readOnly /></label>
                <label><span>Phone</span><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
                <label><span>Location</span><input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></label>
                <label className="native-application-form__wide"><span>Message to recruiter</span><textarea rows={5} value={profile.message} onChange={(e) => setProfile({ ...profile, message: e.target.value })} placeholder="Short, specific message for this application…" /></label>
                <label className="native-application-form__wide"><span>CV / cover letter</span><input type="file" accept=".pdf,.doc,.docx" multiple onChange={(e) => setFiles(e.target.files)} /><small>Up to 2 files · 5 MB each</small></label>
              </div>

              <label className="native-application-form__consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
                <span>I confirm that the information is correct and authorize MonStage to submit it for this role.</span>
              </label>

              {result ? <div className={'native-application-result native-application-result--' + result.tone}>{result.text}</div> : null}

              <button className="button button--primary button--large native-application-form__submit" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit from MonStage'}
              </button>
            </form>
          </aside>

          <section className="apply-center__browser" aria-label="Employer application browser">
            <div className="apply-center__browser-bar">
              <span>Employer application</span>
              <a href={offer.applicationUrl} target="_blank" rel="noreferrer">Emergency external fallback ↗</a>
            </div>
            <iframe
              className="apply-center__frame"
              src={offer.applicationUrl}
              title={'Application — ' + offer.company}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            />
            <div className="apply-center__fallback">
              <strong>If the employer blocks embedded applications</strong>
              <span>MonStage cannot override the employer's browser security, CAPTCHA, account login, or ATS authorization rules. The external fallback is only for those cases.</span>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
