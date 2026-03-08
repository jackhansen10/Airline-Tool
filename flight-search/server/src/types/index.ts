export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  flexibleDates: boolean;
}

export interface SegmentDetail {
  carrier: string;
  flightNumber: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  aircraft?: string;
}

export interface LegDetail {
  departure: string;
  arrival: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  segments: SegmentDetail[];
}

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  departureDate: string;
  returnDate?: string;
  outbound: LegDetail;
  inbound?: LegDetail;
  stops: number;
  totalPrice: number;
  currency: string;
  pricePerPerson: number;
  cabin: string;
  bookingUrl: string;
  seatsRemaining?: number;
}

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}
