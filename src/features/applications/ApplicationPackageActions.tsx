import { Link } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';

export function ApplicationPackageActions({ offer }: { offer: InternshipOffer }) {
  return (
    <section className="detail-section" aria-label="Préparer une candidature dans Studio">
      <h2>Documents de candidature</h2>
      <p>Prépare le CV et la lettre de motivation pour cette offre dans le même Studio. Les deux documents restent modifiables et aucun envoi n’est effectué sans ton accord explicite.</p>
      <Link className="button button--secondary" to={'/studio?offer=' + encodeURIComponent(offer.id)}>
        Adapter le CV et la lettre dans Studio →
      </Link>
    </section>
  );
}
