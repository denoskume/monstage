import {
  createContext, useContext, useEffect, useRef, useState,
  type CSSProperties, type KeyboardEvent, type ReactNode,
} from 'react';
import type { CvDraft, CvEducation, CvExperience, CvProject, CvLeadership, CvCertification } from './cvStorage';
import './cvLiveEditing.css';

export type CvLiveCollection = 'education' | 'experience' | 'projects' | 'leadership' | 'certifications';
export type CvLiveTarget =
  | { scope: 'draft'; field: string }
  | { scope: CvLiveCollection; id: string; field: string };
type LiveContext = {
  draft: CvDraft;
  update: (target: CvLiveTarget, value: string) => void;
  updateBullets: (scope: Exclude<CvLiveCollection, 'certifications'>, id: string, values: string[]) => void;
  addEntry: (scope: CvLiveCollection) => void;
};
const Context = createContext<LiveContext | null>(null);

export function useCvLiveEditing(): LiveContext | null {
  return useContext(Context);
}

export function CvLiveEditingProvider({ value, children }: { value: LiveContext; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** Update only one named item, never alter the other CV data or selected template. */
export function updateCvLiveTarget(draft: CvDraft, target: CvLiveTarget, value: string): CvDraft {
  if (target.scope === 'draft') {
    return { ...draft, [target.field]: value };
  }
  const collection = draft[target.scope] as Array<CvEducation | CvExperience | CvProject | CvLeadership | CvCertification>;
  return {
    ...draft,
    [target.scope]: collection.map(item => item.id === target.id ? { ...item, [target.field]: value } : item),
  };
}

export function updateCvLiveBullets(
  draft: CvDraft, scope: Exclude<CvLiveCollection, 'certifications'>, id: string, values: string[],
): CvDraft {
  const collection = draft[scope] as Array<CvEducation | CvExperience | CvProject | CvLeadership>;
  return { ...draft, [scope]: collection.map(item => item.id === id ? { ...item, bullets: values } : item) };
}

export function createCvLiveEntry(draft: CvDraft, scope: CvLiveCollection, id: string): CvDraft {
  const entries = {
    education: { id, school: '', degree: '', location: '', period: '', details: '', bullets: [] },
    experience: { id, role: '', company: '', location: '', period: '', bullets: [''] },
    projects: { id, name: '', period: '', bullets: [''] },
    leadership: { id, role: '', organization: '', period: '', bullets: [''] },
    certifications: { id, title: '', issuer: '', date: '' },
  };
  // The editor and PDF share the same draft, so changes stay across templates.
  return { ...draft, [scope]: [...(draft[scope] ?? []), entries[scope]] };
}

export function renderCvInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*\n]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

export function updateCvSeparatedLine(value: string, separator: string, index: number, next: string): string {
  const lines = value.split(separator);
  if (index < 0 || index >= lines.length) return value;
  lines[index] = next;
  return lines.join(separator);
}

export function CvLiveText({
  value, target, onChange, placeholder, multiline = false, className = '', onEnter, onRemoveEmpty,
  label, autoEdit = false, style,
}: {
  value: string;
  target?: CvLiveTarget;
  onChange?: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  label?: string;
  onEnter?: () => void;
  onRemoveEmpty?: () => void;
  autoEdit?: boolean;
  style?: CSSProperties;
}) {
  const ctx = useCvLiveEditing();
  const editable = Boolean(ctx && (target || onChange));
  const [editing, setEditing] = useState(autoEdit);
  const [buffer, setBuffer] = useState(value);
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const originalValue = useRef(value);
  const previouslyAuto = useRef(autoEdit);
  useEffect(() => {
    if (autoEdit && !previouslyAuto.current) setEditing(true);
    previouslyAuto.current = autoEdit;
  }, [autoEdit]);
  useEffect(() => { if (!editing) setBuffer(value); }, [value, editing]);
  useEffect(() => {
    if (!editing) return;
    const field = fieldRef.current;
    field?.focus();
    if (autoEdit) field?.select();
  }, [editing, autoEdit]);
  const finish = () => { setEditing(false); };
  const change = (next: string) => {
    setBuffer(next);
    if (target) ctx?.update(target, next);
    else onChange?.(next);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      change(originalValue.current);
      setEditing(false);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      const field = fieldRef.current;
      if (field) {
        const from = field.selectionStart ?? buffer.length, to = field.selectionEnd ?? (field.selectionStart ?? buffer.length);
        const next = buffer.slice(0, from) + '**' + buffer.slice(from, to) + '**' + buffer.slice(to);
        change(next);
        requestAnimationFrame(() => field.setSelectionRange(from + 2, to + 2));
      }
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      if (onEnter) { event.preventDefault(); onEnter(); finish(); return; }
      if (!multiline) { event.preventDefault(); finish(); }
    }
    if (event.key === 'Backspace' && !buffer && onRemoveEmpty) {
      event.preventDefault();
      onRemoveEmpty();
      finish();
    }
  };
  if (editing && editable) {
    const common = {
      ref: fieldRef as never,
      value: buffer,
      'aria-label': label ?? placeholder ?? 'Modifier le texte directement dans le CV',
      className: 'cv-live-input',
      onChange: (event: { target: { value: string } }) => change(event.target.value),
      onBlur: finish,
      onKeyDown: handleKeyDown,
      style,
    };
    return <span className={'cv-live-inline cv-live-inline--active ' + className}>
      {multiline ? <textarea {...common} rows={Math.min(6, Math.max(2, buffer.split('\n').length))} />
        : <input {...common} type="text" />}
    </span>;
  }
  return <span className={'cv-live-inline ' + className}>
    {editable
      ? <button
          type="button" className={'cv-live-trigger' + (!value.trim() ? ' cv-live-placeholder' : '')}
          onClick={() => { originalValue.current = value; setBuffer(value); setEditing(true); }}
          aria-label={value.trim() || placeholder || label || 'Ajouter du texte'}
          title={label ? 'Modifier : ' + label : 'Modifier directement le texte'}
          style={style}
        >{value.trim() ? renderCvInlineMarkdown(value) : (placeholder ?? '+ Ajouter du texte')}</button>
      : <span className="cv-live-readonly">{renderCvInlineMarkdown(value || '')}</span>}
  </span>;
}

/** On-canvas bullet editor. Enter inserts a new bullet; Backspace on empty removes it. */
export function CvLiveBullets({
  scope, id, bullets, label, className = '',
}: {
  scope: Exclude<CvLiveCollection, 'certifications'>;
  id: string;
  bullets: string[];
  label?: string;
  className?: string;
}) {
  const ctx = useCvLiveEditing();
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const change = (values: string[]) => ctx?.updateBullets(scope, id, values);
  const insert = (index: number) => {
    change([...bullets.slice(0, index), '', ...bullets.slice(index)]);
    setFocusIndex(index);
  };
  const cleanBullet = (value: string) => value.replace(/^\s*(?:•\s*|[-*]\s+)/, '');
  if (!bullets.length && !ctx) return null;
  return <div className={'cv-live-bullets ' + className}>
    <ul>{bullets.map((bullet, index) => <li key={index}>
      <CvLiveText
        value={bullet}
        label={(label ?? 'Puce') + ' ' + (index + 1)}
        onChange={value => change(bullets.map((item, n) => n === index ? cleanBullet(value) : item))}
        placeholder="Nouvelle puce"
        multiline
        autoEdit={focusIndex === index}
        onEnter={() => insert(index + 1)}
        onRemoveEmpty={() => {
          change(bullets.filter((_, n) => n !== index));
          setFocusIndex(null);
        }}
      />
    </li>)}</ul>
    {ctx && <button type="button" className="cv-live-add cv-live-add--bullet"
      onClick={() => insert(bullets.length)} aria-label={'Ajouter une puce' + (label ? ' à ' + label : '')}>+ Puce</button>}
  </div>;
}

export function CvLiveAddEntry({ scope, label }: {scope: CvLiveCollection; label: string}) {
  const ctx = useCvLiveEditing();
  return ctx ? <button type="button" className="cv-live-add cv-live-add--entry"
    onClick={() => ctx.addEntry(scope)}>+ {label}</button> : null;
}

export function CvLiveDraftLine({
  field, index, separator = '\n', value, label, className, multiline,
}: {
  field: 'skills' | 'languages' | 'interests' | 'thierryTools' | 'thierryStandards' | 'thierryAdvantages' | 'thierrySoftSkills';
  index: number;
  separator?: string;
  value: string;
  label?: string;
  className?: string;
  multiline?: boolean;
}) {
  const ctx = useCvLiveEditing();
  return <CvLiveText value={value} label={label} className={className} multiline={multiline}
    onChange={ctx ? next => ctx.update({ scope: 'draft', field },
      updateCvSeparatedLine((ctx.draft[field] as string | undefined) ?? '', separator, index, next)) : undefined} />;
}

/** Add a skill/tool line directly on the CV; the same draft is used for PDF export. */
export function CvLiveAddLine({ field, label, separator = '\n' }: {
  field: 'skills' | 'thierryTools' | 'thierryAdvantages' | 'thierrySoftSkills' | 'thierryStandards';
  label: string;
  separator?: string;
}) {
  const ctx = useCvLiveEditing();
  if (!ctx) return null;
  return <button type="button" className="cv-live-add cv-live-add--entry"
    onClick={() => ctx.update({scope:'draft',field}, 
      ((ctx.draft[field] as string | undefined) ?? '') + 
      ((ctx.draft[field] as string | undefined)?.trim() ? separator : '') +
      (field === 'skills' ? '**Nouvelle catégorie :** Ajouter une compétence' : 'Nouvel élément'))}>
    + {label}
  </button>;
}
