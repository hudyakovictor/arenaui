// Точка входа — только контейнер для Phaser. Никакого сайта: React лишь монтирует <div id="game">.
import { useEffect } from "react";
import { bootGame } from "./game/main";

export default function App() {
  useEffect(() => {
    const game = bootGame("game");
    return () => game.destroy(true);
  }, []);

  return <div id="game" />;
}
