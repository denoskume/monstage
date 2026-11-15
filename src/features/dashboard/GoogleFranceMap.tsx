import { useEffect, useRef, useState } from 'react';

export type GoogleMapCity = {
  city: string;
  count: number;
  point: { lat: number; lon: number };
};

type Props = {
  cities: GoogleMapCity[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
  compact?: boolean;
};

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const FRANCE = {north: 51.35, south: 41.25, east: 9.8, west: -5.8};
let pending: Promise<void> | null = null;

function loadGoogleMaps(key: string): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise<void>((resolve, reject) => {
    const globalWindow = window as typeof window & { __monstageGoogleMapsReady?: () => void };
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key)
      + '&loading=async&v=weekly&language=fr&region=FR&callback=__monstageGoogleMapsReady';
    script.async = true;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    globalWindow.__monstageGoogleMapsReady = () => {
      delete globalWindow.__monstageGoogleMapsReady;
      resolve();
    };
    script.onerror = () => {
      delete globalWindow.__monstageGoogleMapsReady;
      script.remove();
      pending = null;
      reject(new Error('Google Maps API unavailable'));
    };
    document.head.appendChild(script);
  });
  return pending;
}

export function GoogleFranceMap({ cities, selectedCity, onCitySelect, compact=false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const selectRef = useRef(onCitySelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  selectRef.current = onCitySelect;

  useEffect(() => {
    if (!API_KEY || !host.current) return;
    let cancelled = false;
    loadGoogleMaps(API_KEY).then(() => {
      if (cancelled || !host.current) return;
      map.current = new google.maps.Map(host.current, {
        center: {lat: 46.65, lng: 2.45},
        zoom: 6, minZoom: 4, maxZoom: 18,
        gestureHandling: 'greedy', mapTypeControl: true,
        zoomControl: true, fullscreenControl: true, streetViewControl: true,
      });
      map.current.fitBounds(FRANCE);
      setReady(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !ready) return;
    const liveMap = map.current;
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    for (const item of cities) {
      const active = item.city === selectedCity;
      const marker = new google.maps.Marker({
        map: liveMap,
        position: {lat: item.point.lat, lng: item.point.lon},
        title: item.city + ' · ' + item.count + ' dossier(s)',
        label: {text: String(item.count), color: active ? '#242238' : '#ffffff', fontSize: '11px', fontWeight: '800'},
        icon: {path: google.maps.SymbolPath.CIRCLE, scale: Math.min(24, 12 + Math.sqrt(item.count) * 3),
          fillColor: active ? '#ffad52' : '#7569e1', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2.5},
      });
      marker.addListener('click', () => selectRef.current(item.city));
      markers.current.push(marker);
    }
    if (selectedCity) {
      const city = cities.find(item => item.city === selectedCity);
      if (city) {
        liveMap.panTo({lat: city.point.lat, lng: city.point.lon});
        if ((liveMap.getZoom() || 0) < 9) liveMap.setZoom(9);
      }
    }
  }, [cities, selectedCity, ready]);

  const city = selectedCity ? selectedCity + ', France' : 'France';
  const embed = 'https://maps.google.com/maps?output=embed&hl=fr&z='
    + (selectedCity ? '11' : '6') + '&q=' + encodeURIComponent(city);
  const external = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(city);

  return <div className={'db-google-map-shell'+(compact?' db-google-map-shell--compact':'')}>
    {API_KEY && !failed
      ? <div ref={host} data-testid="google-maps-js" className="db-google-canvas"
          role="application" aria-label="Google Maps avec marqueurs interactifs des candidatures"/>
      : <iframe data-testid="google-maps-iframe" className="db-google-iframe" title="Google Maps réel"
          src={embed} loading="eager" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>}
    {!compact && <a className="db-google-external" href={external} target="_blank" rel="noopener noreferrer">
      Ouvrir dans Google Maps ↗
    </a>}
    {!compact && !API_KEY && <div className="db-google-map-note">Sélectionnez une ville pour centrer Google Maps.
      Les marqueurs de toutes les offres nécessitent la clé Google Maps du site.</div>}
    {!compact && failed && <div className="db-google-map-note">Carte intégrée affichée : API Google Maps indisponible.</div>}
  </div>;
}
