import { useMemo } from 'react';
import type { FlightResult } from '../types';
import { formatPrice } from '../utils/format';

interface DateGridProps {
  results: FlightResult[];
  onSelectDates: (departureDate: string, returnDate?: string) => void;
  selectedDeparture?: string;
  selectedReturn?: string;
  isRoundTrip: boolean;
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

function interpolateColor(ratio: number): string {
  // Green (cheapest) -> Yellow -> Red (most expensive)
  if (ratio <= 0.5) {
    const r = Math.round(ratio * 2 * 255);
    return `rgb(${r}, 200, 80)`;
  }
  const g = Math.round((1 - (ratio - 0.5) * 2) * 200);
  return `rgb(255, ${g}, 80)`;
}

export default function DateGrid({ results, onSelectDates, selectedDeparture, selectedReturn, isRoundTrip }: DateGridProps) {
  const { departureDates, returnDates, priceMap, minPrice, maxPrice, bestCell } = useMemo(() => {
    const depSet = new Set<string>();
    const retSet = new Set<string>();
    const map = new Map<string, number>();
    let min = Infinity;
    let max = -Infinity;
    let best = { dep: '', ret: '', price: Infinity };

    for (const r of results) {
      depSet.add(r.departureDate);
      if (r.returnDate) retSet.add(r.returnDate);

      const key = isRoundTrip ? `${r.departureDate}|${r.returnDate}` : r.departureDate;
      const existing = map.get(key);
      if (!existing || r.totalPrice < existing) {
        map.set(key, r.totalPrice);
      }

      const price = map.get(key)!;
      if (price < min) min = price;
      if (price > max) max = price;
      if (price < best.price) {
        best = { dep: r.departureDate, ret: r.returnDate || '', price };
      }
    }

    return {
      departureDates: [...depSet].sort(),
      returnDates: [...retSet].sort(),
      priceMap: map,
      minPrice: min,
      maxPrice: max,
      bestCell: best,
    };
  }, [results, isRoundTrip]);

  const priceRange = maxPrice - minPrice || 1;

  if (isRoundTrip && returnDates.length > 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Fare Grid (Departure vs. Return)</h3>
        <table className="w-auto border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs text-gray-500 text-left">Dep \ Ret</th>
              {returnDates.map((rd) => (
                <th key={rd} className="p-2 text-xs text-gray-500 whitespace-nowrap">{shortDate(rd)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departureDates.map((dd) => (
              <tr key={dd}>
                <td className="p-2 text-xs text-gray-600 font-medium whitespace-nowrap">{shortDate(dd)}</td>
                {returnDates.map((rd) => {
                  const key = `${dd}|${rd}`;
                  const price = priceMap.get(key);
                  const isSelected = selectedDeparture === dd && selectedReturn === rd;
                  const isBest = bestCell.dep === dd && bestCell.ret === rd;

                  if (price === undefined) {
                    return (
                      <td key={rd} className="p-1">
                        <div className="w-20 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-300">
                          --
                        </div>
                      </td>
                    );
                  }

                  const ratio = (price - minPrice) / priceRange;
                  return (
                    <td key={rd} className="p-1">
                      <button
                        onClick={() => onSelectDates(dd, rd)}
                        className={`w-20 h-12 rounded text-xs font-medium flex flex-col items-center justify-center transition-all hover:scale-105 ${
                          isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: interpolateColor(ratio), color: ratio > 0.6 ? '#fff' : '#1a1a1a' }}
                      >
                        {isBest && <span className="text-[10px] font-bold">Best</span>}
                        {formatPrice(price)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // One-way: horizontal bar
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Fares by Date</h3>
      <div className="flex gap-2">
        {departureDates.map((dd) => {
          const price = priceMap.get(dd);
          if (price === undefined) return null;

          const ratio = (price - minPrice) / priceRange;
          const isSelected = selectedDeparture === dd;
          const isBest = bestCell.dep === dd;

          return (
            <button
              key={dd}
              onClick={() => onSelectDates(dd)}
              className={`flex flex-col items-center px-4 py-3 rounded-lg text-xs font-medium transition-all hover:scale-105 min-w-[80px] ${
                isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''
              }`}
              style={{ backgroundColor: interpolateColor(ratio), color: ratio > 0.6 ? '#fff' : '#1a1a1a' }}
            >
              <span className="whitespace-nowrap">{shortDate(dd)}</span>
              <span className="font-bold mt-1">{formatPrice(price)}</span>
              {isBest && <span className="text-[10px] font-bold mt-0.5">Best fare</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
