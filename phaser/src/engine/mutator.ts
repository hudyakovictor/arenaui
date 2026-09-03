import type { EncounterInstance, EncounterTemplate } from '../types';
import { SeededRng, hashString } from './rng';

// Оси мутации — ТЗ Часть 6 §6.2
const TICKERS = ['BTC/USDT','ETH/USDT','SOL/USDT','AVAX/USDT','ARB/USDT'];
const TIMEFRAMES = ['5M','15M','1H','4H','1D'];
const ASSETS_SCALE: Record<string, number> = {
  'BTC/USDT': 68000, 'ETH/USDT': 3200, 'SOL/USDT': 145, 'AVAX/USDT': 32, 'ARB/USDT': 1.1
};

export function mutate(template: EncounterTemplate, seed: number): EncounterInstance {
  const rng = new SeededRng(seed ^ hashString(template.id));
  const isMirrored = rng.next() > 0.5; // лонг ↔ шорт
  const ticker = rng.pick(TICKERS);
  const timeframe = rng.pick(TIMEFRAMES);
  // вопрос — формулировка из пула
  const q0 = rng.pick(template.questionPool);
  const question = (isMirrored ? q0.replace('пробила','пробила (зеркально)').replace('рост','снижение') : q0);
  // порядок вариантов мутирует, но correct пересчитывается
  const order = rng.shuffle([0,1,2,3]);
  const mutatedAnswers = order.map(i=> template.answers[i]);
  const correctAnswer = order.indexOf(template.correct);
  // числа в уликах мутируют соотношением
  const mutatedEvidence = template.evidence.map(ev=>{
    // мутация чисел: объём, риск
    let label = ev.label;
    if(label.includes('2.1K')) label = label.replace('2.1K', `${(rng.int(12,38)/10).toFixed(1)}K`);
    if(label.includes('40%')) label = label.replace('40%', `${rng.int(30,55)}%`);
    // Денежные значения не меняем независимо от вопроса: иначе калькулятор
    // начинает противоречить условию. Числовой контекст должен мутировать атомарно.
    return { ...ev, label };
  });
  // в эпохах III–IV добавляется шум — лишний источник (не влияет на вердикт)
  return {
    ...template, seed, question, mutatedAnswers, correctAnswer, mutatedEvidence,
    ticker, timeframe, isMirrored
  };
}

export function nextSeed(base: number): number { return (base * 1664525 + 1013904223) >>> 0; }
