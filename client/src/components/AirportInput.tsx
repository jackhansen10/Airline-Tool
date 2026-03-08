import { useState, useRef } from 'react';
import { useAirportSearch } from '../hooks/useAirportSearch';

interface AirportInputProps {
  value: string;
  onChange: (iata: string) => void;
  label: string;
  placeholder: string;
}

export default function AirportInput({ value, onChange, label, placeholder }: AirportInputProps) {
  const { setQuery, suggestions, loading } = useAirportSearch();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setQuery(val);
    setOpen(true);
    if (!val) {
      onChange('');
    }
  };

  const handleSelect = (iata: string, city: string) => {
    onChange(iata);
    setInputValue(`${iata} - ${city}`);
    setQuery('');
    setOpen(false);
  };

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    if (suggestions.length > 0) setOpen(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  return (
    <div className="relative flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
      />
      {value && (
        <span className="absolute right-3 top-[38px] text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {value}
        </span>
      )}
      {open && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400">Searching...</li>
          )}
          {suggestions.map((airport) => (
            <li
              key={airport.iata}
              onMouseDown={() => handleSelect(airport.iata, airport.city)}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <span className="font-bold text-blue-700 mr-2">{airport.iata}</span>
              <span className="text-gray-800">{airport.city}</span>
              <span className="text-gray-400 text-sm ml-1">- {airport.name}</span>
              <span className="text-gray-400 text-xs ml-1">({airport.country})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
