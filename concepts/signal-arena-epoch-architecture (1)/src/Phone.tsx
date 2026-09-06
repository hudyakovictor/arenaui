import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Рендерит содержимое 390×844 и масштабирует под ширину контейнера. */
export default function Phone({ children, maxWidth = 390 }: { children: ReactNode; maxWidth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.min(e.contentRect.width, maxWidth);
      setScale(w / 390);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxWidth]);

  return (
    <div ref={ref} className="w-full flex justify-center">
      <div style={{ width: 390 * scale, height: 844 * scale }} className="relative">
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[28px] ring-8 ring-neutral-900 shadow-2xl"
          style={{ transform: `scale(${scale})`, width: 390, height: 844 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
