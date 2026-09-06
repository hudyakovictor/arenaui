import { useEffect, useMemo, useState } from 'react';
import type { StageDef } from '../theme/stages';
import { buildEncounter, type AnswerDef, type CardDef, type SourceId } from '../data/encounter';
import { Browser } from '../components/Browser';
import { TopBar, TaskLine, EvidenceDock } from '../components/Layers';
import { AnswerList, CardRail, ConfidenceRow, PrimaryAction, VerdictRow, type Confidence } from '../components/Decision';
import { ResultSheet, type ResultData } from '../components/Overlays';

export interface PlayerState {
  level: number;
  xp: number;
  sig: number;
  budget: number;
  streak: number;
}

interface Props {
  stage: StageDef;
  player: PlayerState;
  round: number;
  onOpenStats: () => void;
  onResult: (r: ResultData) => void;
  onNext: () => void;
}

export function ArenaScreen({ stage, player, round, onOpenStats, onResult, onNext }: Props) {
  const st = stage.structure;
  const encounter = useMemo(() => buildEncounter(stage), [stage, round]);

  const [tab, setTab] = useState<SourceId>('chart');
  const [evidence, setEvidence] = useState<Set<string>>(new Set());
  const [blindOpened, setBlindOpened] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'A' | 'B' | null>(null);
  const [answer, setAnswer] = useState<AnswerDef['id'] | null>(null);
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [shake, setShake] = useState(false);

  // сброс при новой встрече
  useEffect(() => {
    setTab('chart');
    setEvidence(new Set());
    setBlindOpened(false);
    setActiveCard(null);
    setStack([]);
    setVerdict(null);
    setAnswer(null);
    setConfidence(null);
    setResult(null);
  }, [encounter]);

  const evidenceReady = evidence.size >= st.evidenceRequired;
  const stackReady = st.stackSlots === 0 || stack.length >= st.stackSlots;
  const verdictReady = !st.verdict || verdict !== null;
  const confidenceReady = !st.confidence || confidence !== null;
  const allReady = evidenceReady && answer !== null && stackReady && verdictReady && confidenceReady;

  const step: 1 | 2 | 3 = !evidenceReady ? 1 : answer === null ? 2 : 3;

  const toggleEvidence = (id: string) => {
    setEvidence((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        // в первой стадийе — только одна улика, заменяем
        if (st.evidenceRequired === 1 && st.stepper) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const pickCard = (c: CardDef) => {
    if (st.stackSlots > 0) {
      setStack((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : prev.length < st.stackSlots ? [...prev, c.id] : prev));
    } else {
      setActiveCard((prev) => (prev === c.id ? null : c.id));
    }
  };

  const ctaLabel = !evidenceReady
    ? `Найди улику в браузере (${evidence.size}/${st.evidenceRequired})`
    : st.stackSlots > 0 && !stackReady
      ? `Собери план (${stack.length}/${st.stackSlots})`
      : st.verdict && !verdict
        ? 'Выбери, что доминирует'
        : answer === null
          ? 'Выбери ответ'
          : st.confidence && !confidence
            ? 'Укажи уверенность'
            : 'Подтвердить решение';

  const ctaHint = !evidenceReady && stage.index === 1 ? 'Без улики ответ считается угадыванием' : allReady && st.confidence ? `Цена ошибки: −${Math.round(12 * (confidence === 'high' ? 1.6 : confidence === 'low' ? 0.6 : 1))} бюджета` : undefined;

  const submit = () => {
    if (!allReady) {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      // ведём к нужному шагу
      if (!evidenceReady) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const correct = answer === encounter.correct && (!encounter.verdict || verdict === encounter.verdict.correct) && (st.stackSlots === 0 || stack.every((id, i) => encounter.stackOrder[i] === id));
    const hasCorrectEvidence = [...evidence].filter((id) => encounter.evidence.find((z) => z.id === id)?.isCorrect).length >= st.evidenceRequired;
    const justified = hasCorrectEvidence;
    const mul = confidence === 'high' ? 1.6 : confidence === 'low' ? 0.6 : 1;
    const r: ResultData = {
      correct,
      justified,
      xp: correct ? (justified ? Math.round(24 * mul) : 8) : 0,
      sig: correct ? (justified ? 6 : 2) : 0,
      budgetDelta: correct ? (justified ? 6 : 0) : -Math.round(12 * mul),
      chosen: answer!,
    };
    setResult(r);
    onResult(r);
  };

  return (
    <div className="relative flex min-h-full flex-col">
      <TopBar stage={stage} level={player.level} budget={player.budget} xp={player.xp} sig={player.sig} streak={player.streak} weather={encounter.weather} onOpenStats={onOpenStats} />
      <TaskLine encounter={encounter} stage={stage} step={step} />

      <div className="px-4 pt-3">
        <Browser encounter={encounter} stage={stage} activeTab={tab} selected={evidence} blindOpened={blindOpened} locked={!!result} onTab={setTab} onToggleEvidence={toggleEvidence} onOpenBlind={() => setBlindOpened(true)} />
      </div>

      <div className={shake ? 'animate-[shake_.35s_ease-in-out]' : ''}>
        <EvidenceDock encounter={encounter} stage={stage} selected={evidence} onRemove={toggleEvidence} />
      </div>

      {/* Порядок блоков по стадиям: в I карты идут после улик как подсказка,
          в III–IV карты — это план (стек), поэтому стоят перед ответом. */}
      <CardRail encounter={encounter} stage={stage} active={activeCard} stack={stack} onPick={pickCard} />

      {st.verdict && <VerdictRow encounter={encounter} value={verdict} onPick={setVerdict} />}

      <AnswerList encounter={encounter} stage={stage} selected={evidence} evidence={evidence} value={answer} onPick={(a) => setAnswer(a.id)} disabled={st.stepper && !evidenceReady} />

      {st.confidence && answer !== null && <ConfidenceRow value={confidence} onPick={setConfidence} />}

      <div className="pb-4">
        <PrimaryAction label={ctaLabel} hint={ctaHint} ready={allReady} onClick={submit} />
      </div>

      {result && <ResultSheet encounter={encounter} stage={stage} result={result} onNext={onNext} />}
    </div>
  );
}
