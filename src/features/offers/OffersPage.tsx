import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { SearchBar } from '../../components/SearchBar';
import { useOffers } from '../../hooks/useOffers';
import { defaultPreferences, loadPreferences, savePreferences, type SortMode } from '../../storage/preferences';
import { dedupeOffers, filterOffers, offerIdentity, sortOffers } from './offerSelectors';
import type { OfferFilters as OfferFilterState } from './offerTypes';
import { OfferDetail } from './OfferDetail';
import { OfferFilters } from './OfferFilters';
import { OfferList } from './OfferList';
import type { InternshipOffer } from '../../api/contract';
import { useOfferActions } from './offerActions';

function initialFilters(): OfferFilterState {
  const prefs = loadPreferences();
  return {
    query: prefs.query,
    specialization: prefs.specialization,
    industry: prefs.industry,
    city: prefs.city,
    priority: prefs.priority,
    minScore: prefs.minScore,
    freshness: prefs.freshness,
    m2Fit: prefs.m2Fit,
    sourceQuality: prefs.sourceQuality,
    applicationStatus: prefs.applicationStatus,
    onlyForMe: prefs.onlyForMe,
  };
}

const resetFilters: OfferFilterState = { query: '', specialization: null, industry: null, city: null, priority: null, minScore: 0, freshness: null, m2Fit: null, sourceQuality: null, applicationStatus: null, onlyForMe: false };
const sortLabels: Record<SortMode, string> = { best: 'Best match', recent: 'Most recent', score: 'Highest score', priority: 'Priority', city: 'City' };
const PAGE_SIZE = 10;

function paginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const normalized = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];

  normalized.forEach((page, index) => {
    const previous = normalized[index - 1];
    if (previous && page - previous > 1) items.push('ellipsis');
    items.push(page);
  });

  return items;
}

function selectionKey(offer: InternshipOffer): string {
  return offerIdentity(offer);
}

export function OffersPage() {
  const { data, loading, error, retry } = useOffers();
  const initialPrefs = useMemo(() => loadPreferences(), []);
  const [filters, setFilters] = useState<OfferFilterState>(() => initialFilters());
  const [draftFilters, setDraftFilters] = useState<OfferFilterState>(() => initialFilters());
  const [sort, setSort] = useState<SortMode>(initialPrefs.sort);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionNotice, setActionNotice] = useState<{ text: string; offerId?: string } | null>(null);
  const actions = useOfferActions();

  const offers = data?.offers ?? [];
  const availableOffers = useMemo(
    () => dedupeOffers(offers.filter((offer) => !actions.isHidden(offer.id))),
    [offers, actions.hidden],
  );
  const filteredOffers = useMemo(
    () => filterOffers(availableOffers, filters),
    [availableOffers, filters],
  );
  const visibleOffers = useMemo(
    () => sortOffers(filteredOffers, sort),
    [filteredOffers, sort],
  );
  const totalPages = Math.max(1, Math.ceil(visibleOffers.length / PAGE_SIZE));
  const paginatedOffers = useMemo(
    () => visibleOffers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [visibleOffers, currentPage],
  );
  const selectedOffer = paginatedOffers.find((offer) => selectionKey(offer) === selectedKey) ?? paginatedOffers[0] ?? null;
  const pageStart = visibleOffers.length ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, visibleOffers.length);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
    setMobileDetail(false);
  }, [filters, sort]);

  useEffect(() => {
    if (selectedOffer && selectionKey(selectedOffer) !== selectedKey) setSelectedKey(selectionKey(selectedOffer));
    if (!selectedOffer) setSelectedKey(null);
  }, [selectedOffer, selectedKey]);

  useEffect(() => {
    savePreferences({
      query: filters.query,
      sort,
      onlyForMe: filters.onlyForMe,
      minScore: filters.minScore,
      specialization: filters.specialization,
      industry: filters.industry,
      city: filters.city,
      priority: filters.priority,
      freshness: filters.freshness,
      m2Fit: filters.m2Fit,
      sourceQuality: filters.sourceQuality,
      applicationStatus: filters.applicationStatus,
    });
  }, [filters, sort]);

  function resetAll() {
    setFilters(resetFilters);
    setDraftFilters(resetFilters);
    setSort(defaultPreferences.sort);
    setFiltersOpen(false);
  }

  function openFilters() {
    setDraftFilters({ ...filters });
    setFiltersOpen(true);
  }

  function closeFilters() {
    setDraftFilters({ ...filters });
    setFiltersOpen(false);
  }

  function applyFilters(nextFilters: OfferFilterState) {
    const applied = { ...nextFilters };
    setFilters(applied);
    setDraftFilters(applied);
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

  const activeFilterCount = [filters.industry, filters.specialization, filters.city, filters.priority, filters.freshness, filters.m2Fit, filters.sourceQuality, filters.applicationStatus].filter(Boolean).length + (filters.minScore > 0 ? 1 : 0) + (filters.onlyForMe ? 1 : 0);
  const activeFilterSummary = [
    filters.industry ? `Industry: ${filters.industry}` : null,
    filters.city ? `City: ${filters.city}` : null,
    filters.specialization ? `Specialization: ${filters.specialization}` : null,
    filters.priority ? `Priority: ${filters.priority}` : null,
    filters.minScore > 0 ? `Score: ${filters.minScore}+` : null,
    filters.freshness ? `Freshness: ${filters.freshness}` : null,
    filters.m2Fit ? `M2 fit: ${filters.m2Fit}` : null,
    filters.sourceQuality ? `Source: ${filters.sourceQuality}` : null,
    filters.applicationStatus ? `Status: ${filters.applicationStatus}` : null,
    filters.onlyForMe ? 'Recommended for me' : null,
  ].filter((value): value is string => Boolean(value));

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page offers-page">
      <header className="jobs-page-heading">
        <h1>Explore internships</h1>
        <p>Find the most relevant opportunities for your profile and February 2027 start.</p>
      </header>

      <div className="jobs-search-shell">
        <div className="jobs-search-shell__controls">
          <SearchBar value={filters.query} onChange={(query) => setFilters({ ...filters, query })} placeholder="Job title, skill or company" />
          <button type="button" className="jobs-filter-button" onClick={openFilters}>
            Filters{activeFilterCount ? <span>{activeFilterCount}</span> : null}
          </button>
        </div>
        <div className="jobs-quickbar">
          <div className="jobs-active-filters" aria-label="Active filters">
            <button type="button" className={'quick-filter' + (filters.onlyForMe ? ' active' : '')} aria-pressed={filters.onlyForMe} onClick={() => setFilters({ ...filters, onlyForMe: !filters.onlyForMe })}>Recommended for me</button>
            {activeFilterSummary.filter((label) => label !== 'Recommended for me').map((label) => <span className="quick-filter active" key={label}>{label}</span>)}
          </div>
          <label className="jobs-sort"><span>Sort by</span><select value={sort} onChange={(event: { target: { value: string } }) => setSort(event.target.value as SortMode)}><option value="best">Best match</option><option value="recent">Most recent</option><option value="score">Highest score</option><option value="priority">Priority</option><option value="city">City</option></select></label>
        </div>
      </div>

      {error && data ? <div className="stale-banner" role="status">Showing cached data. <button onClick={retry}>Refresh</button></div> : null}
      {actionNotice ? <div className="offer-action-notice" role="status"><span>{actionNotice.text}</span>{actionNotice.offerId ? <button type="button" onClick={() => { actions.unhideOffer(actionNotice.offerId!); setActionNotice(null); }}>Undo</button> : <button type="button" onClick={() => setActionNotice(null)}>×</button>}</div> : null}

      {filtersOpen ? <div className="filters-overlay filters-overlay--active" role="dialog" aria-modal="true" aria-label="Opportunity filters" onMouseDown={(event) => { if (event.target === event.currentTarget) closeFilters(); }}><div className="filters-sheet filters-sheet--desktop"><OfferFilters mobile offers={offers} filters={draftFilters} onChange={setDraftFilters} onReset={() => setDraftFilters(resetFilters)} onClose={closeFilters} onApply={applyFilters} /></div></div> : null}

      {visibleOffers.length === 0 ? <EmptyState actionLabel="Reset filters" onAction={resetAll} /> : (
        <>
          <div className="jobs-results-header">
            <div className="jobs-results-count">
              <strong>{visibleOffers.length}</strong>
              <span>opportunities</span>
              <small>{pageStart}–{pageEnd}</small>
            </div>
          </div>
          <div className={'offers-layout' + (mobileDetail ? ' mobile-detail-open' : '')}>
            <div className="offers-list-pane"><OfferList offers={paginatedOffers} selectedKey={selectedOffer ? selectionKey(selectedOffer) : null} onSelect={chooseOffer} isSaved={(offer) => actions.isSaved(offer.id, offer.shortlist)} onToggleSave={toggleSaved} onHide={hideOffer} onShare={(offer) => void shareOffer(offer)} /></div>
            <div className="offer-detail-pane">{selectedOffer ? <OfferDetail offer={selectedOffer} onBack={() => setMobileDetail(false)} saved={actions.isSaved(selectedOffer.id, selectedOffer.shortlist)} onToggleSave={() => toggleSaved(selectedOffer)} onHide={() => hideOffer(selectedOffer)} onShare={() => void shareOffer(selectedOffer)} /> : null}</div>
          </div>
          {totalPages > 1 ? (
            <nav className="jobs-pagination" aria-label="Jobs pagination">
              <button
                type="button"
                className="jobs-pagination__nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </button>
              <div className="jobs-pagination__pages">
                {paginationItems(currentPage, totalPages).map((item, index) => item === 'ellipsis' ? (
                  <span key={'ellipsis-' + index} className="jobs-pagination__ellipsis" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={'jobs-pagination__page' + (item === currentPage ? ' is-active' : '')}
                    aria-current={item === currentPage ? 'page' : undefined}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="jobs-pagination__nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
