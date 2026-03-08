import { useFlightSearch } from './hooks/useFlightSearch';
import SearchPanel from './components/SearchPanel';
import ResultsView from './components/ResultsView';

export default function App() {
  const { params, results, loading, error, search, setParams } = useFlightSearch();

  const showResults = results.length > 0 || loading || !!error;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          <h1 className="text-xl font-bold text-gray-800">Flight Fare Search</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <SearchPanel
          params={params}
          loading={loading}
          onSearch={search}
          onParamsChange={setParams}
        />

        {showResults && (
          <ResultsView
            results={results}
            loading={loading}
            error={error}
            flexibleDates={params.flexibleDates}
            onRetry={() => search(params)}
          />
        )}
      </main>
    </div>
  );
}
