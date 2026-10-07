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
import { useOfferActions } from './offerActions';

function initialFilters(): OfferFilterState {
  const prefs = loadPreferences();
  return { query: prefs.query, specialization: null, city: null, priority: null, minScore: prefs.minScore, freshness: null, m2Fit: null, sourceQuality: null, applicationStatus: null, onlyForMe: prefs.onlyForMe };
}

const resetFilters: OfferFilterState = { query: '', specialization: null, city: null, priority: null, minScore: 0, freshness: null, m2Fit: null, sourceQuality: null, applicationStatus: null, onlyForMe: false };
const sortLabels: Record<SortMode, string> = { best: 'Best match', recent: 'Most recent', score: 'Highest score', priority: 'Priority', city: 'City' };

function selectionKey(offer: InternshipOffer): string {
  return [offer.id, offer.company, offer.title, offer.applicationUrl ?? ''].join('::');
}

export function OffersPage() {
  const { data, loading, error, retry } = useOffers();
  const initialPrefs = useMemo(() => loadPreferences(), []);
  const [filters, setFilters] = useState<OfferFilterState>(() => initialFilters());
  const [sort, setSort] = useState<SortMode>(initialPrefs.sort);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; offerId?: string } | null>(null);
  const actions = useOfferActions();

  const offers = data?.offers ?? [];
  const visibleOffers = useMemo(
    () => sortOffers(filterOffers(offers.filter((offer) => !actions.isHidden(offer.id)), filters), sort),
    [offers, filters, sort, actions.hidden],
  );
  const selectedOffer = visibleOffers.find((offer) => selectionKey(offer) === selectedKey) ?? visibleOffers[0] ?? null;

  useEffect(() => {
    if (selectedOffer && selectionKey(selectedOffer) !== selectedKey) setSelectedKey(selectionKey(selectedOffer));
    if (!selectedOffer) setSelectedKey(null);
  }, [selectedOffer, selectedKey]);

  useEffect(() => {
    savePreferences({ query: filters.query, sort, onlyForMe: filters.onlyForMe, minScore: filters.minScore });
  }, [filters.query, filters.onlyForMe, filters.minScore, sort]);

  function resetAll() {
    setFilters(resetFilters);
    setSort(defaultPreferences.sort);
    setFiltersOpen(false);
  }

  function openFilters() {
    setFiltersOpen(true);
  }

  function applyFilters(nextFilters: OfferFilterState) {
    setFilters({ ...nextFilters });
    setFiltersOpen(false);
  }

  function chooseOffer(offer: InternshipOffer) {
    setSelectedKey(selectionKey(offer));
    setMobileDetail(true);
  }

  function toggleSaved(offer: InternshipOffer) {
    actions.toggleSaved(offer.id, offer.shortlist);
  }

  function hideOffer(offer: InternshipOffer) {
    actions.hideOffer(offer.id);
    setActionNotice({ text: 'Job hidden.', offerId: offer.id });
    if (selectionKey(offer) === selectedKey) setMobileDetail(false);
  }

  async function shareOffer(offer: InternshipOffer) {
    const url = offer.applicationUrl || window.location.href;
    const text = `${offer.title} — ${offer.company}`;
    try {
      if (navigator.share) await navigator.share({ title: offer.title, text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setActionNotice({ text: 'Job link copied.' });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setActionNotice({ text: 'Unable to share this job.' });
    }
  }

  const activeFilterCount = [filters.specialization, filters.city, filters.priority, filters.freshness, filters.m2Fit, filters.sourceQuality, filters.applicationStatus].filter(Boolean).length + (filters.minScore > 0 ? 1 : 0) + (filters.onlyForMe ? 1 : 0);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page offers-page">
      <div className="jobs-search-shell">
        <div className="jobs-search-shell__controls">
          <SearchBar value={filters.query} onChange={(query) => setFilters({ ...filters, query })} placeholder="Job title, skill or company" />
          <button type="button" className="jobs-filter-button" onClick={openFilters}>
            Filters{activeFilterCount ? <span>{activeFilterCount}</span> : null}
          </button>
        </div>
        <div className="jobs-quickbar">
          <button type="button" className={'quick-filter' + (filters.onlyForMe ? ' active' : '')} aria-pressed={filters.onlyForMe} onClick={() => setFilters({ ...filters, onlyForMe: !filters.onlyForMe })}>Recommended for me</button>
          <label className="jobs-sort"><span>Sort by</span><select value={sort} onChange={(event: { target: { value: string } }) => setSort(event.target.value as SortMode)}><option value="best">Best match</option><option value="recent">Most recent</option><option value="score">Highest score</option><option value="priority">Priority</option><option value="city">City</option></select></label>
        </div>
      </div>

      {error && data ? <div className="stale-banner" role="status">Showing cached data. <button onClick={retry}>Refresh</button></div> : null}
      {actionNotice ? <div className="offer-action-notice" role="status"><span>{actionNotice.text}</span>{actionNotice.offerId ? <button type="button" onClick={() => { actions.unhideOffer(actionNotice.offerId!); setActionNotice(null); }}>Undo</button> : <button type="button" onClick={() => setActionNotice(null)}>×</button>}</div> : null}

      {filtersOpen ? <div className="filters-overlay filters-overlay--active" role="dialog" aria-modal="true" aria-label="Opportunity filters" onMouseDown={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false); }}><div className="filters-sheet filters-sheet--desktop"><OfferFilters mobile offers={offers} filters={filters} onChange={setFilters} onReset={() => setFilters(resetFilters)} onClose={() => setFiltersOpen(false)} onApply={applyFilters} /></div></div> : null}

      {visibleOffers.length === 0 ? <EmptyState actionLabel="Reset filters" onAction={resetAll} /> : (
        <>
          <div className="jobs-results-header"><div><strong>{visibleOffers.length}</strong> opportunities</div><span>{sortLabels[sort]}</span></div>
          <div className={'offers-layout' + (mobileDetail ? ' mobile-detail-open' : '')}>
            <div className="offers-list-pane"><OfferList offers={visibleOffers} selectedKey={selectedOffer ? selectionKey(selectedOffer) : null} onSelect={chooseOffer} isSaved={(offer) => actions.isSaved(offer.id, offer.shortlist)} onToggleSave={toggleSaved} onHide={hideOffer} onShare={(offer) => void shareOffer(offer)} /></div>
            <div className="offer-detail-pane">{selectedOffer ? <OfferDetail offer={selectedOffer} onBack={() => setMobileDetail(false)} saved={actions.isSaved(selectedOffer.id, selectedOffer.shortlist)} onToggleSave={() => toggleSaved(selectedOffer)} onHide={() => hideOffer(selectedOffer)} onShare={() => void shareOffer(selectedOffer)} /> : null}</div>
          </div>
        </>
      )}
    </section>
  );
}
