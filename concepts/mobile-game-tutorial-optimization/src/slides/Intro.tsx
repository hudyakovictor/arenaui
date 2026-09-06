import { ScoreRing, CategoryBars, Radar } from "../components/charts";
import { Card, Eyebrow, Lead, Stat, Title, Chip } from "../components/ui";
import { categories, findings, weightedScore, TOTAL_FACTORS, BASE_SCORE, TARGET_SCORE } from "../data/audit";

export function TitleSlide() {
  const crit = findings.filter((f) => f.severity === "critical").length;
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <div className="anim-in">
        <Eyebrow>Signal Arena · Proof of Skill · аудит клиента и сервера</Eyebrow>
      </div>
      <h1 className="anim-in delay-1 mt-4 font-display text-4xl font-bold leading-[1.05] md:text-7xl">
        От <span className="text-bad">25</span> к <span className="text-good">99</span>
        <br />
        <span className="text-sub text-2xl md:text-4xl font-medium">почему игра получила низкий балл — и что сделать за 8 недель</span>
      </h1>
      <div className="anim-in delay-2 mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Сейчас" value={`${BASE_SCORE} / 100`} tone="bad" />
        <Stat label="Цель" value={`${TARGET_SCORE} / 100`} tone="good" />
        <Stat label="Факторов в модели" value={String(TOTAL_FACTORS)} />
        <Stat label="Критичных находок" value={String(crit)} tone="warn" />
      </div>
      <div className="anim-in delay-3 mt-8 flex flex-wrap gap-2">
        <Chip tone="accent">github.com/hudyakovictor/arena20</Chip>
        <Chip>phaser/ · 12 сцен · Phaser 4.2</Chip>
        <Chip>backend/ · 36 роутов · SQLite</Chip>
        <Chip>tz.txt · стиль_тон.txt</Chip>
      </div>
      <p className="anim-in delay-4 mt-8 max-w-2xl text-sub leading-relaxed">
        Каждая находка ниже подтверждена конкретной строкой кода из репозитория. Оценка пересчитана по 12 категориям,
        сумма весов — 350 факторов. Справа от каждого исправления — сколько баллов оно возвращает.
      </p>
    </div>
  );
}

export function DiagnosisSlide() {
  const now = weightedScore("now");
  const target = weightedScore("target");
  return (
    <div>
      <Eyebrow>Диагноз</Eyebrow>
      <Title className="mt-2">Откуда взялись 25 баллов</Title>
      <Lead className="mt-3">
        Оценка — средневзвешенное по 12 категориям. Игру тянут вниз не «мелочи», а четыре системных провала: нечитаемый текст,
        нетапабельный интерфейс, язык спецификации на экране игрока и нулевое покрытие тестами.
      </Lead>
      <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="anim-in flex flex-row items-center gap-6 lg:flex-col">
          <ScoreRing value={now} label="сейчас" />
          <div className="text-3xl text-muted lg:rotate-90">→</div>
          <ScoreRing value={target} label="цель" />
        </div>
        <Card className="anim-in delay-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold">Категории × вес (факторов)</div>
            <div className="flex gap-3 font-mono text-[11px]">
              <span className="text-bad">● сейчас</span>
              <span className="text-good">● цель</span>
            </div>
          </div>
          <CategoryBars cats={categories} mode="both" />
        </Card>
      </div>
    </div>
  );
}

export function WhySlide() {
  const reasons = [
    {
      n: "01",
      t: "Игрок не может прочитать интерфейс",
      d: "Кегль 6–9px на холсте 390pt. Это меньше, чем мелкий шрифт в договоре. Все обучающие подсказки — а это ядро продукта — пролетают мимо.",
      tone: "#ff596d",
      pts: "−34 балла",
    },
    {
      n: "02",
      t: "Игрок не может попасть пальцем",
      d: "Строки улик 14px, вкладки 28px. Стандарт — 44–48. Каждое второе касание — промах, «сложность» игры становится сложностью её интерфейса.",
      tone: "#ffb341",
      pts: "−27 баллов",
    },
    {
      n: "03",
      t: "Игрок видит внутреннюю кухню",
      d: "«M3 СТАВКА УВЕРЕННОСТИ», «ТЗ Часть 3», «силуэт 5–8% rim», «LVL+8». Ощущение недоделанного прототипа, даже если механика работает.",
      tone: "#b98cff",
      pts: "−23 балла",
    },
    {
      n: "04",
      t: "Ничто не движется и ничто не проверено",
      d: "Ни одного tween при заявке «AAA-интерактив». Ни одного теста при заявке «детерминированный движок». Seed зависит от Date.now().",
      tone: "#59a7ff",
      pts: "−31 балл",
    },
  ];
  return (
    <div>
      <Eyebrow>Диагноз</Eyebrow>
      <Title className="mt-2">Четыре причины, которые объясняют 80% потерь</Title>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {reasons.map((r, i) => (
          <Card key={r.n} className={`anim-in delay-${i + 1}`} accent={r.tone}>
            <div className="flex items-start justify-between gap-3">
              <div className="font-mono text-3xl font-bold" style={{ color: r.tone }}>
                {r.n}
              </div>
              <Chip tone="bad">{r.pts}</Chip>
            </div>
            <div className="mt-3 text-lg font-semibold">{r.t}</div>
            <p className="mt-2 text-[15px] leading-relaxed text-sub">{r.d}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] items-center">
        <Card className="anim-in delay-5">
          <div className="font-semibold">Что важно понять</div>
          <p className="mt-2 text-[15px] leading-relaxed text-sub">
            Игровая логика (15 механик, 4 эпохи, 33 врага, скоринг, бюджет риска) — <span className="text-text">реализована</span>. Оценка
            низкая не потому, что мало сделано, а потому, что сделанное невозможно комфортно использовать и невозможно
            проверить. Это хорошая новость: большая часть баллов возвращается без переписывания механик.
          </p>
        </Card>
        <div className="anim-in delay-6 mx-auto">
          <Radar cats={categories} size={340} />
        </div>
      </div>
    </div>
  );
}
