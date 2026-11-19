import { useRef, useState } from 'react';
import { useDocxEditor } from '@docx-editor.dev/react';
import { zipSync } from 'fflate';
import { parseRecipients, mergeDocument } from './mailMerge';

export function MailMergeTools({
  notice,
}: {
  notice: (value: string) => void;
}) {
  const editor = useDocxEditor();
  const picker = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ReturnType<typeof parseRecipients>>();
  const [field, setField] = useState('');
  const [index, setIndex] = useState(0);
  const [working, setWorking] = useState(false);
  const report = (error: unknown) =>
    notice(error instanceof Error ? error.message : 'Échec du publipostage.');
  async function download(format: 'pdf' | 'docx', all: boolean) {
    if (!editor || !data || working) return;
    setWorking(true);
    try {
      const template = new Uint8Array(await editor.save());
      const files: Record<string, Uint8Array> = {};
      const rows = all ? data.records : [data.records[index]];
      const pdf =
        format === 'pdf' ? (await import('./officePdf')).documentPdf : null;
      for (const [i, row] of rows.entries()) {
        const output = mergeDocument(template, data.headers, row);
        const label =
          row[0]
            .replace(/[^\p{L}\p{N} _-]/gu, '')
            .trim()
            .slice(0, 60) || 'Document';
        const filename =
          String((all ? i : index) + 1).padStart(3, '0') +
          '-' +
          label +
          '.' +
          format;
        files[filename] = pdf ? (await pdf(output)).bytes : output;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const payload = all
        ? zipSync(files, { level: 0 })
        : Object.values(files)[0];
      const link = document.createElement('a');
      const url = URL.createObjectURL(new Blob([new Uint8Array(payload)]));
      link.href = url;
      link.download = all
        ? 'Publipostage-' + format + '.zip'
        : Object.keys(files)[0];
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      notice(rows.length + ' document(s) généré(s).');
    } catch (error) {
      report(error);
    } finally {
      setWorking(false);
    }
  }
  return (
    <fieldset className="wr-merge" disabled={working}>
      <div>
        <button onClick={() => picker.current?.click()}>
          Select Recipients · CSV
        </button>
        <input
          ref={picker}
          hidden
          type="file"
          accept=".csv,.tsv,text/csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            try {
              const next = parseRecipients(await file.text());
              setData(next);
              setField(next.headers[0]);
              setIndex(0);
            } catch (error) {
              report(error);
            }
          }}
        />
      </div>
      {data && (
        <>
          <div>
            <select
              aria-label="Merge field"
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              {data.headers.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor?.exec({ type: 'paste', text: '«' + field + '»' })
              }
            >
              Insert Merge Field
            </button>
          </div>
          <div>
            <select
              aria-label="Recipient"
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
            >
              {data.records.map((r, i) => (
                <option key={i} value={i}>
                  {i + 1} · {r[0]}
                </option>
              ))}
            </select>
            <button onClick={() => void download('pdf', false)}>
              Preview PDF
            </button>
          </div>
          <div>
            <button onClick={() => void download('docx', true)}>
              Merge to DOCX files
            </button>
            <button onClick={() => void download('pdf', true)}>
              Merge to PDF files
            </button>
          </div>
        </>
      )}
    </fieldset>
  );
}
