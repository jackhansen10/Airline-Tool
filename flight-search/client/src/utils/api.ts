import type { SearchParams, FlightResult, Airport } from '../types';

const API_BASE = '/api';

export async function searchFlights(params: SearchParams): Promise<FlightResult[]> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Search failed' }));
    throw new Error(error.message || 'Search failed');
  }
  return res.json();
}

export async function searchAirports(query: string): Promise<Airport[]> {
  if (query.length < 1) return [];
  const res = await fetch(`${API_BASE}/airports?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}
