import { useMemo } from 'react';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';
import { countByCity, countBySpecialization, getApplicationFunnel, getConversionMetrics, getDashboardKpis, type CountItem } from './dashboardSelectors';

function BarList({ items }: { items: CountItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return <div className="bar-list">{items.map((item) => <div className="bar-row" key={item.label}><div className="bar-row__label"><span>{displayValue(item.label)}</span><strong>{item.count}</strong></div><div className="bar-track"><span style={{ width: `${(item.count / max) * 100}%` }} /></div></div>)}</div>;
}

export function DashboardPage() {
  const { data, loading, error, retry } = useOffers();
  const offers = data?.offers ?? [];
  const kpis = useMemo(() => getDashboardKpis(offers), [offers]);
  const conversions = useMemo(() => getConversionMetrics(offers), [offers]);
  const specializations = useMemo(() => countBySpecialization(offers).slice(0, 8), [offers]);
  const cities = useMemo(() => countByCity(offers, 8), [offers]);
  const funnel = useMemo(() => getApplicationFunnel(offers), [offers]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  const cards = [
    ['Active opportunities', kpis.activeOpportunities], ['Priority A / A+', kpis.aOrAPlus], ['Apply within 24h', kpis.apply24h],
    ['Shortlist', kpis.shortlist], ['Applications sent', kpis.applicationsSent], ['Interviews', kpis.interviews],
  ] as const;

  return (
    <section className="page dashboard-page">
      <div className="page-header"><div><h1>Dashboard</h1></div></div>
      <div className="kpi-grid">{cards.map(([label, value]) => <article className="kpi-card card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>

      <article className="conversion-card card">
        <div className="dashboard-card__header"><h2>Outcome analytics</h2><span>Learn what converts</span></div>
        <div className="conversion-grid">
          <div><span>Applications</span><strong>{conversions.applications}</strong></div>
          <div><span>Recruiter responses</span><strong>{conversions.recruiterResponses}</strong><small>{conversions.responseRate}% response rate</small></div>
          <div><span>Interview-stage</span><strong>{conversions.interviews}</strong><small>{conversions.interviewRate}% interview rate</small></div>
          <div><span>Offers</span><strong>{conversions.offers}</strong><small>{conversions.offerRate}% offer rate</small></div>
        </div>
      </article>

      <div className="dashboard-grid">
        <article className="dashboard-card card"><div className="dashboard-card__header"><h2>Opportunities by specialization</h2><span>Top {specializations.length}</span></div><BarList items={specializations} /></article>
        <article className="dashboard-card card"><div className="dashboard-card__header"><h2>Top cities</h2><span>Top {cities.length}</span></div><BarList items={cities} /></article>
        <article className="dashboard-card card dashboard-card--wide"><div className="dashboard-card__header"><h2>Application funnel</h2><span>Pipeline</span></div><div className="funnel-list">{funnel.map((item) => <div className="funnel-item" key={item.label}><span>{displayValue(item.label)}</span><strong>{item.count}</strong></div>)}</div></article>
      </div>
    </section>
  );
}
