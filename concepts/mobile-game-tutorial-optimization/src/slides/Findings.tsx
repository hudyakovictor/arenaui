import { useState } from "react";
import { Card, Chip, Code, Eyebrow, Lead, SeverityBadge, Title } from "../components/ui";
import { MiniBar } from "../components/charts";
import { categories, findings, effortLabel, type Finding } from "../data/audit";
import { cn } from "../utils/cn";

function FindingCard({ f, open, onToggle }: { f: Finding; open: boolean; onToggle: () => void }) {
  const cat = categories.find((c) => c.id === f.cat)!;
  return (
    <Card className="transition-colors hover:border-strong">
      <button onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        <span className="font-mono text-[12px] text-muted mt-1 w-10 shrink-0">{f.id}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge s={f.severity} />
            <Chip>{cat.short}</Chip>
            <Chip tone="good">+{f.gain} б.</Chip>
            <Chip>{effortLabel(f.effort)}</Chip>
            <Chip tone="accent">спринт {f.sprint}</Chip>
          </div>
          <div className="mt-2 text-[15px] font-semibold leading-snug">{f.title}</div>
        </div>
        <span className={cn("mt-1 text-muted transition-transform", open && "rotate-180")}>⌄</span>
      </button>
      {open && (
        <div className="anim-in mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-bad">Доказательство</div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-sub">{f.evidence}</p>
            {f.code && <Code>{f.code}</Code>}
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-good">Исправление</div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-text">{f.fix}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export function TopFindingsSlide() {
  const top = [...findings].sort((a, b) => b.gain - a.gain).slice(0, 10);
  const [open, setOpen] = useState<string | null>(top[0].id);
  return (
    <div>
      <Eyebrow>Находки</Eyebrow>
      <Title className="mt-2">Топ-10 по возврату баллов</Title>
      <Lead className="mt-3">
        Десять исправлений возвращают {top.reduce((s, f) => s + f.gain, 0).toFixed(1)} балла из 74 недостающих. Нажмите на строку — увидите
        цитату из кода и конкретное решение.
      </Lead>
      <div className="mt-6 space-y-2.5">
        {top.map((f) => (
          <FindingCard key={f.id} f={f} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} />
        ))}
      </div>
    </div>
  );
}

export function ExplorerSlide() {
  const [cat, setCat] = useState(categories[0].id);
  const [open, setOpen] = useState<string | null>(null);
  const c = categories.find((x) => x.id === cat)!;
  const list = findings.filter((f) => f.cat === cat);
  const gain = list.reduce((s, f) => s + f.gain, 0);
  return (
    <div>
      <Eyebrow>Находки</Eyebrow>
      <Title className="mt-2">Все 30 находок по 12 категориям</Title>
      <Lead className="mt-3">Выберите категорию слева. Для каждой — текущий балл, вклад в общую оценку и полный список того, что нужно исправить.</Lead>
      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {categories.map((x) => {
            const n = findings.filter((f) => f.cat === x.id).length;
            return (
              <button
                key={x.id}
                onClick={() => {
                  setCat(x.id);
                  setOpen(null);
                }}
                className={cn(
                  "min-h-11 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  x.id === cat ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-strong",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium">
                    <span className="mr-2 font-mono text-muted">{x.icon}</span>
                    {x.short}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{n}</span>
                </div>
                <div className="mt-2">
                  <MiniBar value={x.now} color={x.now < 30 ? "#ff596d" : x.now < 60 ? "#ffb341" : "#3bde8a"} />
                </div>
              </button>
            );
          })}
        </div>
        <div>
          <Card className="anim-in mb-3" key={cat}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Категория</div>
                <div className="text-lg font-semibold">{c.name}</div>
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Вес</div>
                <div className="font-mono text-lg">{c.factors} факторов</div>
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Балл</div>
                <div className="font-mono text-lg">
                  <span className="text-bad">{c.now}</span> <span className="text-muted">→</span> <span className="text-good">{c.target}</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Вернём в общий счёт</div>
                <div className="font-mono text-lg text-good">+{gain.toFixed(1)}</div>
              </div>
            </div>
          </Card>
          <div className="space-y-2.5">
            {list.map((f) => (
              <FindingCard key={f.id} f={f} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
