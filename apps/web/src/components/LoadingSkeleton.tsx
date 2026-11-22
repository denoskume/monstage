export function LoadingSkeleton() {
  return (
    <div className="offers-layout" aria-label="Loading opportunities">
      <div className="offers-list-pane skeleton-list">
        {[0,1,2,3,4].map((item) => <div key={item} className="skeleton-card card"><span/><span/><span/><span/></div>)}
      </div>
      <div className="offer-detail-pane card skeleton-detail"><span/><span/><span/><span/><span/></div>
    </div>
  );
}
