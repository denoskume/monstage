import type { ReactNode } from 'react';
import type { CvDraft } from './cvStorage';
import { thierryEntries, thierryTools } from './thierryTemplate';
import { CvLiveText } from './cvLiveEditing';
import {
  CvLiveReferenceEducation, CvLiveReferenceEntry,
  CvLiveReferenceSkills, CvLiveReferenceLines,
} from './CvLiveReference';
import './design01.css';

function SideSection({ title, children, className = '' }: {title:string;children:ReactNode;className?:string}) {
  return <section className={'design01-side-section ' + className}>
    <h2>{title}</h2>
    <div className="design01-side-content">{children}</div>
  </section>;
}

export function Design01Preview({ draft }: {draft:CvDraft}) {
  return <div className="design01-page" data-testid="design01-cv-preview">
    <header className="design01-header">
      <h1><CvLiveText value={draft.name} target={{scope:'draft',field:'name'}} label="Nom" /></h1>
      <p className="design01-academic">
        <CvLiveText value={draft.academicHeadline ?? ''} target={{scope:'draft',field:'academicHeadline'}} placeholder="Formation principale" multiline />
      </p>
      <p className="design01-headline">
        <CvLiveText value={draft.headline} target={{scope:'draft',field:'headline'}} placeholder="Intitulé du CV" multiline />
      </p>
      <p>
        <CvLiveText value={draft.location} target={{scope:'draft',field:'location'}} placeholder="Localisation" /> {' | '}
        <CvLiveText value={draft.email} target={{scope:'draft',field:'email'}} placeholder="Email" /> {' | '}
        <CvLiveText value={draft.phone} target={{scope:'draft',field:'phone'}} placeholder="Téléphone" />
      </p>
      <p>
        <CvLiveText value={draft.linkedin} target={{scope:'draft',field:'linkedin'}} placeholder="LinkedIn" /> {' | '}
        <CvLiveText value={draft.github} target={{scope:'draft',field:'github'}} placeholder="GitHub" />
      </p>
    </header>
    <div className="design01-columns">
      <aside className="design01-sidebar">
        <SideSection title="DIPLÔMES / FORMATION" className="design01-formation">
          <CvLiveReferenceEducation draft={draft} />
        </SideSection>
        <SideSection title="LANGUE" className="design01-language">
          <CvLiveReferenceLines field="languages" value={draft.languages} placeholder="Langues" />
        </SideSection>
        <SideSection title="LOGICIELS / OUTILS" className="design01-tools">
          <CvLiveReferenceLines field="thierryTools" value={draft.thierryTools?.trim() ? draft.thierryTools : thierryTools(draft).join('\n')} placeholder="Logiciels / outils" />
        </SideSection>
        <SideSection title="Atouts" className="design01-atouts">
          <CvLiveReferenceLines field="thierryAdvantages" value={draft.thierryAdvantages ?? ''} placeholder="Atouts" />
        </SideSection>
        <SideSection title="Loisirs" className="design01-hobbies">
          <CvLiveReferenceLines field="interests" value={draft.interests} placeholder="Loisirs" />
        </SideSection>
        <SideSection title="Savoir-être" className="design01-softskills">
          <CvLiveReferenceLines field="thierrySoftSkills" value={draft.thierrySoftSkills ?? ''} placeholder="Savoir-être" />
        </SideSection>
      </aside>
      <main className="design01-main">
        <section className="design01-summary">
          <h2>PROFIL</h2>
          <p><CvLiveText value={draft.summary} target={{scope:'draft',field:'summary'}} placeholder="Profil" multiline /></p>
        </section>
        <section className="design01-experiences">
          <h2>EXPÉRIENCE</h2>
          <div className="design01-list">
            {thierryEntries(draft).map(entry => <CvLiveReferenceEntry draft={draft} kind="design01" entry={entry} key={entry.id} />)}
          </div>
        </section>
        <section className="design01-skills">
          <h2>COMPÉTENCES</h2>
          <CvLiveReferenceSkills draft={draft} kind="design01" />
        </section>
      </main>
    </div>
  </div>;
}
