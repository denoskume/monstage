import { Link } from 'react-router-dom';

type InfoKind = 'sitemap' | 'accessibility' | 'privacy' | 'legal';

const content: Record<InfoKind, { title: string; intro: string; sections: Array<{ heading: string; body: string }> }> = {
  sitemap: {
    title: 'Site map',
    intro: 'A compact overview of the main MonSt@ge areas.',
    sections: [
      { heading: 'Discover', body: 'Jobs, saved jobs and insights help you find and prioritize relevant internship opportunities.' },
      { heading: 'Prepare', body: 'Studio, CV, cover letter and Workspace help you prepare a focused application package.' },
      { heading: 'Track', body: 'Applications, notifications and recruiter activity help you follow what happens after you apply.' },
    ],
  },
  accessibility: {
    title: 'Accessibility',
    intro: 'MonSt@ge is designed to remain usable with keyboard navigation, readable contrast and responsive layouts.',
    sections: [
      { heading: 'Keyboard', body: 'Interactive controls expose visible focus states and core navigation remains keyboard accessible.' },
      { heading: 'Responsive layout', body: 'Primary workflows are designed for desktop, tablet and mobile screen sizes.' },
      { heading: 'Continuous improvement', body: 'Accessibility issues found during testing should be treated as product defects and corrected.' },
    ],
  },
  privacy: {
    title: 'Privacy',
    intro: 'MonSt@ge is a private candidate workspace. Access is restricted and application data is not intended to be public.',
    sections: [
      { heading: 'Account access', body: 'The application uses authenticated access and does not provide public account creation.' },
      { heading: 'Application data', body: 'Saved jobs, preparation notes and application tracking are used to support your internship workflow.' },
      { heading: 'External employers', body: 'When you choose Apply, MonSt@ge opens the employer website directly. The employer website then applies its own privacy policy.' },
    ],
  },
  legal: {
    title: 'Legal notice',
    intro: 'MonSt@ge is a personal internship-search and application-management project.',
    sections: [
      { heading: 'Third-party offers', body: 'Job offers remain the property and responsibility of their original publishers and employers.' },
      { heading: 'External links', body: 'MonSt@ge may link to employer or recruiting websites. Those services operate independently from MonSt@ge.' },
      { heading: 'No representation', body: 'MonSt@ge does not represent the employers whose opportunities are indexed in the application.' },
    ],
  },
};

export function InfoPage({ kind }: { kind: InfoKind }) {
  const page = content[kind];

  return (
    <section className="page info-page">
      <div className="info-page__header">
        <Link to="/offers">← Back to Jobs</Link>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </div>
      <div className="info-page__content">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
