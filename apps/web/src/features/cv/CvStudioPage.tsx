import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { OfficeSession } from './OfficeDocument';
import { listFiles, type OfficeFile } from './officeStore';
import './office.css';

const OfficeDocument = lazy(() => import('./OfficeDocument'));
type StudioWindow = Window & { monstageOfficeCopy?: () => { plan: string; document: Blob } };
export function CvStudioPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get('plan');
  const planParam = requestedPlan === 'A' || requestedPlan === 'B' ? `?plan=${requestedPlan}` : '';
  const [editorHeight, setEditorHeight] = useState(1370);

  const [session, setSession] = useState<OfficeSession | null>(null);
  const [files, setFiles] = useState<OfficeFile[]>([]);
  const [message, setMessage] = useState('');
  const [cvReady, setCvReady] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    if (!session) listFiles().then(items => { if (active) setFiles(items); }).catch(() => {
      if (active) setMessage('Stockage local indisponible.');
    });
    return () => { active = false; };
  }, [session]);
  function open(name: string, source: OfficeSession['source']) {
    setMessage('');
    setSession({ id: crypto.randomUUID(), name, source, revision: 0 });
  }
  async function editCv() {
    const snapshot = (frameRef.current?.contentWindow as StudioWindow | null)?.monstageOfficeCopy?.();
    if (snapshot) open('CV ' + (snapshot.plan === 'A' ? 'A Vision' : 'B Data Scientist'), new Uint8Array(await snapshot.document.arrayBuffer()));
  }

  function fitEditor() {
    const document = frameRef.current?.contentDocument;
    if (!document?.body) return;
    const height = Math.ceil(Math.max(
      document.body.scrollHeight,
      1300,
    ) + 20);
    setEditorHeight(current => current === height ? current : height);
  }

  function onEditorLoad() {
    const document = frameRef.current?.contentDocument;
    if (!document?.body) return;
    setCvReady(true);
    fitEditor();

    // The editable page grows when the user adds an experience or more text.
    const resize = new ResizeObserver(fitEditor);
    resize.observe(document.body);
    frameRef.current?.addEventListener('load', () => resize.disconnect(), { once: true });
  }

  return (
    <section className="page" aria-label="Studio CV — Éditeur Thierry KUME">
      <div className="ms-office-launch">
        <button onClick={() => open('Document sans titre', 'blank')}>Nouveau document</button>
        <button disabled={!cvReady} onClick={() => void editCv()}>Éditer une copie du CV actif</button>
        <button onClick={() => picker.current?.click()}>Importer un DOCX</button>
        <input ref={picker} type="file" accept=".docx" hidden onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = '';
          if (file) open(file.name.replace(/\.docx$/i, ''), new Uint8Array(await file.arrayBuffer()));
        }} />
        {files.length > 0 && <select aria-label="Mes documents" value="" onChange={event => {
          const file = files.find(item => item.id === event.target.value);
          if (file) setSession({ ...file, source: new Uint8Array(file.bytes) });
        }}>
          <option value="">Mes documents ({files.length})</option>
          {files.map(file => <option key={file.id} value={file.id}>{file.name} · {new Date(file.revision).toLocaleString('fr-FR')}</option>)}
        </select>}
        {message && <span role="status">{message}</span>}
      </div>
      {session && <Suspense fallback={<div role="status">Chargement de l’éditeur…</div>}>
        <OfficeDocument key={session.id} session={session} create={() => open('Document sans titre', 'blank')} pick={() => picker.current?.click()} close={() => setSession(null)} />
      </Suspense>}
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
