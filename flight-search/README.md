# Flight Fare Search

A full-stack flight fare search tool built with React (Vite + TypeScript) and Node.js/Express. Search and compare flight fares from major US airlines using the Amadeus API, with a clean Google Flights-inspired interface.

## Features

- Search flights by origin, destination, dates, passengers, and cabin class
- Airport autocomplete for major US airports
- Flexible dates mode: search +/- 3 days around your selected dates
- Date grid/heatmap view to compare prices across date combinations
- Filter by stops, airlines, price range, and departure time
- Sort by price, duration, departure time, or arrival time
- Responsive design — works on desktop and mobile
- Persistent search params (survives page refresh)

## Getting Started

### 1. Register for Amadeus API Test Credentials

1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Click **Register** and create a free account
3. After logging in, go to **My Self-Service Workspace**
4. Click **Create New App**
5. Give your app a name (e.g., "Flight Search")
6. Copy your **API Key** and **API Secret**

> **Note:** Test/sandbox credentials return simulated but realistic fare data. To get live data, you can later switch to production credentials with no code changes — just update the API base URL from `test.api.amadeus.com` to `api.amadeus.com`.

### 2. Configure Environment

```bash
cd flight-search
cp .env.example .env
```

Edit `.env` and paste your Amadeus credentials:

```
AMADEUS_API_KEY=your_actual_api_key
AMADEUS_API_SECRET=your_actual_api_secret
```

### 3. Install Dependencies

```bash
npm run install:all
```

This installs dependencies for the root, server, and client.

### 4. Start Development

```bash
npm run dev
```

This starts both the Express server (port 3001) and Vite dev server (port 5173) concurrently.

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
flight-search/
├── client/                  # Vite React app
│   └── src/
│       ├── components/      # React components
│       │   ├── AirportInput.tsx
│       │   ├── SearchPanel.tsx
│       │   ├── FlightCard.tsx
│       │   ├── Filters.tsx
│       │   ├── DateGrid.tsx
│       │   ├── ResultsView.tsx
│       │   └── SkeletonCard.tsx
│       ├── hooks/           # Custom React hooks
│       │   ├── useFlightSearch.ts
│       │   └── useAirportSearch.ts
│       ├── types/           # TypeScript type definitions
│       ├── utils/           # API client and formatting helpers
│       ├── App.tsx
│       └── main.tsx
├── server/                  # Express backend
│   └── src/
│       ├── routes/          # API route handlers
│       │   ├── search.ts
│       │   └── airports.ts
│       ├── services/        # Business logic
│       │   ├── amadeus.ts   # Amadeus API client with OAuth
│       │   └── airports.ts  # Static airport data + search
│       ├── types/           # Shared TypeScript types
│       └── index.ts         # Express server entry point
├── .env.example
├── package.json             # Root package with concurrently
└── README.md
```

## API Endpoints

### `POST /api/search`

Search for flights. Request body:

```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-06-15",
  "returnDate": "2025-06-22",
  "passengers": 1,
  "cabinClass": "ECONOMY",
  "flexibleDates": false
}
```

### `GET /api/airports?q=new`

Search airports by IATA code, city, or name. Returns up to 10 matches.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **API:** Amadeus Self-Service Flight Offers Search v2
- **Dev tooling:** concurrently, tsx (for server hot reload)

## Notes

- The Amadeus test environment returns simulated fare data — prices and availability are realistic but not live
- No user authentication is required — this is a personal search tool
- No booking functionality — results include links to airline/Google Flights for booking
- Airport autocomplete uses a bundled static list (no external API dependency)
