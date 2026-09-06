"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="glass mx-auto mt-16 max-w-lg rounded-3xl p-10 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-3 text-xl font-bold">Что-то пошло не так</h1>
      <p className="mt-2 break-words font-mono text-xs text-muted">{error.message}</p>
      <button type="button" onClick={reset} className="mt-6 rounded-xl bg-primary/20 px-5 py-2.5 text-sm font-semibold text-[#c4b5ff] ring-1 ring-primary/50 transition hover:bg-primary/30">
        Повторить
      </button>
    </div>
  );
}
