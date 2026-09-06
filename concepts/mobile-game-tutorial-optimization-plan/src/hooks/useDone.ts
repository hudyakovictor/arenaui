import { useCallback, useEffect, useMemo, useState } from 'react';
import { factors, scoreFor } from '../data/factors';

const KEY = 'arena20_plan_done_v1';

export function useDone() {
  const [done, setDone] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...done]));
    } catch {
      /* ignore */
    }
  }, [done]);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setMany = useCallback((ids: string[], value: boolean) => {
    setDone((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (value ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  const reset = useCallback(() => setDone(new Set()), []);

  const score = useMemo(() => scoreFor(done), [done]);
  const total = factors.length;

  return { done, toggle, setMany, reset, score, total, count: done.size };
}
