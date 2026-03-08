import { useState } from 'react';
import type { FlightResult, LegDetail } from '../types';
import { formatTime, formatDate, formatPrice, getStopsLabel } from '../utils/format';

interface FlightCardProps {
  flight: FlightResult;
}

function LegSummary({ leg, label }: { leg: LegDetail; label: string }) {
  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="text-center min-w-[80px]">
        <div className="text-lg font-bold text-gray-900">{formatTime(leg.departTime)}</div>
        <div className="text-xs text-gray-500">{leg.departure}</div>
      </div>

      <div className="flex flex-col items-center flex-1">
        <span className="text-xs text-gray-400 mb-0.5">{label}</span>
        <div className="flex items-center w-full">
          <div className="h-px bg-gray-300 flex-1" />
          <svg className="w-4 h-4 text-gray-400 -mx-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
          </svg>
        </div>
        <span className="text-xs text-gray-500">{leg.duration}</span>
      </div>

      <div className="text-center min-w-[80px]">
        <div className="text-lg font-bold text-gray-900">{formatTime(leg.arriveTime)}</div>
        <div className="text-xs text-gray-500">{leg.arrival}</div>
      </div>
    </div>
  );
}

function SegmentDetails({ leg }: { leg: LegDetail }) {
  return (
    <div className="space-y-3">
      {leg.segments.map((seg, i) => (
        <div key={i}>
          {i > 0 && (
            <div className="flex items-center gap-2 py-2 px-4 my-2 bg-amber-50 rounded text-sm text-amber-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Layover
            </div>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="min-w-[90px]">
              <span className="font-medium text-gray-700">{seg.carrier} {seg.flightNumber}</span>
              {seg.aircraft && <div className="text-xs text-gray-400">{seg.aircraft}</div>}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div>
                <div className="font-medium">{formatTime(seg.departTime)}</div>
                <div className="text-xs text-gray-500">{seg.from}</div>
              </div>
              <div className="h-px bg-gray-200 flex-1 mx-2" />
              <div className="text-xs text-gray-400">{seg.duration}</div>
              <div className="h-px bg-gray-200 flex-1 mx-2" />
              <div className="text-right">
                <div className="font-medium">{formatTime(seg.arriveTime)}</div>
                <div className="text-xs text-gray-500">{seg.to}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FlightCard({ flight }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow mb-3 overflow-hidden">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Airline logo */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <img
              src={`https://pics.avs.io/60/60/${flight.airlineCode}.png`}
              alt={flight.airline}
              className="w-10 h-10 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden w-10 h-10 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              {flight.airlineCode}
            </span>
            <div>
              <div className="font-medium text-gray-800 text-sm">{flight.airline}</div>
              <div className="text-xs text-gray-400">{formatDate(flight.departureDate)}</div>
            </div>
          </div>

          {/* Outbound leg */}
          <LegSummary leg={flight.outbound} label={getStopsLabel(flight.stops)} />

          {/* Inbound leg (round trip) */}
          {flight.inbound && (
            <>
              <div className="w-px h-12 bg-gray-200 hidden lg:block" />
              <LegSummary leg={flight.inbound} label={getStopsLabel(flight.stops)} />
            </>
          )}

          {/* Price */}
          <div className="text-right min-w-[100px] ml-auto">
            <div className="text-2xl font-bold text-blue-700">
              {formatPrice(flight.totalPrice, flight.currency)}
            </div>
            {flight.pricePerPerson !== flight.totalPrice && (
              <div className="text-xs text-gray-400">
                {formatPrice(flight.pricePerPerson, flight.currency)}/person
              </div>
            )}
            <div className="text-xs text-gray-400">{flight.cabin}</div>
            {flight.seatsRemaining !== undefined && flight.seatsRemaining < 5 && (
              <span className="inline-block mt-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {flight.seatsRemaining} seat{flight.seatsRemaining !== 1 ? 's' : ''} left
              </span>
            )}
          </div>

          {/* Expand indicator */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Outbound Flight</h4>
            <SegmentDetails leg={flight.outbound} />
          </div>
          {flight.inbound && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Return Flight</h4>
              <SegmentDetails leg={flight.inbound} />
            </div>
          )}
          <div className="flex justify-end">
            <a
              href={flight.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
