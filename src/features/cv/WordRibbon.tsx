import { useRef, useState, type ReactNode } from 'react';
import {
  DocxEditor,
  useDocxEditor,
  useEditorCommand,
  useParagraphStyle,
} from '@docx-editor.dev/react';
import { createT, en } from '@docx-editor.dev/i18n';

const T = DocxEditor.Toolbar;
const translate = createT(en);
const tabs = [
  'File',
  'Home',
  'Insert',
  'Design',
  'Layout',
  'References',
  'Mailings',
  'Review',
  'View',
  'Zotero',
  'Help',
  'Acrobat',
  'Table Design',
  'Table Layout',
] as const;
type Tab = (typeof tabs)[number];
type Command = Parameters<typeof useEditorCommand>[0];

function Group({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="wr-group" role="group" aria-label={name}>
      <div className="wr-tools">{children}</div>
      <small>{name}</small>
    </div>
  );
}
function Action({ cmd, children }: { cmd: Command; children: ReactNode }) {
  const action = useEditorCommand(cmd);
  return (
    <button
      type="button"
      disabled={!action.isEnabled}
      title={action.disabledReason ?? undefined}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => action.execute()}
    >
      {children}
    </button>
  );
}
function Gallery() {
  const styles = useParagraphStyle();
  return (
    <div className="wr-row wr-gallery">
      {styles.options.slice(0, 3).map((style) => (
        <button
          key={style.styleId}
          disabled={!styles.isEnabled}
          aria-pressed={styles.value === style.styleId}
          style={{
            fontFamily: style.preview.fontFamily ?? undefined,
            fontWeight: style.preview.bold ? 700 : 400,
            fontStyle: style.preview.italic ? 'italic' : undefined,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => styles.setValue(style.styleId)}
        >
          {style.name}
        </button>
      ))}
      <T.StylePicker />
    </div>
  );
}

interface RibbonProps {
  newFile(): void;
  open(): void;
  save(): void;
  pdf(): void;
  docx(): void;
  share(): void;
  find(): void;
  rulers: boolean;
  toggleRulers(): void;
  notice(message: string): void;
}

export function WordRibbon(props: RibbonProps) {
  const [tab, setTab] = useState<Tab>('Home');
  const [addIns, setAddIns] = useState(false);
  const [replace, setReplace] = useState(false);
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [reference, setReference] = useState(0);
  const bibliography = useRef<HTMLInputElement>(null);
  const editor = useDocxEditor();
  const exec = (cmd: Exclude<Command, string>) => {
    const result = editor?.exec(cmd);
    if (!result?.ok)
      props.notice('Commande indisponible pour la sélection actuelle.');
    return result?.ok;
  };
  const paste = (text: string) => exec({ type: 'paste', text });
  const button = (label: string, onClick: () => void) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      data-command={label}
    >
      {label}
    </button>
  );
  const substitution = (merge: boolean) => (
    <form
      className="wr-form"
      onSubmit={(e) => {
        e.preventDefault();
        const search = merge ? '«' + query + '»' : query;
        if (!editor?.findMatches(search).length) {
          props.notice('Aucune occurrence trouvée.');
          return;
        }
        if (exec({ type: 'replaceAllMatches', query: search, text: value }))
          props.notice('Remplacement effectué.');
      }}
    >
      <input
        required
        aria-label={merge ? 'Field name' : 'Find text'}
        placeholder={merge ? 'Field name' : 'Find text'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        aria-label="Replacement"
        placeholder="Replacement"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {merge && (
        <button
          type="button"
          disabled={!query.trim()}
          onClick={() => paste('«' + query + '»')}
        >
          Insert Merge Field
        </button>
      )}
      <button>{merge ? 'Finish & Merge' : 'Replace All'}</button>
    </form>
  );
  const content: Record<Tab, ReactNode> = {
    File: (
      <>
        <Group name="Documents">
          {button('New', props.newFile)}
          {button('Open DOCX', props.open)}
          {button('Save', props.save)}
        </Group>
        <Group name="Export">
          {button('Download PDF', props.pdf)}
          {button('Download DOCX', props.docx)}
        </Group>
      </>
    ),
    Home: (
      <>
        <Group name="Clipboard">
          <div className="wr-clipboard">
            {button('Paste', async () => {
              try {
                paste(await navigator.clipboard.readText());
              } catch {
                props.notice(
                  'Place le curseur dans le document et utilise Ctrl+V ou ⌘V.',
                );
              }
            })}
            <div className="wr-stack">
              <Action cmd={{ type: 'cut' }}>Cut</Action>
              <Action cmd={{ type: 'copy' }}>Copy</Action>
              <T.Button slotId="format.painter" />
            </div>
          </div>
        </Group>
        <Group name="Font">
          <div className="wr-row">
            <T.FontFamily />
            <T.FontSize />
            <T.ClearFormatting />
          </div>
          <div className="wr-row">
            <T.Bold />
            <T.Italic />
            <T.Underline />
            <T.Strike />
            <T.Subscript />
            <T.Superscript />
            <T.Highlight />
            <T.FontColor />
          </div>
        </Group>
        <Group name="Paragraph">
          <div className="wr-row">
            <T.BulletList />
            <T.NumberedList />
            <T.Outdent />
            <T.Indent />
            <T.Button slotId="review.paragraphMarks" />
          </div>
          <div className="wr-row">
            <T.AlignLeft />
            <T.AlignCenter />
            <T.AlignRight />
            <T.AlignJustify />
            <T.LineSpacing />
          </div>
        </Group>
        <Group name="Styles">
          <Gallery />
        </Group>
        <Group name="Editing">
          {button('Find', props.find)}
          {button('Replace', () => setReplace((v) => !v))}
          <Action cmd={{ type: 'selectAll' }}>Select All</Action>
        </Group>
        <Group name="Adobe Acrobat">{button('Create a PDF', props.pdf)}</Group>
        <Group name="Add-ins">
          {button('Add-ins', () => setAddIns((v) => !v))}
        </Group>
      </>
    ),
    Insert: (
      <>
        <Group name="Pages">
          <Action cmd="insert.pageBreak">Page Break</Action>
        </Group>
        <Group name="Tables">
          <T.TableInsert />
        </Group>
        <Group name="Illustrations">
          <T.ImageInsert />
          <T.ChartInsert />
        </Group>
        <Group name="Links">
          <T.Link />
          <Action cmd="insert.bookmark">Bookmark</Action>
        </Group>
        <Group name="Header & Footer">
          <Action cmd="insert.pageNumber">Page Number</Action>
          <Action cmd="insert.pageXofY">Page X of Y</Action>
        </Group>
        <Group name="Text">
          <Action cmd="insert.textBox">Text Box</Action>
        </Group>
      </>
    ),
    Design: (
      <>
        <Group name="Document Formatting">
          <Gallery />
        </Group>
        <Group name="Page Background">
          <Action cmd="insert.watermark">Watermark</Action>
        </Group>
      </>
    ),
    Layout: (
      <>
        <Group name="Page Setup">
          <Action cmd="file.pageSetup">Page Setup</Action>
          <Action cmd="insert.sectionBreakNextPage">Next Page</Action>
          <Action cmd="insert.sectionBreakContinuous">Continuous Break</Action>
        </Group>
        <Group name="Paragraph">
          <T.Outdent />
          <T.Indent />
          <Action cmd="paragraph.dialog">Paragraph Settings</Action>
        </Group>
        <Group name="Arrange">
          <T.ImageWrap />
        </Group>
      </>
    ),
    References: (
      <>
        <Group name="Table of Contents">
          <Action cmd="insert.toc">Table of Contents</Action>
        </Group>
        <Group name="Footnotes">
          <Action cmd="insert.footnote">Insert Footnote</Action>
          <Action cmd="insert.endnote">Insert Endnote</Action>
        </Group>
        <Group name="Citations & Bibliography">
          {button('Bibliography', () => setTab('Zotero'))}
        </Group>
      </>
    ),
    Mailings: <Group name="Write & Insert Fields">{substitution(true)}</Group>,
    Review: (
      <>
        <Group name="Comments">
          <T.AddComment />
          <T.Comments />
        </Group>
        <Group name="Tracking">
          <T.EditingMode />
          <Action cmd="review.revisionMarkup">Markup Options</Action>
        </Group>
        <Group name="Changes">
          <Action cmd="review.previousChange">Previous</Action>
          <Action cmd="review.nextChange">Next</Action>
          <Action cmd="review.acceptAllChanges">Accept All</Action>
          <Action cmd="review.rejectAllChanges">Reject All</Action>
        </Group>
        <Group name="Compare">
          <Action cmd="review.compareDocuments">Compare</Action>
        </Group>
        <Group name="Protect">
          <Action cmd="review.protectDocument">Protect Document</Action>
        </Group>
      </>
    ),
    View: (
      <>
        <Group name="Show">
          <label>
            <input
              type="checkbox"
              checked={props.rulers}
              onChange={props.toggleRulers}
            />{' '}
            Ruler
          </label>
          {button('Navigation Pane', props.find)}
        </Group>
        <Group name="Zoom">
          <T.Zoom />
        </Group>
      </>
    ),
    Zotero: (
      <Group name="Citations & Bibliography">
        <div className="wr-row">
          {button('Import Zotero CSL JSON', () =>
            bibliography.current?.click(),
          )}
          {references.length > 0 && (
            <>
              <select
                aria-label="Reference"
                value={reference}
                onChange={(e) => setReference(Number(e.target.value))}
              >
                {references.map((ref, i) => (
                  <option key={i} value={i}>
                    {ref}
                  </option>
                ))}
              </select>
              {button('Insert Citation', () => paste(references[reference]))}
              {button('Insert Bibliography', () =>
                paste(references.join('\n')),
              )}
            </>
          )}
        </div>
      </Group>
    ),
    Help: (
      <Group name="Keyboard shortcuts">
        <span>Ctrl / ⌘ + B · Bold　 Ctrl / ⌘ + I · Italic</span>
        <span>Ctrl / ⌘ + F · Find　 Ctrl / ⌘ + Z · Undo</span>
      </Group>
    ),
    Acrobat: (
      <Group name="Create Adobe PDF">{button('Create a PDF', props.pdf)}</Group>
    ),
    'Table Design': (
      <>
        <Group name="Table Style Options">
          <Action cmd={{ type: 'toggleHeaderRow' }}>Header Row</Action>
        </Group>
        <Group name="Shading">
          <T.TableCellFill />
        </Group>
        <Group name="Borders">
          <div className="wr-row">
            <T.TableBorderTarget />
            <T.TableBorderStyle />
            <T.TableBorderWidth />
            <T.TableBorderColor />
          </div>
        </Group>
      </>
    ),
    'Table Layout': (
      <>
        <Group name="Rows & Columns">
          <div className="wr-row">
            <Action cmd={{ type: 'insertRow', where: 'above' }}>
              Insert Above
            </Action>
            <Action cmd={{ type: 'insertRow', where: 'below' }}>
              Insert Below
            </Action>
            <Action cmd={{ type: 'deleteRow' }}>Delete Row</Action>
          </div>
          <div className="wr-row">
            <Action cmd={{ type: 'insertColumn', where: 'left' }}>
              Insert Left
            </Action>
            <Action cmd={{ type: 'insertColumn', where: 'right' }}>
              Insert Right
            </Action>
            <Action cmd={{ type: 'deleteColumn' }}>Delete Column</Action>
          </div>
        </Group>
        <Group name="Merge">
          <T.TableMergeCells />
          <T.TableSplitCell />
        </Group>
        <Group name="Alignment">
          {(['top', 'center', 'bottom'] as const).map((alignment) => (
            <Action
              key={alignment}
              cmd={{ type: 'setTableCellVerticalAlignment', alignment }}
            >
              {alignment}
            </Action>
          ))}
        </Group>
      </>
    ),
  };
  return (
    <div className="word-ribbon">
      <div className="wr-nav">
        <nav aria-label="Ribbon tabs">
          {tabs.map((item) => (
            <button
              key={item}
              aria-pressed={tab === item}
              onClick={() => {
                setTab(item);
                setReplace(false);
                setAddIns(false);
              }}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="wr-row">
          <T.Comments />
          <T.EditingMode />
          {button('Share', props.share)}
        </div>
      </div>
      <T
        className="wr-panel"
        preset={false}
        overflow={false}
        t={(key) => translate(key as Parameters<typeof translate>[0])}
      >
        {content[tab]}
      </T>
      {addIns && (
        <div className="wr-form">
          {button('Zotero · CSL JSON', () => {
            setTab('Zotero');
            setAddIns(false);
          })}
          {button('PDF export', props.pdf)}
        </div>
      )}
      {replace && substitution(false)}
      <input
        hidden
        type="file"
        accept=".json"
        ref={bibliography}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            const items: unknown = JSON.parse(await file.text());
            if (!Array.isArray(items)) throw Error();
            const refs = items.flatMap((item) => {
              if (typeof item?.title !== 'string') return [];
              const authors = Array.isArray(item.author)
                ? item.author
                    .map(
                      (a: {
                        family?: string;
                        given?: string;
                        literal?: string;
                      }) =>
                        a.literal ||
                        [a.family, a.given].filter(Boolean).join(', '),
                    )
                    .join(', ')
                : '';
              return [
                [
                  authors,
                  item.issued?.['date-parts']?.[0]?.[0],
                  item.title,
                  item.DOI,
                ]
                  .filter(Boolean)
                  .join('. '),
              ];
            });
            if (!refs.length) throw Error();
            setReferences(refs);
            setReference(0);
          } catch {
            props.notice(
              'Choisis un export Zotero au format CSL JSON contenant des titres.',
            );
          }
        }}
      />
    </div>
  );
}
