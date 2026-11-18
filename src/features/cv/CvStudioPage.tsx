import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * The CV Studio is the standalone Thierry KUME HTML editor, unchanged.
 * Legacy React preview panels, forms and template selectors have been removed.
 * Keep the HTML in public/cv/thierry-editor.html as the single source of truth.
 */
export function CvStudioPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get('plan');
  const planParam = requestedPlan === 'A' || requestedPlan === 'B' ? `?plan=${requestedPlan}` : '';
  const [editorHeight, setEditorHeight] = useState(1370);

  function fitEditor() {
    const document = frameRef.current?.contentDocument;
    if (!document?.body) return;
    const height = Math.ceil(Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      1300,
    ) + 20);
    setEditorHeight(current => current === height ? current : height);
  }

  function onEditorLoad() {
    const document = frameRef.current?.contentDocument;
    if (!document?.body) return;
    fitEditor();

    // The editable page grows when the user adds an experience or more text.
    const resize = new ResizeObserver(fitEditor);
    resize.observe(document.body);
    frameRef.current?.addEventListener('load', () => resize.disconnect(), { once: true });
  }

  return (
    <section className="page" aria-label="Studio CV — Éditeur Thierry KUME">
      <iframe
        ref={frameRef}
        title="Éditeur CV Thierry KUME — Plan A et Plan B"
        src={`/monstage/cv/thierry-editor.html${planParam}`}
        onLoad={onEditorLoad}
        style={{
          display: 'block',
          width: '100%',
          minHeight: 1300,
          height: editorHeight,
          border: 0,
          background: '#fff',
          margin: '0 auto',
        }}
      />
    </section>
  );
}
