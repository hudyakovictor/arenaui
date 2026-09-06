import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass mx-auto mt-16 max-w-lg rounded-3xl p-10 text-center">
      <p className="font-mono text-6xl font-black text-primary">404</p>
      <h1 className="mt-3 text-xl font-bold">Такого прогона нет</h1>
      <p className="mt-2 text-sm text-muted">Возможно, он был удалён или ссылка устарела.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-primary/20 px-5 py-2.5 text-sm font-semibold text-[#c4b5ff] ring-1 ring-primary/50 transition hover:bg-primary/30">
        ← Вернуться к прогонам
      </Link>
    </div>
  );
}
