export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Загрузка">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="skeleton h-64 rounded-3xl" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
      <div className="skeleton h-40 rounded-3xl" />
      <div className="skeleton h-72 rounded-3xl" />
    </div>
  );
}
