import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import { Sheet, Toast } from "./components/ui";
import { Academy } from "./screens/Academy";
import { Arena } from "./screens/Arena";
import { Bestiary } from "./screens/Bestiary";
import { Market } from "./screens/Market";
import { Profile } from "./screens/Profile";
import { Splash } from "./screens/Splash";
import { Tournaments } from "./screens/Tournaments";
import { StoreProvider, useStore, type Tab } from "./store";

function Shell() {
  const { s, d } = useStore();
  const [tab, setTab] = useState<Tab>("arena");
  const [toast, setToast] = useState<string | null>(null);
  const [profile, setProfile] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const tm = useRef<number | undefined>(undefined);

  const say = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(tm.current);
    tm.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [tab]);

  if (!s.booted) return <div className="phone"><Splash onEnter={() => d({ type: "BOOT" })} /></div>;

  const go = (t: Tab) => setTab(t);

  return (
    <div className="phone noise flex flex-col">
      <TopBar onProfile={() => setProfile(true)} />
      <div ref={scroller} className="scroll-area flex-1">
        {tab === "arena" && <Arena toast={say} />}
        {tab === "academy" && <Academy onGoArena={() => go("arena")} toast={say} />}
        {tab === "bestiary" && <Bestiary onGoArena={() => go("arena")} />}
        {tab === "market" && <Market toast={say} />}
        {tab === "tournaments" && <Tournaments onGoArena={() => go("arena")} />}
      </div>
      <BottomNav tab={tab} onTab={go} />
      <Toast msg={toast} />
      <Sheet open={profile} onClose={() => setProfile(false)} title="Профиль">
        <Profile onClose={() => setProfile(false)} />
      </Sheet>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="app-bg min-h-dvh sm:flex sm:items-center sm:justify-center">
        <Shell />
      </div>
    </StoreProvider>
  );
}
