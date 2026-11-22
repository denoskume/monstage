/**
 * Show contextual application guidance only for the document currently open.
 * Never derive the offer identity from the last global application-review key:
 * that key can refer to another application opened earlier.
 */
export interface CvNoticeOffer {
  id: string;
  company: string;
  title: string;
}

export function currentCvNoticeOffer(
  offerId: string | null,
  offer: CvNoticeOffer | null | undefined,
  isCurrentDraftLoaded: boolean,
): CvNoticeOffer | null {
  if (!offerId || !isCurrentDraftLoaded || !offer || offer.id !== offerId) return null;
  if (!offer.company.trim() || !offer.title.trim()) return null;
  return offer;
}
