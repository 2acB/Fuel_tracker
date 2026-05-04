import { useState, useCallback } from 'react';

interface GeoState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    coords: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'GPS not supported on this device' }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      () => {
        setState({
          coords: null,
          error: 'Location permission denied. You can enter location manually.',
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({ coords: null, error: null, loading: false });
  }, []);

  return { ...state, getLocation, clearLocation };
}
