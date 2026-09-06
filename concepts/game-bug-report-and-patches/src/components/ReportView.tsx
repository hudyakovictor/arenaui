import { REPORT_TEXT } from '../data/report';
import { CopyButton } from './DiffView';

export default function ReportView() {
  const chars = REPORT_TEXT.length;
  const download = () => {
    const blob = new Blob([REPORT_TEXT], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'arena20-bug-report.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/70 bg-[#0C1323] p-3">
        <div className="font-mono text-[11px] text-slate-400">
          Текстовый отчёт · <span className="text-slate-200">{chars.toLocaleString('ru-RU')}</span> символов · plain text
        </div>
        <div className="flex gap-2">
          <CopyButton text={REPORT_TEXT} label="Копировать отчёт" />
          <button
            onClick={download}
            className="rounded border border-emerald-400/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/10"
          >
            ↓ скачать .txt
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-700/70 bg-[#060A12] p-5 font-mono text-[12px] leading-[1.6] text-slate-300">
        {REPORT_TEXT}
      </pre>
    </div>
  );
}
