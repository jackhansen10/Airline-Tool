import { SearchParams, FlightResult, LegDetail, SegmentDetail } from '../types';

const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

const CARRIER_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  B6: 'JetBlue Airways',
  AS: 'Alaska Airlines',
  NK: 'Spirit Airlines',
  F9: 'Frontier Airlines',
  G4: 'Allegiant Air',
  HA: 'Hawaiian Airlines',
  SY: 'Sun Country Airlines',
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;

  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? `${match[2]}m` : '';

  return [hours, minutes].filter(Boolean).join(' ');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateDateCombos(
  departureDate: string,
  returnDate?: string
): Array<{ dep: string; ret?: string }> {
  const combos: Array<{ dep: string; ret?: string }> = [];
  const depBase = new Date(departureDate);

  for (let dOffset = -3; dOffset <= 3; dOffset++) {
    const dep = new Date(depBase);
    dep.setDate(dep.getDate() + dOffset);
    const depStr = dep.toISOString().split('T')[0];

    if (!returnDate) {
      combos.push({ dep: depStr });
    } else {
      const retBase = new Date(returnDate);
      for (let rOffset = -3; rOffset <= 3; rOffset++) {
        const ret = new Date(retBase);
        ret.setDate(ret.getDate() + rOffset);
        const retStr = ret.toISOString().split('T')[0];

        // Return date must be on or after departure date
        if (ret >= dep) {
          combos.push({ dep: depStr, ret: retStr });
        }
      }
    }
  }

  return combos;
}

async function getToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt > now + 60_000) {
    return cachedToken;
  }

  const clientId = process.env.AMADEUS_API_KEY;
  const clientSecret = process.env.AMADEUS_API_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('AMADEUS_API_KEY and AMADEUS_API_SECRET must be set in .env');
  }

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Amadeus auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return cachedToken!;
}

function buildGoogleFlightsUrl(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
): string {
  try {
    const base = 'https://www.google.com/travel/flights';
    const params = new URLSearchParams();
    params.set('q', `flights from ${origin} to ${destination}`);
    params.set('d', departureDate);
    if (returnDate) {
      params.set('r', returnDate);
    }
    return `${base}?${params.toString()}`;
  } catch {
    return '#';
  }
}

function normalizeResponse(
  data: any[],
  origin: string,
  destination: string
): FlightResult[] {
  const results: FlightResult[] = [];

  for (const offer of data) {
    try {
      const itineraries = offer.itineraries || [];
      const outboundItinerary = itineraries[0];
      if (!outboundItinerary) continue;

      const outbound = parseLeg(outboundItinerary);
      let inbound: LegDetail | undefined;

      if (itineraries[1]) {
        inbound = parseLeg(itineraries[1]);
      }

      const totalPrice = parseFloat(offer.price?.total || '0');
      const currency = offer.price?.currency || 'USD';
      const travelerCount = offer.travelerPricings?.length || 1;
      const pricePerPerson = totalPrice / travelerCount;

      const cabin =
        offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY';

      const outboundSegments = outboundItinerary.segments || [];
      const stops = outboundSegments.length - 1;

      const mainCarrierCode = outboundSegments[0]?.carrierCode || '';
      const airline = CARRIER_NAMES[mainCarrierCode] || mainCarrierCode;

      const departureDate = outbound.departTime.split('T')[0];
      const returnDate = inbound?.departTime.split('T')[0];

      const result: FlightResult = {
        id: offer.id || `${mainCarrierCode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        airline,
        airlineCode: mainCarrierCode,
        departureDate,
        returnDate,
        outbound,
        inbound,
        stops,
        totalPrice,
        currency,
        pricePerPerson: Math.round(pricePerPerson * 100) / 100,
        cabin,
        bookingUrl: buildGoogleFlightsUrl(origin, destination, departureDate, returnDate),
        seatsRemaining: offer.numberOfBookableSeats,
      };

      results.push(result);
    } catch (err) {
      console.error('Error normalizing flight offer:', err);
    }
  }

  return results;
}

function parseLeg(itinerary: any): LegDetail {
  const segments: SegmentDetail[] = (itinerary.segments || []).map(
    (seg: any): SegmentDetail => ({
      carrier: CARRIER_NAMES[seg.carrierCode] || seg.carrierCode || '',
      flightNumber: `${seg.carrierCode || ''}${seg.number || ''}`,
      from: seg.departure?.iataCode || '',
      to: seg.arrival?.iataCode || '',
      departTime: seg.departure?.at || '',
      arriveTime: seg.arrival?.at || '',
      duration: parseIsoDuration(seg.duration || ''),
      aircraft: seg.aircraft?.code,
    })
  );

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  return {
    departure: firstSegment?.from || '',
    arrival: lastSegment?.to || '',
    departTime: firstSegment?.departTime || '',
    arriveTime: lastSegment?.arriveTime || '',
    duration: parseIsoDuration(itinerary.duration || ''),
    segments,
  };
}

async function fetchFlightOffers(
  token: string,
  params: SearchParams,
  departureDate: string,
  returnDate?: string
): Promise<FlightResult[]> {
  const url = new URL(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`);
  url.searchParams.set('originLocationCode', params.origin);
  url.searchParams.set('destinationLocationCode', params.destination);
  url.searchParams.set('departureDate', departureDate);
  if (returnDate) {
    url.searchParams.set('returnDate', returnDate);
  }
  url.searchParams.set('adults', String(params.passengers));
  url.searchParams.set('travelClass', params.cabinClass);
  url.searchParams.set('max', '50');
  url.searchParams.set('currencyCode', 'USD');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Amadeus search failed (${response.status}): ${text}`);
    return [];
  }

  const json = (await response.json()) as { data?: any[] };
  return normalizeResponse(json.data || [], params.origin, params.destination);
}

export async function searchFlights(params: SearchParams): Promise<FlightResult[]> {
  const token = await getToken();

  if (!params.flexibleDates) {
    return fetchFlightOffers(token, params, params.departureDate, params.returnDate);
  }

  // Flexible dates: fan out requests
  const combos = generateDateCombos(params.departureDate, params.returnDate);

  // Deduplicate combos
  const seen = new Set<string>();
  const uniqueCombos = combos.filter((c) => {
    const key = `${c.dep}|${c.ret || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const promises: Promise<FlightResult[]>[] = [];

  for (let i = 0; i < uniqueCombos.length; i++) {
    const combo = uniqueCombos[i];

    // Add a small delay between requests to avoid rate limits
    if (i > 0) {
      await delay(200);
    }

    promises.push(
      fetchFlightOffers(token, params, combo.dep, combo.ret).catch((err) => {
        console.error(`Error fetching flights for ${combo.dep}/${combo.ret}:`, err);
        return [] as FlightResult[];
      })
    );
  }

  const settled = await Promise.allSettled(promises);

  const allResults: FlightResult[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    }
  }

  // Sort by total price ascending
  allResults.sort((a, b) => a.totalPrice - b.totalPrice);

  return allResults;
}
