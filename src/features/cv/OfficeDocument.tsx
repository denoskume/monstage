import { useEffect, useRef, useState } from 'react';
import { DocxEditor, type DocxEditorRef } from '@docx-editor.dev/react';
import { fr } from '@docx-editor.dev/i18n/fr';
import '@docx-editor.dev/core/styles/editor.css';
import { writeFile } from './officeStore';

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

  async function download() {
    const bytes = await editor.current?.save();
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (name.current.replace(/\.docx$/i, '') || 'Document') + '.docx';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  async function printDocument() {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;left:-10000px;width:900px;height:1000px;border:0';
    frame.title = 'Impression du document';
    document.body.append(frame);
    try {
      const bytes = await editor.current?.save();
      if (!bytes || !frame.contentDocument || !frame.contentWindow) throw new Error();
      const { renderAsync } = await import('docx-preview');
      const page = frame.contentDocument;
      page.title = name.current;
      await renderAsync(bytes, page.body, page.head, { inWrapper: false, useBase64URL: true });
      const style = page.createElement('style');
      style.textContent = '@page{margin:0}body{margin:0}section.docx{break-after:page;box-shadow:none!important}section.docx:last-child{break-after:auto}*{print-color-adjust:exact}';
      page.head.append(style);
      await page.fonts.ready;
      frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
      frame.contentWindow.print();
    } catch {
      frame.remove();
      setNotice('Impression impossible. Tu peux télécharger le document Word.');
    }
  }
  return <div className="ms-office" role="dialog" aria-modal="true" aria-label="Éditeur de documents MonStage">
    <header className="ms-office-bar">
      <button onClick={async () => { if (!ready || await save()) close(); }}>← Studio CV</button>
      <button disabled={!ready} onClick={async () => { if (await save()) create(); }}>Nouveau document</button>
      <span role="status">{notice}</span>
      <button disabled={!ready} onClick={() => void printDocument()}>Imprimer / PDF</button>
      <button disabled={!ready} onClick={() => void download()}>Télécharger le DOCX</button>
    </header>
    <div className="ms-office-paper"><DocxEditor ref={editor} document={session.source} mode="edit" locale="fr-FR" i18n={fr}
      title={title} onTitleChange={value => { name.current = value.trim() || 'Document sans titre'; setTitle(value); changed(); }}
      onOpen={() => { void save().then(ok => { if (ok) pick(); }); }}
      onChange={changed} onSave={() => void save()}
      onReady={() => { setReady(true); setNotice(session.revision ? 'Enregistré dans ce navigateur' : 'Enregistrement…'); void save(); }}
      menu={{ reportIssue: false }} /></div>
  </div>;
}
