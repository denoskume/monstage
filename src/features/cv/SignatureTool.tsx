import { useRef, useState } from 'react';
import { useDocxEditor } from '@docx-editor.dev/react';

export function SignatureTool({
  notice,
}: {
  notice: (message: string) => void;
}) {
  const editor = useDocxEditor();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [ink, setInk] = useState(false);
  function clear() {
    const surface = canvas.current;
    if (surface)
      surface.getContext('2d')?.clearRect(0, 0, surface.width, surface.height);
    setInk(false);
  }
  async function insert(blob: Blob, width: number, height: number) {
    const widthPoints = Math.min(150, width * 0.75);
    const result = await editor?.executeImageCommand({
      type: 'insertImage',
      data: new Uint8Array(await blob.arrayBuffer()),
      mime: blob.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
      widthPoints,
      heightPoints: (widthPoints * height) / width,
      title: 'Signature',
    });
    if (result?.ok) dialog.current?.close();
    else notice('Insertion indisponible à cet emplacement.');
  }
  return (
    <>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          clear();
          dialog.current?.showModal();
        }}
      >
        Insert Signature
      </button>
      <dialog
        ref={dialog}
        aria-label="Insérer une signature"
        className="wr-signature"
      >
        <h3>Insérer une signature</h3>
        <p>Dessine ta signature ou importe une image PNG ou JPEG.</p>
        <canvas
          aria-label="Zone de signature"
          ref={canvas}
          width={640}
          height={180}
          onPointerDown={(e) => {
            const s = e.currentTarget,
              c = s.getContext('2d');
            if (!c) return;
            const rect = s.getBoundingClientRect();
            const x = ((e.clientX - rect.left) * s.width) / rect.width,
              y = ((e.clientY - rect.top) * s.height) / rect.height;
            s.setPointerCapture(e.pointerId);
            c.beginPath();
            c.strokeStyle = '#162638';
            c.lineWidth = 3;
            c.lineCap = 'round';
            c.moveTo(x, y);
            c.lineTo(x + 0.01, y);
            c.stroke();
            setInk(true);
          }}
          onPointerMove={(e) => {
            const s = e.currentTarget,
              c = s.getContext('2d');
            if (!c || !s.hasPointerCapture(e.pointerId)) return;
            const rect = s.getBoundingClientRect();
            c.lineTo(
              ((e.clientX - rect.left) * s.width) / rect.width,
              ((e.clientY - rect.top) * s.height) / rect.height,
            );
            c.stroke();
          }}
          onPointerUp={(e) =>
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        />
        <div className="wr-row">
          <button onClick={clear}>Effacer</button>
          <button onClick={() => fileInput.current?.click()}>
            Importer une image
          </button>
          <input
            hidden
            type="file"
            ref={fileInput}
            accept="image/png,image/jpeg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              try {
                if (!['image/png', 'image/jpeg'].includes(file.type))
                  throw Error();
                const image = await createImageBitmap(file);
                const { width, height } = image;
                image.close();
                await insert(file, width, height);
              } catch {
                notice('Choisis une image PNG ou JPEG lisible.');
              }
            }}
          />
          <button
            disabled={!ink}
            onClick={() =>
              canvas.current?.toBlob((blob) => {
                if (blob) void insert(blob, 640, 180);
              }, 'image/png')
            }
          >
            Insérer
          </button>
          <button onClick={() => dialog.current?.close()}>Fermer</button>
        </div>
      </dialog>
    </>
  );
}
