import { useState } from "react";
import { GameProvider, useGame, type Tab } from "./store";
import { TopBar, BottomNav } from "./components/HUD";
import { Toast } from "./components/ui";
import Splash from "./screens/Splash";
import Arena from "./screens/Arena";
import Academy from "./screens/Academy";
import Bestiary from "./screens/Bestiary";
import Market from "./screens/Market";
import Tournaments from "./screens/Tournaments";

function Shell() {
  const g = useGame();
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<Tab>("arena");

  if (!entered) return <Splash onEnter={() => setEntered(true)} />;

  return (
    <div className="grid-bg min-h-[100dvh] bg-bg">
      <TopBar />
      <main className="mx-auto max-w-[640px] px-4 pb-24 pt-4">
        <div key={tab} className="animate-fade-up">
          {tab === "arena" && <Arena onGoAcademy={() => setTab("academy")} />}
          {tab === "academy" && <Academy onGoArena={() => setTab("arena")} />}
          {tab === "bestiary" && <Bestiary onGoArena={() => setTab("arena")} />}
          {tab === "market" && <Market />}
          {tab === "tournaments" && <Tournaments />}
        </div>
      </main>
      <BottomNav tab={tab} onTab={setTab} />
      <Toast message={g.toastState.msg} tone={g.toastState.tone} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
