const block = "animate-pulse rounded-2xl bg-secondary";

export function StatsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando estatísticas">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`${block} h-28`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${block} h-72`} />
        <div className={`${block} h-72`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${block} h-64`} />
        <div className={`${block} h-64`} />
      </div>
      <div className={`${block} h-64`} />
    </div>
  );
}
