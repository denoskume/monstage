import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { SearchBar } from '../../components/SearchBar';
import { useOffers } from '../../hooks/useOffers';
import { defaultPreferences, loadPreferences, savePreferences, type SortMode } from '../../storage/preferences';
import { filterOffers, sortOffers } from './offerSelectors';
import type { OfferFilters as OfferFilterState } from './offerTypes';
import { OfferDetail } from './OfferDetail';
import { OfferFilters } from './OfferFilters';
import { OfferList } from './OfferList';
import type { InternshipOffer } from '../../api/contract';

function initialFilters(): OfferFilterState {
  const prefs = loadPreferences();
  return { query: prefs.query, specialization: null, city: null, priority: null, minScore: prefs.minScore, freshness: null, m2Fit: null, sourceQuality: null, applicationStatus: null, onlyForMe: prefs.onlyForMe };
}

const resetFilters: OfferFilterState = { query: '', specialization: null, city: null, priority: null, minScore: 0, freshness: null, m2Fit: null, sourceQuality: null, applicationStatus: null, onlyForMe: false };

export function OffersPage() {
  const { data, loading, error, retry } = useOffers();
  const initialPrefs = useMemo(() => loadPreferences(), []);
  const [filters, setFilters] = useState<OfferFilterState>(() => initialFilters());
  const [sort, setSort] = useState<SortMode>(initialPrefs.sort);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  const offers = data?.offers ?? [];
  const visibleOffers = useMemo(() => sortOffers(filterOffers(offers, filters), sort), [offers, filters, sort]);
  const selectedOffer = visibleOffers.find((offer) => offer.id === selectedId) ?? visibleOffers[0] ?? null;

  useEffect(() => {
    if (selectedOffer && selectedOffer.id !== selectedId) setSelectedId(selectedOffer.id);
    if (!selectedOffer) setSelectedId(null);
  }, [selectedOffer, selectedId]);

  useEffect(() => {
    savePreferences({ query: filters.query, sort, onlyForMe: filters.onlyForMe, minScore: filters.minScore });
  }, [filters.query, filters.onlyForMe, filters.minScore, sort]);

  function resetAll() {
    setFilters(resetFilters);
    setSort(defaultPreferences.sort);
    setMobileFilters(false);
  }

  function chooseOffer(offer: InternshipOffer) {
    setSelectedId(offer.id);
    setMobileDetail(true);
  }

  const activeFilterCount = [filters.specialization, filters.city, filters.priority, filters.freshness, filters.m2Fit, filters.sourceQuality, filters.applicationStatus].filter(Boolean).length + (filters.minScore > 0 ? 1 : 0) + (filters.onlyForMe ? 1 : 0);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page offers-page">
      <div className="offers-hero">
        <div><p className="eyebrow">M2 · France entière</p><h1>Trouvez le stage qui vaut votre candidature.</h1><p>{offers.length} opportunités surveillées · classées par pertinence, fraîcheur et qualité.</p></div>
      </div>

      {error && data ? <div className="stale-banner" role="status">Données en cache affichées — la mise à jour a échoué. <button onClick={retry}>Réessayer</button></div> : null}

      <div className="offers-toolbar card">
        <SearchBar value={filters.query} onChange={(query) => setFilters({ ...filters, query })} />
        <div className="toolbar-actions">
          <button type="button" className={`toggle-chip${filters.onlyForMe ? ' active' : ''}`} aria-pressed={filters.onlyForMe} onClick={() => setFilters({ ...filters, onlyForMe: !filters.onlyForMe })}>✦ Pour moi</button>
          <button type="button" className="filter-trigger" onClick={() => setMobileFilters(true)}>Filtres{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
          <label className="sort-field"><span className="sr-only">Trier les offres</span><select value={sort} onChange={(event: { target: { value: string } }) => setSort(event.target.value as SortMode)}><option value="best">Meilleur match</option><option value="recent">Plus récent</option><option value="score">Score décroissant</option><option value="priority">Priorité</option><option value="city">Ville</option></select></label>
        </div>
      </div>

      <div className="desktop-filters"><OfferFilters offers={offers} filters={filters} onChange={setFilters} onReset={resetAll} /></div>

      {mobileFilters ? <div className="filters-overlay" role="dialog" aria-modal="true" aria-label="Filtres des offres"><div className="filters-sheet"><OfferFilters mobile offers={offers} filters={filters} onChange={setFilters} onReset={resetAll} onClose={() => setMobileFilters(false)} /></div></div> : null}

      {visibleOffers.length === 0 ? <EmptyState actionLabel="Réinitialiser les filtres" onAction={resetAll} /> : (
        <div className={`offers-layout${mobileDetail ? ' mobile-detail-open' : ''}`}>
          <div className="offers-list-pane">
            <div className="results-line"><strong>{visibleOffers.length}</strong> résultat{visibleOffers.length > 1 ? 's' : ''}<span>Tri : {sort === 'best' ? 'Meilleur match' : sort}</span></div>
            <OfferList offers={visibleOffers} selectedId={selectedOffer?.id ?? null} onSelect={chooseOffer} />
          </div>
          <div className="offer-detail-pane card">{selectedOffer ? <OfferDetail offer={selectedOffer} onBack={() => setMobileDetail(false)} /> : null}</div>
        </div>
      )}
    </section>
  );
}
