import { useMemo } from 'react';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { countByCity, countBySpecialization, getApplicationFunnel, getDashboardKpis, type CountItem } from './dashboardSelectors';

function BarList({ items }: { items: CountItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return <div className="bar-list">{items.map((item) => <div className="bar-row" key={item.label}><div className="bar-row__label"><span>{item.label}</span><strong>{item.count}</strong></div><div className="bar-track"><span style={{ width: `${(item.count / max) * 100}%` }} /></div></div>)}</div>;
}

export function DashboardPage() {
  const { data, loading, error, retry } = useOffers();
  const offers = data?.offers ?? [];
  const kpis = useMemo(() => getDashboardKpis(offers), [offers]);
  const specializations = useMemo(() => countBySpecialization(offers).slice(0, 8), [offers]);
  const cities = useMemo(() => countByCity(offers, 8), [offers]);
  const funnel = useMemo(() => getApplicationFunnel(offers), [offers]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  const cards = [
    ['Offres actives', kpis.activeOpportunities], ['Priorité A / A+', kpis.aOrAPlus], ['Candidater 24h', kpis.apply24h],
    ['Shortlist', kpis.shortlist], ['Candidatures envoyées', kpis.applicationsSent], ['Entretiens', kpis.interviews],
  ] as const;

  return (
    <section className="page dashboard-page">
      <div className="page-header"><div><p className="eyebrow">Vue décisionnelle</p><h1>Dashboard</h1><p>Un résumé compact de ce qui mérite votre attention maintenant.</p></div></div>
      <div className="kpi-grid">{cards.map(([label, value]) => <article className="kpi-card card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
      <div className="dashboard-grid">
        <article className="dashboard-card card"><div className="dashboard-card__header"><h2>Offres par spécialisation</h2><span>Top {specializations.length}</span></div><BarList items={specializations} /></article>
        <article className="dashboard-card card"><div className="dashboard-card__header"><h2>Villes principales</h2><span>Top {cities.length}</span></div><BarList items={cities} /></article>
        <article className="dashboard-card card dashboard-card--wide"><div className="dashboard-card__header"><h2>Funnel candidature</h2><span>Pipeline</span></div><div className="funnel-list">{funnel.map((item) => <div className="funnel-item" key={item.label}><span>{item.label}</span><strong>{item.count}</strong></div>)}</div></article>
      </div>
    </section>
  );
}
