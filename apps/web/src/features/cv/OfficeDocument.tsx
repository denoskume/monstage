import { useEffect, useRef, useState } from 'react';
import { DocxEditor, type DocxEditorRef } from '@docx-editor.dev/react';
import { WordRibbon } from './WordRibbon';
import '@docx-editor.dev/core/styles/editor.css';
import { writeFile } from './officeStore';

const pdfExport = async (source: Uint8Array) => (await import('./officePdf')).documentPdf(source);
const menu = { reportIssue: false as const, exporters: { pdf: pdfExport } };

export interface OfficeSession {
  id: string;
  name: string;
  source: Uint8Array | 'blank';
  revision: number;
}

export default function OfficeDocument({ session, close, create, pick }: { session: OfficeSession; close: () => void; create: () => void; pick: () => void }) {
  const editor = useRef<DocxEditorRef>(null);
  const name = useRef(session.name);
  const revision = useRef(session.revision);
  const queue = useRef(Promise.resolve(true));
  const generation = useRef(0);
  const saved = useRef(session.revision ? 0 : -1);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [title, setTitle] = useState(session.name);
  const [notice, setNotice] = useState('Ouverture…');
  const [ready, setReady] = useState(false);

  const [exporting, setExporting] = useState(false);

  const [rulers, setRulers] = useState(true);
  const [navigation, setNavigation] = useState(false);

  const [navigationTab, setNavigationTab] = useState<'headings'|'find'|'goto'>('find');

  function save() {
    clearTimeout(timer.current);
    queue.current = queue.current.then(async () => {
      const version = generation.current;
      if (saved.current === version) return true;
      try {
        const bytes = await editor.current?.save();
        if (!bytes) throw new Error('Le document est encore en cours d’ouverture.');
        const next = Math.max(Date.now(), revision.current + 1);
        await writeFile({ id: session.id, name: name.current, bytes, revision: next }, revision.current);
        revision.current = next;
        saved.current = version;
        if (version === generation.current) setNotice('Enregistré dans ce navigateur');
        return true;
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Sauvegarde impossible. Télécharge une copie.');
        return false;
      }
    });
    return queue.current;
  }
  function changed() {
    generation.current++;
    setNotice('Modifications en cours…');
    clearTimeout(timer.current);
    timer.current = setTimeout(save, 450);
  }
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (generation.current !== saved.current) { event.preventDefault(); event.returnValue = ''; }
    };
    const flush = () => { if (document.hidden) void save(); };
    window.addEventListener('beforeunload', guard);
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('beforeunload', guard);
      document.removeEventListener('visibilitychange', flush);
    };
  }, []);

  async function download(format: 'pdf' | 'docx') {
    setExporting(true);
    try {
      const docx = await editor.current?.save();
      if (!docx) throw new Error('Document indisponible');
      const blob = format === 'pdf'
        ? new Blob([new Uint8Array((await pdfExport(new Uint8Array(docx))).bytes)], { type: 'application/pdf' })
        : new Blob([docx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = (name.current.replace(/\.(docx|pdf)$/i, '') || 'Document') + '.' + format;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      setNotice('Le téléchargement a échoué. Ton document reste ouvert.');
    } finally { setExporting(false); }
  }
  return <div className="ms-office" role="dialog" aria-modal="true" aria-label="Éditeur de documents MonStage">
    <header className="ms-office-bar">
      <button onClick={async () => { if (!ready || await save()) close(); }}>← Studio CV</button>
      <button disabled={!ready} onClick={async () => { if (await save()) create(); }}>Nouveau document</button>
      <span role="status">{notice}</span>
      <button disabled={!ready || exporting} onClick={() => void download('pdf')}>Télécharger le PDF</button>
      <button disabled={!ready || exporting} onClick={() => void download('docx')}>Télécharger le DOCX</button>
    </header>
    <div className="ms-office-paper"><DocxEditor ref={editor} document={session.source} mode="edit" locale="fr-FR" rulers={rulers} navigation={{open:navigation,onOpenChange:setNavigation,tab:navigationTab,onTabChange:setNavigationTab}}
      renderTitleBarRight={() => <WordRibbon
        newFile={() => { void save().then(ok => { if (ok) create(); }); }}
        open={() => { void save().then(ok => { if (ok) pick(); }); }}
        save={() => void save()} pdf={() => void download('pdf')} docx={() => void download('docx')}
        share={async () => {
          try {
            const bytes = await editor.current?.save();
            if (!bytes) return;
            const file = new File([bytes], name.current + '.docx', {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
            if (navigator.canShare?.({files:[file]})) await navigator.share({files:[file],title:name.current});
            else { await download('docx'); setNotice('Copie DOCX téléchargée pour le partage.'); }
          } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice('Partage indisponible.'); }
        }}
        find={() => {setNavigationTab('find'); setNavigation(true);}} rulers={rulers} toggleRulers={() => setRulers(v => !v)} notice={setNotice}/>}
      title={title} onTitleChange={value => { name.current = value.trim() || 'Document sans titre'; setTitle(value); changed(); }}
      onOpen={() => { void save().then(ok => { if (ok) pick(); }); }}
      onChange={changed} onSave={() => void save()}
      onReady={() => { setReady(true); setNotice(session.revision ? 'Enregistré dans ce navigateur' : 'Enregistrement…'); void save(); }}
      menu={menu} /></div>
  </div>;
}
