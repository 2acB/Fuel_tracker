import { useEffect, useState, useRef } from 'react';
import { useRefuelStore } from '../store/refuel-store';
import { useVehicleStore } from '../store/vehicle-store';
import { formatTHB, formatDate } from '../lib/utils';
import { Map as MapIcon } from 'lucide-react';

// Dynamically import Leaflet to avoid SSR issues
let L: typeof import('leaflet') | null = null;

interface MapViewProps {
  hideHeader?: boolean;
  filterVehicleId?: string;
}

export default function MapView({ hideHeader, filterVehicleId }: MapViewProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { sessions } = useRefuelStore();
  const { vehicles } = useVehicleStore();
  const [ready, setReady] = useState(false);

  const sessionsWithGps = sessions.filter((s) => s.lat != null && s.lng != null && (!filterVehicleId || s.vehicle_id === filterVehicleId));

  useEffect(() => {
    // Dynamic import of Leaflet
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([leaflet]) => {
      L = leaflet.default || leaflet;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !L || !mapRef.current || mapInstanceRef.current) return;

    // Default center: Bangkok
    const defaultCenter: [number, number] = [13.7563, 100.5018];
    const center: [number, number] = sessionsWithGps.length > 0
      ? [sessionsWithGps[0].lat!, sessionsWithGps[0].lng!]
      : defaultCenter;

    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Add markers for each session
    const vehicleColors: Record<string, string> = {};
    const colorPalette = ['#f97316', '#0ea5e9', '#10b981', '#a855f7', '#ef4444', '#f59e0b'];
    vehicles.forEach((v, i) => {
      vehicleColors[v.id] = colorPalette[i % colorPalette.length];
    });

    const points: [number, number][] = [];

    sessionsWithGps
      .sort((a, b) => new Date(a.fueled_at).getTime() - new Date(b.fueled_at).getTime())
      .forEach((s) => {
        const pos: [number, number] = [s.lat!, s.lng!];
        points.push(pos);
        const color = vehicleColors[s.vehicle_id] || '#f97316';
        const vehicle = vehicles.find((v) => v.id === s.vehicle_id);

        const icon = L!.divIcon({
          className: 'custom-pin',
          html: `<div style="background:${color}">⛽</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L!.marker(pos, { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'Outfit',sans-serif;font-size:13px;">
              <strong>${vehicle?.avatar_emoji ?? ''} ${vehicle?.name ?? 'Vehicle'}</strong><br/>
              📅 ${formatDate(s.fueled_at)}<br/>
              💰 ${formatTHB(s.cost_thb)}<br/>
              ${s.litres ? `⛽ ${s.litres.toFixed(1)}L` : ''}
            </div>
          `);
      });

    // Draw polyline connecting points
    if (points.length > 1) {
      L.polyline(points, {
        color: '#f97316',
        weight: 2,
        opacity: 0.6,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Fit bounds if we have points
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [ready, sessionsWithGps.length]);

  if (sessionsWithGps.length === 0) {
    return (
      <div>
        {!hideHeader && (
          <div className="page-header">
            <div className="page-title">Map</div>
            <div className="page-subtitle">Refuel station locations</div>
          </div>
        )}
        <div className="empty-state">
          <div className="empty-icon"><MapIcon size={48} strokeWidth={1.2} /></div>
          <div className="empty-title">No Locations Yet</div>
          <div className="empty-desc">Enable GPS when logging refuels to see them on the map</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!hideHeader && (
        <div className="page-header">
          <div className="page-title">Map</div>
          <div className="page-subtitle">{sessionsWithGps.length} location{sessionsWithGps.length !== 1 ? 's' : ''}</div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />
    </div>
  );
}
