import { useState, useMemo, useEffect } from 'react';
import type { FlightResult } from '../types';
import { formatPrice } from '../utils/format';
import FlightCard from './FlightCard';
import Filters, { type FilterState, getDefaultFilters, applyFiltersAndSort } from './Filters';
import DateGrid from './DateGrid';
import SkeletonCard from './SkeletonCard';

interface ResultsViewProps {
  results: FlightResult[];
  loading: boolean;
  error: string | null;
  flexibleDates: boolean;
  onRetry: () => void;
}

type SortBy = 'price' | 'duration' | 'departure' | 'arrival';

export default function ResultsView({ results, loading, error, flexibleDates, onRetry }: ResultsViewProps) {
  const [filters, setFilters] = useState<FilterState>(() => getDefaultFilters(results));
  const [sortBy, setSortBy] = useState<SortBy>('price');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDeparture, setSelectedDeparture] = useState<string>();
  const [selectedReturn, setSelectedReturn] = useState<string>();

  // Reset filters when results change
  useEffect(() => {
    setFilters(getDefaultFilters(results));
    setSelectedDeparture(undefined);
    setSelectedReturn(undefined);
  }, [results]);

  const filteredResults = useMemo(() => {
    let base = results;
    if (selectedDeparture) {
      base = base.filter((r) => r.departureDate === selectedDeparture);
      if (selectedReturn) {
        base = base.filter((r) => r.returnDate === selectedReturn);
      }
    }
    return applyFiltersAndSort(base, filters, sortBy);
  }, [results, filters, sortBy, selectedDeparture, selectedReturn]);

  const bestFare = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((best, r) => (r.totalPrice < best.totalPrice ? r : best), results[0]);
  }, [results]);

  const isRoundTrip = results.some((r) => !!r.returnDate);

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Searching for flights...</span>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-red-700 font-medium mb-2">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state (no results and not loading)
  if (!results.length) {
    return null;
  }

  const handleDateSelect = (dep: string, ret?: string) => {
    if (selectedDeparture === dep && selectedReturn === ret) {
      setSelectedDeparture(undefined);
      setSelectedReturn(undefined);
    } else {
      setSelectedDeparture(dep);
      setSelectedReturn(ret);
    }
  };

  const activeFilterCount =
    (filters.stops.length > 0 ? 1 : 0) +
    (filters.airlines.length > 0 ? 1 : 0) +
    (filters.maxPrice < Math.max(...results.map((r) => r.totalPrice)) ? 1 : 0) +
    (filters.timeOfDay.length > 0 ? 1 : 0) +
    (selectedDeparture ? 1 : 0);

  return (
    <div>
      {/* Best fare banner */}
      {bestFare && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-3">
          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">Best Fare</span>
          <span className="text-sm text-green-800">
            {bestFare.airline} from {formatPrice(bestFare.totalPrice, bestFare.currency)} &mdash;{' '}
            {bestFare.outbound.departure} to {bestFare.outbound.arrival}
          </span>
        </div>
      )}

      {/* View toggle + results count */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredResults.length}</span> of{' '}
          <span className="font-medium">{results.length}</span> flights
          {activeFilterCount > 0 && (
            <span className="ml-2 text-blue-600">({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active)</span>
          )}
        </div>

        {flexibleDates && (
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Date Grid
            </button>
          </div>
        )}
      </div>

      {/* Date grid */}
      {viewMode === 'grid' && flexibleDates && (
        <DateGrid
          results={results}
          onSelectDates={handleDateSelect}
          selectedDeparture={selectedDeparture}
          selectedReturn={selectedReturn}
          isRoundTrip={isRoundTrip}
        />
      )}

      {/* Filters */}
      <Filters
        results={results}
        filters={filters}
        onFilterChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Flight cards */}
      {filteredResults.length > 0 ? (
        filteredResults.map((flight) => <FlightCard key={flight.id} flight={flight} />)
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No flights found.</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
