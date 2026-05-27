export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-10 w-32 bg-cf-surface rounded animate-pulse" />
        <div className="h-4 w-48 bg-cf-surface rounded animate-pulse" />
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="bg-cf-surface border border-cf-border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-[2.5/3.5] bg-cf-darker" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-cf-border rounded w-4/5" />
              <div className="h-3 bg-cf-border rounded w-3/5" />
              <div className="h-6 bg-cf-border rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
