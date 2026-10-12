import { Link } from 'react-router-dom';

const primaryLinks = [
  ['/offers', 'Jobs'],
  ['/studio', 'Studio'],
  ['/dashboard', 'Insights'],
  ['/shortlist', 'Saved jobs'],
] as const;

const utilityLinks = [
  ['/applications', 'Applications'],
  ['/workspace', 'Workspace'],
  ['/notifications', 'Notifications'],
] as const;

const infoLinks = [
  ['/sitemap', 'Site map'],
  ['/accessibility', 'Accessibility'],
  ['/privacy', 'Privacy'],
  ['/legal', 'Legal notice'],
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand-column">
          <Link to="/offers" className="site-footer__brand" aria-label="MonStage — Jobs home">MonStage</Link>
          <p>Your internship search, application preparation and follow-up workspace.</p>
        </div>

        <nav className="site-footer__column" aria-label="Explore">
          <strong>Explore</strong>
          {primaryLinks.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>

        <nav className="site-footer__column" aria-label="Tools">
          <strong>Tools</strong>
          {utilityLinks.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>

        <nav className="site-footer__column" aria-label="Information">
          <strong>Information</strong>
          {infoLinks.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span>© {year} MonStage</span>
        <span>Private candidate workspace</span>
        <button type="button" onClick={scrollToTop} aria-label="Back to top" title="Back to top">↑</button>
      </div>
    </footer>
  );
}
