import { useState, useEffect } from 'react';
import type { SearchParams } from '../types';
import AirportInput from './AirportInput';

interface SearchPanelProps {
  params: SearchParams;
  loading: boolean;
  onSearch: (params: SearchParams) => void;
  onParamsChange: (params: SearchParams) => void;
}

export default function SearchPanel({ params, loading, onSearch, onParamsChange }: SearchPanelProps) {
  const [localParams, setLocalParams] = useState<SearchParams>(params);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  const update = (partial: Partial<SearchParams>) => {
    const updated = { ...localParams, ...partial };
    setLocalParams(updated);
    onParamsChange(updated);
  };

  const swapAirports = () => {
    update({ origin: localParams.destination, destination: localParams.origin });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!localParams.origin) {
      setValidationError('Please select an origin airport.');
      return;
    }
    if (!localParams.destination) {
      setValidationError('Please select a destination airport.');
      return;
    }
    if (!localParams.departureDate) {
      setValidationError('Please select a departure date.');
      return;
    }

    onSearch(localParams);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-6 mb-6"
    >
      <div className="flex flex-wrap gap-4 items-end">
        {/* Origin */}
        <AirportInput
          value={localParams.origin}
          onChange={(iata) => update({ origin: iata })}
          label="From"
          placeholder="Origin city or airport"
        />

        {/* Swap Button */}
        <button
          type="button"
          onClick={swapAirports}
          className="flex items-center justify-center w-10 h-10 mb-0.5 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors self-end"
          title="Swap origin and destination"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Destination */}
        <AirportInput
          value={localParams.destination}
          onChange={(iata) => update({ destination: iata })}
          label="To"
          placeholder="Destination city or airport"
        />

        {/* Departure Date */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">Departure</label>
          <input
            type="date"
            value={localParams.departureDate}
            onChange={(e) => update({ departureDate: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>

        {/* Return Date */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">Return (optional)</label>
          <input
            type="date"
            value={localParams.returnDate || ''}
            onChange={(e) => update({ returnDate: e.target.value || undefined })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>

        {/* Passengers */}
        <div className="min-w-[100px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">Passengers</label>
          <input
            type="number"
            min={1}
            max={9}
            value={localParams.passengers}
            onChange={(e) => update({ passengers: Math.max(1, Math.min(9, Number(e.target.value))) })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>

        {/* Cabin Class */}
        <div className="min-w-[160px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">Cabin Class</label>
          <select
            value={localParams.cabinClass}
            onChange={(e) => update({ cabinClass: e.target.value as SearchParams['cabinClass'] })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
      </div>

      {/* Bottom row: flexible dates + search button */}
      <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={localParams.flexibleDates}
            onChange={(e) => update({ flexibleDates: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Flexible dates</span>
        </label>

        <div className="flex items-center gap-3">
          {validationError && (
            <span className="text-sm text-red-500">{validationError}</span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Search Flights
          </button>
        </div>
      </div>
    </form>
  );
}
