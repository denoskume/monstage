import type { CvDraft } from './cvStorage';
import {
  cleanThierryText, thierryAdvantages, thierryEducation, thierryEntries,
  thierryMethods, thierrySoftSkills, thierryTools, thierrySkillGroups, type ThierryEntry,
} from './thierryTemplate';
import './thierryCv.css';

function ThierryEntryView({ entry }: { entry: ThierryEntry }) {
  return <div className="thierry-entry">
    <div className="thierry-entry-title"><span className="thierry-diamond" aria-hidden="true">❖</span><strong>{entry.title}</strong></div>
    {entry.period ? <p className="thierry-entry-period">{entry.period}</p> : null}
    {entry.organization ? <p className="thierry-entry-org"><strong>{entry.organization}</strong></p> : null}
    {entry.mission ? <p><strong>Mission :</strong> {entry.mission}</p> : null}
    {entry.acquired ? <p><strong>Expériences acquises :</strong> {entry.acquired}</p> : null}
    {entry.results ? <p><strong>Résultats :</strong> {entry.results}</p> : null}
  </div>;
}

function SideBlock({ heading, lines, className = '' }: { heading: string; lines: string[]; className?: string }) {
  return <section className={'thierry-side-block ' + className}>
    <h2>{heading}</h2>
    {lines.filter(Boolean).map((line, i) => <p key={i} className="thierry-side-line">{line}</p>)}
  </section>;
}

export function ThierryCvPreview({ draft }: { draft: CvDraft }) {
  const skills = thierrySkillGroups(draft);
  return <div className="thierry-page" data-testid="thierry-cv-preview">
    <aside className="thierry-rail">
      <div className="thierry-identity">
        <h1>{cleanThierryText(draft.name)}</h1>
        <p>{cleanThierryText(draft.headline)}</p>
      </div>
      <div className="thierry-location">
        {draft.location ? <p>{cleanThierryText(draft.location)}</p> : null}
      </div>
      <div className="thierry-contact">
        {draft.email ? <p>{draft.email}</p> : null}
        {draft.phone ? <p>{draft.phone}</p> : null}
        {draft.thierryAge ? <p>{draft.thierryAge}</p> : null}
      </div>
      <SideBlock heading="DIPLÔMES / FORMATION" lines={thierryEducation(draft).map(line => '– ' + line)} className="thierry-education" />
      <SideBlock heading="LANGUE" lines={cleanThierryText(draft.languages).split('|')} className="thierry-language" />
      <SideBlock heading="LOGICIELS / OUTILS" lines={thierryTools(draft).map(line => '– ' + line)} className="thierry-tools" />
      <SideBlock heading="NORMES" lines={thierryMethods(draft).map(line => '– ' + line)} />
      <SideBlock heading="Atouts" lines={thierryAdvantages(draft).map(line => '– ' + line)} className="thierry-accent" />
      <SideBlock heading="Loisirs" lines={cleanThierryText(draft.interests).split('|').map(line => '– ' + line)} className="thierry-accent" />
      <SideBlock heading="Savoir-être" lines={thierrySoftSkills(draft).map(line => '– ' + line)} className="thierry-accent" />
    </aside>
    <main className="thierry-main">
      {draft.thierryShowProfile !== false && draft.summary.trim() ? <section className="thierry-summary">
        <h2>PROFIL</h2><p>{cleanThierryText(draft.summary)}</p>
      </section> : null}
      <section className="thierry-experience">
        <h2>EXPERIENCES</h2>
        {thierryEntries(draft).map(entry => <ThierryEntryView entry={entry} key={entry.id} />)}
      </section>
      {skills.length ? <section className="thierry-competences">
        <h2>COMPETENCES</h2>
        {skills.map((group, i) => <div className="thierry-skill-group" key={i}>
          <p className="thierry-skill">❖ &nbsp; {group.title}</p>
          {group.bullets.length ? <ul>{group.bullets.map((line,j) => <li key={j}>{line}</li>)}</ul> : null}
        </div>)}
      </section> : null}
    </main>
  </div>;
}
