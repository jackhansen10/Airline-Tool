export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 animate-pulse">
      <div className="flex flex-wrap items-center gap-4">
        {/* Airline logo placeholder */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="w-10 h-10 rounded bg-gray-200" />
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Time / route placeholder */}
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center">
            <div className="h-5 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-10 bg-gray-100 rounded mx-auto" />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-3 w-12 bg-gray-100 rounded mb-1" />
            <div className="h-px w-full bg-gray-200" />
            <div className="h-3 w-10 bg-gray-100 rounded mt-1" />
          </div>
          <div className="text-center">
            <div className="h-5 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-10 bg-gray-100 rounded mx-auto" />
          </div>
        </div>

        {/* Price placeholder */}
        <div className="text-right min-w-[100px] ml-auto">
          <div className="h-7 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-100 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}
