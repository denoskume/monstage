import { Link } from 'react-router-dom';

export function StudioPage() {
  return (
    <section className="page studio-page">
      <div className="page-header">
        <div>
          <h1>Studio</h1>
          <p>Create, tailor and export your application documents from one place.</p>
        </div>
      </div>

      <div className="studio-grid">
        <Link to="/cv" className="card studio-card" aria-label="Open CV Studio">
          <div className="studio-card__icon" aria-hidden="true">CV</div>
          <div>
            <h2>CV</h2>
            <p>Prepare independent French and English CV versions, tailor the content and export a clean ATS-friendly PDF.</p>
          </div>
          <span className="studio-card__arrow" aria-hidden="true">→</span>
        </Link>

        <Link to="/cl" className="card studio-card" aria-label="Open Cover Letter Studio">
          <div className="studio-card__icon" aria-hidden="true">CL</div>
          <div>
            <h2>Cover Letter</h2>
            <p>Write and adapt native French and English cover letters with independent templates and direct PDF export.</p>
          </div>
          <span className="studio-card__arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
