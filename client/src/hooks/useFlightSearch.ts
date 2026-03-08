import { useState, useEffect, useCallback } from 'react';
import type { SearchParams, FlightResult } from '../types';
import { searchFlights } from '../utils/api';

const STORAGE_KEY = 'flightSearchParams';

const defaultParams: SearchParams = {
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  passengers: 1,
  cabinClass: 'ECONOMY',
  flexibleDates: false,
};

function loadPersistedParams(): SearchParams {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultParams, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultParams;
}

export function useFlightSearch() {
  const [params, setParams] = useState<SearchParams>(loadPersistedParams);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch {
      // ignore storage errors
    }
  }, [params]);

  const search = useCallback(async (searchParams: SearchParams) => {
    setParams(searchParams);
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchFlights(searchParams);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { params, results, loading, error, search, setParams };
}
