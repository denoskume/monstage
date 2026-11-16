import type { InternshipOffer } from '../../api/contract';
import type { ManualJobStage } from '../offers/offerActions';

type OfferStatusSnapshot = Pick<InternshipOffer, 'applicationStatus' | 'appliedAt'>;

/**
 * Manual saved offers do not necessarily exist in the Google Sheets feed.
 * Their locally stored lifecycle therefore takes precedence over the
 * static applicationStatus shipped with their saved-offer template.
 * For feed-backed offers, the backend status remains authoritative.
 */
export function resolveTrackingStage(
  offer: OfferStatusSnapshot,
  manualStage: ManualJobStage | undefined,
  submitted: boolean,
  isManuallySavedOffer: boolean,
): ManualJobStage | null {
  if (isManuallySavedOffer && manualStage) return manualStage;

  const status = offer.applicationStatus ?? '';
  if (status === 'Refus') return 'refused';
  if (status === 'Entretien' || status === 'Test technique') return 'interview';
  if (status === 'Abandonné') return 'archived';
  if (manualStage === 'refused') return 'refused';
  if (manualStage === 'archived') return 'archived';
  if (manualStage === 'interview') return 'interview';
  if (manualStage === 'application' || submitted || Boolean(offer.appliedAt) ||
      ['Candidature envoyée', 'Relance', 'Réponse recruteur', 'Offre reçue'].includes(status)) return 'application';
  return null;
}

export function trackingStageForStatus(status: string): ManualJobStage {
  if (status === 'Refus') return 'refused';
  if (status === 'Entretien' || status === 'Test technique') return 'interview';
  if (status === 'Abandonné') return 'archived';
  return 'application';
}
