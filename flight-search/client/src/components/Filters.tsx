import { useMemo } from 'react';
import type { FlightResult } from '../types';
import { getTimeOfDay, formatPrice } from '../utils/format';

export interface FilterState {
  stops: number[];
  airlines: string[];
  maxPrice: number;
  timeOfDay: string[];
}

type SortBy = 'price' | 'duration' | 'departure' | 'arrival';

interface FiltersProps {
  results: FlightResult[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export function getDefaultFilters(results: FlightResult[]): FilterState {
  return {
    stops: [],
    airlines: [],
    maxPrice: results.length ? Math.max(...results.map((r) => r.totalPrice)) : 10000,
    timeOfDay: [],
  };
}

function parseDuration(dur: string): number {
  const hMatch = dur.match(/(\d+)h/);
  const mMatch = dur.match(/(\d+)m/);
  return (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
}

export function applyFiltersAndSort(
  results: FlightResult[],
  filters: FilterState,
  sortBy: SortBy
): FlightResult[] {
  let filtered = [...results];

  if (filters.stops.length > 0) {
    filtered = filtered.filter((f) => filters.stops.includes(f.stops));
  }
  if (filters.airlines.length > 0) {
    filtered = filtered.filter((f) => filters.airlines.includes(f.airlineCode));
  }
  if (filters.maxPrice < Math.max(...results.map((r) => r.totalPrice))) {
    filtered = filtered.filter((f) => f.totalPrice <= filters.maxPrice);
  }
  if (filters.timeOfDay.length > 0) {
    filtered = filtered.filter((f) => filters.timeOfDay.includes(getTimeOfDay(f.outbound.departTime)));
  }

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.totalPrice - b.totalPrice;
      case 'duration':
        return parseDuration(a.outbound.duration) - parseDuration(b.outbound.duration);
      case 'departure':
        return new Date(a.outbound.departTime).getTime() - new Date(b.outbound.departTime).getTime();
      case 'arrival':
        return new Date(a.outbound.arriveTime).getTime() - new Date(b.outbound.arriveTime).getTime();
      default:
        return 0;
    }
  });

  return filtered;
}

export default function Filters({ results, filters, onFilterChange, sortBy, onSortChange }: FiltersProps) {
  const uniqueStops = useMemo(() => [...new Set(results.map((r) => r.stops))].sort(), [results]);
  const uniqueAirlines = useMemo(
    () =>
      [...new Map(results.map((r) => [r.airlineCode, r.airline])).entries()].sort((a, b) =>
        a[1].localeCompare(b[1])
      ),
    [results]
  );
  const priceRange = useMemo(() => {
    if (!results.length) return { min: 0, max: 10000 };
    return {
      min: Math.min(...results.map((r) => r.totalPrice)),
      max: Math.max(...results.map((r) => r.totalPrice)),
    };
  }, [results]);

  const toggleArrayFilter = <K extends 'stops' | 'airlines' | 'timeOfDay'>(
    key: K,
    value: FilterState[K][number]
  ) => {
    const arr = filters[key] as FilterState[K][number][];
    const updated = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const clearAll = () => {
    onFilterChange(getDefaultFilters(results));
  };

  const timeSlots = [
    { key: 'morning', label: 'Morning (5-12)' },
    { key: 'afternoon', label: 'Afternoon (12-17)' },
    { key: 'evening', label: 'Evening (17-21)' },
    { key: 'night', label: 'Night (21-5)' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap gap-6 items-start">
        {/* Stops */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Stops</h4>
          <div className="space-y-1">
            {uniqueStops.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.stops.includes(s)}
                  onChange={() => toggleArrayFilter('stops', s)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {s === 0 ? 'Nonstop' : s === 1 ? '1 Stop' : `${s}+ Stops`}
              </label>
            ))}
          </div>
        </div>

        {/* Airlines */}
        {uniqueAirlines.length > 1 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Airlines</h4>
            <div className="space-y-1 max-h-32 overflow-auto">
              {uniqueAirlines.map(([code, name]) => (
                <label key={code} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(code)}
                    onChange={() => toggleArrayFilter('airlines', code)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div className="min-w-[180px]">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Max Price: {formatPrice(filters.maxPrice)}
          </h4>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatPrice(priceRange.min)}</span>
            <span>{formatPrice(priceRange.max)}</span>
          </div>
        </div>

        {/* Time of Day */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Departure Time</h4>
          <div className="space-y-1">
            {timeSlots.map((slot) => (
              <label key={slot.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.timeOfDay.includes(slot.key)}
                  onChange={() => toggleArrayFilter('timeOfDay', slot.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {slot.label}
              </label>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sort By</h4>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="price">Price</option>
            <option value="duration">Duration</option>
            <option value="departure">Departure Time</option>
            <option value="arrival">Arrival Time</option>
          </select>
        </div>

        {/* Clear */}
        <div className="self-end">
          <button
            onClick={clearAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  );
}
