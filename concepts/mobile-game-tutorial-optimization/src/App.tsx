import { Deck, type SlideDef } from "./components/Deck";
import { TitleSlide, DiagnosisSlide, WhySlide } from "./slides/Intro";
import { TopFindingsSlide, ExplorerSlide } from "./slides/Findings";
import { TypographySlide, CopySlide, ArchitectureSlide, MotionSlide } from "./slides/Visual";
import { StackSlide, PerfSlide, BackendSlide } from "./slides/Tech";
import { RoadmapSlide, SimulatorSlide, DodSlide, FinalSlide } from "./slides/Plan";

const slides: SlideDef[] = [
  { id: "title", section: "Старт", title: "От 25 к 99", render: () => <TitleSlide /> },
  { id: "diag", section: "Диагноз", title: "Откуда 25 баллов", render: () => <DiagnosisSlide /> },
  { id: "why", section: "Диагноз", title: "Четыре главные причины", render: () => <WhySlide /> },
  { id: "top", section: "Находки", title: "Топ-10 по возврату баллов", render: () => <TopFindingsSlide /> },
  { id: "explorer", section: "Находки", title: "Все 30 находок по категориям", render: () => <ExplorerSlide /> },
  { id: "typo", section: "Исправления", title: "Читаемость и тач-зоны", render: () => <TypographySlide /> },
  { id: "copy", section: "Исправления", title: "Тексты и тон", render: () => <CopySlide /> },
  { id: "arch", section: "Исправления", title: "Архитектура клиента", render: () => <ArchitectureSlide /> },
  { id: "motion", section: "Исправления", title: "Анимации и отклик", render: () => <MotionSlide /> },
  { id: "stack", section: "Исправления", title: "Стек по ТЗ", render: () => <StackSlide /> },
  { id: "perf", section: "Исправления", title: "Производительность", render: () => <PerfSlide /> },
  { id: "back", section: "Исправления", title: "Backend и безопасность", render: () => <BackendSlide /> },
  { id: "roadmap", section: "План", title: "Дорожная карта: 4 спринта", render: () => <RoadmapSlide /> },
  { id: "sim", section: "План", title: "Симулятор оценки", render: () => <SimulatorSlide /> },
  { id: "dod", section: "План", title: "Definition of Done", render: () => <DodSlide /> },
  { id: "final", section: "Итог", title: "Резюме", render: () => <FinalSlide /> },
];

export default function App() {
  return <Deck slides={slides} />;
}
