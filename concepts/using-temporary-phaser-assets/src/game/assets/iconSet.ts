// SIGNAL ARENA — встроенный stroke-набор иконок 24×24 (ярус A «условное», ART_SPEC §4.1).
// Источник: Lucide Icons (https://lucide.dev), лицензия ISC — бесплатно, атрибуция не требуется.
// Иконки лежат в коде как SVG-строки → не зависят от файлов на диске → не бывает 404 / loaderror.
// Белый stroke + setTint() = перекраска в любой токен палитры.

export type IconGroup = 'nav' | 'domain' | 'action' | 'source' | 'status';

export interface IconDef {
  id: string;
  group: IconGroup;
  label: string;
  /** Внутренности <svg viewBox="0 0 24 24">. */
  body: string;
}

const I = (id: string, group: IconGroup, label: string, body: string): IconDef => ({ id, group, label, body });

export const ICONS: IconDef[] = [
  // Навигация (4)
  I('nav-academy', 'nav', 'Академия',
    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  I('nav-arena', 'nav', 'Арена',
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/>'),
  I('nav-collection', 'nav', 'Коллекция',
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
  I('nav-more', 'nav', 'Ещё',
    '<circle cx="12" cy="12" r="1.6" fill="#fff"/><circle cx="19" cy="12" r="1.6" fill="#fff"/><circle cx="5" cy="12" r="1.6" fill="#fff"/>'),

  // Домены (6)
  I('dom-technical', 'domain', 'Тех. анализ',
    '<path d="M9 5v4"/><rect width="4" height="6" x="7" y="9" rx="1"/><path d="M9 15v2"/><path d="M17 3v2"/><rect width="4" height="8" x="15" y="5" rx="1"/><path d="M17 13v3"/><path d="M3 3v18h18"/>'),
  I('dom-risk', 'domain', 'Риск и исполнение',
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>'),
  I('dom-context', 'domain', 'Контекст рынка',
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  I('dom-crypto', 'domain', 'Крипто-специфика',
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  I('dom-human', 'domain', 'Человек',
    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  I('dom-cognitive', 'domain', 'Когнитивные искажения',
    '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>'),

  // Действия (16)
  I('act-back', 'action', 'Назад', '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),
  I('act-close', 'action', 'Закрыть', '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  I('act-settings', 'action', 'Настройки',
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  I('act-search', 'action', 'Поиск', '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  I('act-lock', 'action', 'Закрыто', '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  I('act-unlock', 'action', 'Открыто', '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),
  I('act-check', 'action', 'Верно', '<path d="M20 6 9 17l-5-5"/>'),
  I('act-alert', 'action', 'Внимание',
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  I('act-chevron-right', 'action', 'Далее', '<path d="m9 18 6-6-6-6"/>'),
  I('act-chevron-down', 'action', 'Раскрыть', '<path d="m6 9 6 6 6-6"/>'),
  I('act-refresh', 'action', 'Обновить',
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'),
  I('act-plus', 'action', 'Добавить', '<path d="M5 12h14"/><path d="M12 5v14"/>'),
  I('act-coin', 'action', 'SIG',
    '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>'),
  I('act-flame', 'action', 'Серия',
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
  I('act-pause', 'action', 'Ждать', '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>'),
  I('act-clock', 'action', 'Время', '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),

  // Источники (8)
  I('src-chart', 'source', 'График', '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>'),
  I('src-news', 'source', 'Новости',
    '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>'),
  I('src-position', 'source', 'Позиция',
    '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>'),
  I('src-wallet', 'source', 'Кошелёк',
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
  I('src-tokenomics', 'source', 'Токеномика', '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>'),
  I('src-onchain', 'source', 'Он-чейн',
    '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>'),
  I('src-orderbook', 'source', 'Стакан',
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"/>'),
  I('src-sentiment', 'source', 'Настроения', '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),

  // Редкость / статус (6)
  I('rar-common', 'status', 'Обычная', '<circle cx="12" cy="12" r="8"/>'),
  I('rar-rare', 'status', 'Редкая', '<path d="M12 3l8 9-8 9-8-9z"/>'),
  I('rar-epic', 'status', 'Эпическая',
    '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'),
  I('enemy-unknown', 'status', 'Не опознан',
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'),
  I('enemy-revealed', 'status', 'Опознан',
    '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>'),
  I('enemy-defeated', 'status', 'Побеждён',
    '<path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>'),
];

export const ICON_BY_ID: Record<string, IconDef> = Object.fromEntries(ICONS.map((i) => [i.id, i]));

/** Полный SVG-документ: белый stroke, чтобы красить через setTint. */
export function iconSvg(def: IconDef, strokeWidth = 2): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ` +
    `stroke="#ffffff" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${def.body}</svg>`
  );
}

export function svgDataUri(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
