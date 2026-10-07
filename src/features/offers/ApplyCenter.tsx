import { useEffect } from 'react';
import type { InternshipOffer } from '../../api/contract';

export function ApplyCenter({ offer, onClose }: { offer: InternshipOffer; onClose: () => void }) {
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

  return (
    <div className="apply-center" role="dialog" aria-modal="true" aria-label={'Apply to ' + offer.title}>
      <div className="apply-center__shell">
        <header className="apply-center__header">
          <div className="apply-center__brand">
            <strong>MonStage</strong>
            <span>Apply Center</span>
          </div>
          <div className="apply-center__role">
            <strong>{offer.title}</strong>
            <span>{offer.company}</span>
          </div>
          <div className="apply-center__actions">
            <a className="button button--secondary" href={offer.applicationUrl} target="_blank" rel="noreferrer">Open externally</a>
            <button className="apply-center__close" type="button" onClick={onClose} aria-label="Close application">×</button>
          </div>
        </header>

        <div className="apply-center__notice" role="status">
          Submission status stays evidence-based: MonStage will only mark this application as submitted after real confirmation is detected.
        </div>

        <div className="apply-center__frame-wrap">
          <iframe
            className="apply-center__frame"
            src={offer.applicationUrl}
            title={'Application — ' + offer.company}
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          />
          <div className="apply-center__fallback">
            <strong>Employer page not loading?</strong>
            <span>Some ATS block embedded applications. Use “Open externally” only when the employer prevents in-app submission.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
