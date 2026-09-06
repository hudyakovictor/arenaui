export interface Patch {
  id: string;
  title: string;
  files: string[];
  fixes: string[]; // bug ids
  summary: string;
  diff: string;
}

export const patches: Patch[] = [
  {
    id: 'P01',
    title: 'ArenaScene: сохранять задачу при restart (вкладки, слепой источник)',
    files: ['phaser/src/scenes/ArenaScene.ts'],
    fixes: ['B01', 'B02'],
    summary:
      'Вводим init(data) с флагом keep. При переключении вкладки/открытии слепого источника вызываем scene.restart({ keep: true }) — экземпляр сцены сохраняется, поэтому encounter, улики, activeSource и blindOpened переживают перерисовку. Новая задача генерируется только при «чистом» входе.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@ export class ArenaScene extends Phaser.Scene {
   private activeSource: SourceId = 'chart';
   private evidenceHighlights = true;
-  private uiGroup!: Phaser.GameObjects.Group;
+  private keepState = false;      // restart без новой задачи
+  private submitted = false;      // защита от двойного submit
+  private epochAtStart: string = 'street';
+  private evidenceChipText?: Phaser.GameObjects.Text;
 
   constructor(){ super({ key:'ArenaScene' }); }
 
+  init(data: { keep?: boolean } = {}): void {
+    this.keepState = !!data.keep && !!this.encounter;
+  }
+
   create(): void {
-    this.selectedEvidence.clear(); this.confidence=null; this.selectedAnswer=null;
-    this.selectedSequence=[]; this.verdictFactor=null; this.blindOpened=false;
-    // M11 — детерминированный seed: уровень + счётчик + время
-    const seed = (this.progress.level*100000 + this.progress.xp + Date.now())>>>0;
-    // M12 кампания: выбираем шаблон по уровню и не закрытым стадиям
-    const tpl = this.pickTemplate();
-    this.encounter = mutate(tpl, seed);
-    this.activeSource = this.encounter.sources[0] as SourceId;
+    if (!this.keepState) {
+      this.selectedEvidence.clear(); this.confidence=null; this.selectedAnswer=null;
+      this.selectedSequence=[]; this.verdictFactor=null; this.blindOpened=false;
+      this.submitted = false;
+      // M11 — детерминированный seed из состояния игрока (см. P02)
+      const seed = gameState.nextEncounterSeed();
+      const tpl = this.pickTemplate();
+      this.encounter = mutate(tpl, seed);
+      this.activeSource = this.encounter.sources[0] as SourceId;
+    }
+    this.keepState = false;
+    this.epochAtStart = this.epoch.id;
     this.evidenceHighlights = balanceConfig.evidence.highlightInEpoch[this.progress.epoch as 'street'|'cabinet'|'terminal'|'system'];
@@ private createBrowser(): void {
           if(this.progress.riskBudget < balanceConfig.riskBudget.blindSourceCost){ this.cameras.main.flash(120,255,89,109); return; }
           gameState.changeBudget(-balanceConfig.riskBudget.blindSourceCost);
-          this.blindOpened=true; this.scene.restart(); return;
+          this.blindOpened=true;
+          this.activeSource = sid;
+          this.scene.restart({ keep: true }); return;
         }
-        this.activeSource=sid; this.scene.restart();
+        if (sid === this.activeSource) return;
+        this.activeSource=sid; this.scene.restart({ keep: true });
       });`,
  },
  {
    id: 'P02',
    title: 'Детерминированный seed из состояния игрока',
    files: ['phaser/src/state/GameState.ts', 'phaser/src/types/index.ts'],
    fixes: ['B03'],
    summary:
      'Seed = hash(deviceId | день | уровень | порядковый номер задачи). Никакого Date.now(). Тот же seed сервер получает из тех же полей → POST /attempts валидируется, задачу можно переиграть по номеру.',
    diff: `--- a/phaser/src/types/index.ts
+++ b/phaser/src/types/index.ts
@@ export interface GameProgress {
   weather: WeatherMode;
+  encounterIndex: number;   // порядковый номер задачи (M11)
+  deviceId: string;         // стабильный id устройства
 }
--- a/phaser/src/state/GameState.ts
+++ b/phaser/src/state/GameState.ts
@@
 import type { GameProgress } from '../types';
+import { hashString } from '../engine/rng';
+
+function makeDeviceId(): string {
+  try {
+    const k = 'arena_device_id';
+    let v = localStorage.getItem(k);
+    if (!v) { v = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(k, v); }
+    return v;
+  } catch { return 'd-anon'; }
+}
+export function todayKey(d = new Date()): string { return d.toISOString().slice(0, 10); }
@@ function defaultProgress(): GameProgress {
     calibration: [],
-    weather: 'TREND'
+    weather: 'TREND',
+    encounterIndex: 0,
+    deviceId: makeDeviceId(),
   };
 }
@@ export class GameState {
+  /** M11: один и тот же seed на клиенте и сервере — без времени. */
+  nextEncounterSeed(): number {
+    const p = this.progress;
+    p.encounterIndex = (p.encounterIndex ?? 0) + 1;
+    this.save();
+    return hashString(\`\${p.deviceId}|\${todayKey()}|\${p.level}|\${p.encounterIndex}\`) || 1;
+  }`,
  },
  {
    id: 'P03',
    title: 'Показ смены эпохи',
    files: ['phaser/src/scenes/ArenaScene.ts'],
    fixes: ['B04'],
    summary: 'Эпоху фиксируем в create() (epochAtStart) и сравниваем с ней после начисления XP.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@ private showShadowAndReward(...)
     this.add.rectangle(20, 520, 350, 44, this.COLORS.cyan).setOrigin(0).setInteractive().on('pointerdown', ()=>{
       overlay.destroy();
-      const oldEp = this.epoch.id;
+      const oldEp = this.epochAtStart;           // эпоха, в которой начиналась задача
       const newEp = getEpochForLevel(gameState.progress.level);
       if(oldEp!==newEp){ this.showEpochTransition(oldEp, newEp); }
-      else { this.scene.restart(); }
+      else { this.scene.start('DailyWarmupScene'); } // кнопка обещает «→ РАЗМИНКА»
     });`,
  },
  {
    id: 'P04',
    title: 'Ключи иконок нижней навигации',
    files: ['phaser/src/scenes/ArenaScene.ts'],
    fixes: ['B05'],
    summary: 'Используем iconKey() из assetKeys — единый реестр ключей, как в shell.ts и BootScene.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@
-import { enemyAvatarKey, cardKey } from '../engine/assetKeys';
+import { enemyAvatarKey, cardKey, iconKey } from '../engine/assetKeys';
@@ private createBottomNav(): void {
-      const k='icon_'+ic[label]; const tk = ic[label];
+      const tk = iconKey(ic[label]);
       if(this.textures.exists(tk)){
         const img=this.add.image(nx+390/8, 806, tk).setDisplaySize(20,20);`,
  },
  {
    id: 'P05',
    title: 'pickTemplate: открытая запись свитка и максимальная доступная стадия',
    files: ['phaser/src/scenes/ArenaScene.ts'],
    fixes: ['B06'],
    summary: 'Ищем первую ОТКРЫТУЮ запись, а не [0]; стадию берём максимальную из доступных по уровню; кандидатов с равной дистанцией перемешиваем детерминированно.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@
+import { SeededRng } from '../engine/rng';
+
+function bestStageFor(enemy: { stages: { stage:number; level:number }[] } | undefined, lvl: number): number {
+  if (!enemy) return 1;
+  const ok = enemy.stages.filter(s => s.level <= lvl);
+  return (ok.length ? ok[ok.length - 1] : enemy.stages[0]).stage;
+}
@@ private pickTemplate(){
-    if(this.progress.errorScroll.length>0 && !this.progress.errorScroll[0].closed){
-      const e = this.progress.errorScroll[0];
-      const enemy = enemyById[e.enemy];
-      const stageNum = enemy?.stages.find(s=>s.level<=this.progress.level)?.stage ?? enemy?.stages[0].stage ?? 1;
-      return templateFor(e.enemy, stageNum);
-    }
+    const openErr = this.progress.errorScroll.find(e => !e.closed && enemyById[e.enemy]);
+    if (openErr) return templateFor(openErr.enemy, bestStageFor(enemyById[openErr.enemy], this.progress.level));
     const lvl = this.progress.level;
-    let best: { enemyId:string; stageNum:number; dist:number } | null = null;
+    const pool: { enemyId:string; stageNum:number; dist:number }[] = [];
     for(const en of enemies){ for(const s of en.stages){
       if(lvl >= s.level - 6 && lvl <= s.level + 6){
-        const dist = Math.abs(lvl - s.level);
-        if(!best || dist < best.dist) best = { enemyId: en.id, stageNum: s.stage, dist };
+        pool.push({ enemyId: en.id, stageNum: s.stage, dist: Math.abs(lvl - s.level) });
       }
     }}
-    if(best) return templateFor(best.enemyId, best.stageNum);
+    if(pool.length){
+      const minDist = Math.min(...pool.map(p => p.dist));
+      const near = pool.filter(p => p.dist <= minDist + 2);          // разнообразие
+      const rng = new SeededRng(this.progress.encounterIndex * 7919 + lvl);
+      const pick = rng.pick(near);
+      return templateFor(pick.enemyId, pick.stageNum);
+    }
     const cand = enemies[lvl % enemies.length];
-    const st = cand.stages.find(s=>s.level<=lvl)?.stage ?? cand.stages[0].stage;
-    return templateFor(cand.id, st);
+    return templateFor(cand.id, bestStageFor(cand, lvl));
   }`,
  },
  {
    id: 'P06',
    title: 'M5 опознание: перемешивание, защита от повторного тапа, fallback для «Системы»',
    files: ['phaser/src/scenes/ArenaScene.ts'],
    fixes: ['B07'],
    summary: 'Кандидаты выбираются детерминированно по seed задачи и перемешиваются; правильный гарантированно внутри; optionsByEpoch = 0 → 4 варианта; второй тап игнорируется.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@ private showIdentify(...)
     const domain = this.encounter.domain;
-    const opts = enemies.filter(e=> e.domain===domain).slice(0, (balanceConfig.identify.optionsByEpoch as any)[this.progress.epoch as any] ?? 2);
-    if(opts.length===0) opts.push(enemyById[this.encounter.enemyId]);
-    if(!opts.find(e=> e.id===this.encounter.enemyId)) opts[0]=enemyById[this.encounter.enemyId];
+    const cfgN = (balanceConfig.identify.optionsByEpoch as any)[this.progress.epoch as any];
+    const n = Math.max(2, cfgN || 4);
+    const rng = new SeededRng(this.encounter.seed ^ 0x51ac);
+    const real = enemyById[this.encounter.enemyId];
+    const others = rng.shuffle(enemies.filter(e => e.domain===domain && e.id!==real.id)).slice(0, n-1);
+    const opts = rng.shuffle([real, ...others]);
+    let answered = false;
     opts.forEach((e,i)=>{
       ...
       .on('pointerdown', ()=>{
+        if (answered) return; answered = true;
         const ok=isReal;`,
  },
  {
    id: 'P07',
    title: 'Единый submit-гард, стрик, introducedAt, дубли пикера',
    files: ['phaser/src/scenes/ArenaScene.ts', 'phaser/src/state/GameState.ts'],
    fixes: ['B08', 'B10', 'B12'],
    summary:
      'Флаг submitted блокирует повторную отправку; пикер уверенности хранится в одном контейнере и пересоздаётся; M3 до уровня confidence.introducedAt пропускается; M4 требует выбранный фактор; стрик обновляется в GameState.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@
+  private confidenceUI?: Phaser.GameObjects.Container;
+  private tiltTimer?: Phaser.Time.TimerEvent;
@@ answers.forEach((a,i)=>{ ... .on('pointerdown', ()=>{
+        if (this.submitted) return;
         const tilt = this.progress.errorScroll.filter(e=>!e.closed).length >= balanceConfig.coldHead.tiltThreshold;
-        if(tilt && !this.selectedAnswer){
+        if(tilt && this.selectedAnswer===null && !this.tiltTimer){
           this.add.text(195, ay+62, '◷ холодная голова — вдох...', {...}).setOrigin(0.5);
-          this.time.delayedCall(balanceConfig.coldHead.delayMs, ()=> { this.selectedAnswer=i; this.showConfidencePicker(); });
+          this.tiltTimer = this.time.delayedCall(balanceConfig.coldHead.delayMs, ()=> {
+            this.tiltTimer = undefined; this.selectedAnswer=i; this.showConfidencePicker();
+          });
           return;
         }
         this.selectedAnswer=i; this.showConfidencePicker();
       });
@@ private showConfidencePicker(){
-    if(this.confidence) return;
+    if(this.submitted) return;
+    // M3 ещё не введена — сразу отправляем со средней ставкой
+    if(this.progress.level < balanceConfig.confidence.introducedAt){ this.confidence='mid'; this.submitAnswer(); return; }
+    this.confidenceUI?.destroy(true);
+    this.confidenceUI = this.add.container(0,0);
     const by=660;
-    this.add.rectangle(14,by,362,54, ...)
+    this.confidenceUI.add(this.add.rectangle(14,by,362,54, ...));
     ...
-      .on('pointerdown', ()=>{ this.confidence=o.k; this.submitAnswer(); });
+      .on('pointerdown', ()=>{ if(this.submitted) return; this.confidence=o.k; this.submitAnswer(); });
@@ private submitAnswer(){
-    if(this.selectedAnswer===null) return;
+    if(this.selectedAnswer===null || this.submitted) return;
+    this.submitted = true;
+    this.confidenceUI?.destroy(true);
     const isCorrect = this.selectedAnswer===this.encounter.correctAnswer;
     if(this.encounter.verdict && this.progress.level>=balanceConfig.verdict.introducedAt){
+      if(this.verdictFactor===null){
+        this.submitted = false;
+        this.cameras.main.shake(80,0.003);
+        this.add.text(195, 462, 'M4: сначала выбери доминирующий фактор', {...}).setOrigin(0.5);
+        return;
+      }
@@ private submitSequence(){
+    if(this.submitted) return;
     ...
-    this.showConfidenceAfter(()=>{
+    this.showConfidenceAfter(()=>{ if(this.submitted) return; this.submitted = true;
@@ private handleResult(...){
     gameState.addXp(v.xp); gameState.addCoins(v.coins);
+    gameState.bumpStreak(isCorrect && isJustified);
     const newBudget = gameState.changeBudget(v.budgetDelta);
--- a/phaser/src/state/GameState.ts
+++ b/phaser/src/state/GameState.ts
@@ export class GameState {
+  bumpStreak(win: boolean){ this.progress.streak = win ? this.progress.streak + 1 : 0; this.save(); }`,
  },
  {
    id: 'P08',
    title: 'Evidence strip без утечек, перерисовка панели после тапа',
    files: ['phaser/src/scenes/ArenaScene.ts'],
    fixes: ['B09'],
    summary: 'Текст чипов создаётся один раз и обновляется через setText; после toggleEvidence перерисовываем сцену через restart({keep:true}), чтобы маркеры ✓ в панели источника обновились.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@ private toggleEvidence(id:string){
     ...
-    this.cameras.main.flash(40,49,214,196);
-    this.refreshEvidenceStrip();
-    if(this.isStoneEpoch) this.refreshActionButton();
+    this.cameras.main.flash(40,49,214,196);
+    this.scene.restart({ keep: true });   // состояние сохранится (P01), маркеры перерисуются
   }
@@ private createEvidenceStrip(): void {
     this.add.text(20,ey+5,'УЛИКИ:', {...});
-    this.refreshEvidenceStrip();
+    this.evidenceChipText = this.add.text(58,ey+5,'', { ...FONT_MONO, fontSize:'7px' }).setOrigin(0);
+    this.refreshEvidenceStrip();
@@ private refreshEvidenceStrip(){
-    const ey=354;
     const chips = this.selectedEvidence.size ? [...this.selectedEvidence].join(' · ') : '— тапни зону в источнике —';
     const col = this.selectedEvidence.size ? this.COLORS.textS : this.COLORS.mutedS;
-    this.add.rectangle(58,ey+1,160,16, this.COLORS.surface).setOrigin(0);
-    this.add.text(58,ey+5, chips.slice(0,32), { ...FONT_MONO, fontSize:'7px', color: col}).setOrigin(0);
+    this.evidenceChipText?.setText(chips.slice(0,32)).setColor(col);
   }`,
  },
  {
    id: 'P09',
    title: 'Dev-кнопка только в DEV, конфиг игры без физики',
    files: ['phaser/src/scenes/ArenaScene.ts', 'phaser/src/config/gameConfig.ts'],
    fixes: ['B11', 'B23'],
    summary: 'LVL+8 доступна только при import.meta.env.DEV; убираем arcade, включаем roundPixels и антиалиасинг под мелкий моно-текст.',
    diff: `--- a/phaser/src/scenes/ArenaScene.ts
+++ b/phaser/src/scenes/ArenaScene.ts
@@ create(): void {
-    this.createDebugEpochSwitcher(); // dev — показать взросление
+    if (import.meta.env.DEV) this.createDebugEpochSwitcher();
--- a/phaser/src/config/gameConfig.ts
+++ b/phaser/src/config/gameConfig.ts
@@ export const gameConfig: Phaser.Types.Core.GameConfig = {
   scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
+  render: { roundPixels: true, antialias: true, pixelArt: false },
+  resolution: Math.min(window.devicePixelRatio || 1, 2),
   scene: [ ... ],
-  physics: { default: 'arcade', arcade: { debug: false } }
 };`,
  },
  {
    id: 'P10',
    title: 'mutator: буквы вариантов, безопасная мутация чисел, честное зеркалирование',
    files: ['phaser/src/engine/mutator.ts'],
    fixes: ['B15', 'B16', 'B17'],
    summary:
      'Перемешиваем индексы любой длины и переназначаем label A..D по новой позиции; числа мутируем регэкспами с границами, не затирая текст; зеркалим только если шаблон помечен mirrorable, и тогда меняем и ответы (long↔short) через словарь.',
    diff: `--- a/phaser/src/engine/mutator.ts
+++ b/phaser/src/engine/mutator.ts
@@
+const LETTERS = ['A','B','C','D','E','F'];
+const MIRROR: [RegExp, string][] = [
+  [/\\bрост\\b/gi, 'снижение'], [/\\bпробила вверх\\b/gi, 'пробила вниз'],
+  [/\\bлонг\\b/gi, 'шорт'], [/\\bпокупк/gi, 'продаж'], [/\\bподдержк/gi, 'сопротивлени'],
+];
+function mirrorText(s: string): string {
+  // двухфазная замена, чтобы не зациклить лонг→шорт→лонг
+  let out = s;
+  MIRROR.forEach(([re, to], i) => { out = out.replace(re, \`\\u0000\${i}\\u0000\`); });
+  MIRROR.forEach(([, to], i) => { out = out.split(\`\\u0000\${i}\\u0000\`).join(to); });
+  return out;
+}
+function mutateNumbers(label: string, rng: SeededRng): string {
+  return label
+    .replace(/(\\d+(?:\\.\\d+)?)K\\b/g, () => \`\${(rng.int(12,38)/10).toFixed(1)}K\`)
+    .replace(/(?<![\\d.])(\\d{2})%(?!\\d)/g, () => \`\${rng.int(30,55)}%\`)
+    .replace(/(?<!\\d)(1[5-9]\\d\\d|2\\d\\d\\d|3[0-5]\\d\\d)(?!\\d)/g, () => String(rng.int(1500,3500)));
+}
 export function mutate(template: EncounterTemplate, seed: number): EncounterInstance {
   const rng = new SeededRng(seed ^ hashString(template.id));
-  const isMirrored = rng.next() > 0.5;
+  const isMirrored = !!template.mirrorable && rng.next() > 0.5;
-  const ticker = rng.pick(TICKERS);
-  const timeframe = rng.pick(TIMEFRAMES);
+  const ticker = rng.pick(template.tickers ?? TICKERS);
+  const timeframe = rng.pick(template.timeframes ?? TIMEFRAMES);
   const q0 = rng.pick(template.questionPool);
-  const question = (isMirrored ? q0.replace('пробила','пробила (зеркально)').replace('рост','снижение') : q0);
+  const question = isMirrored ? mirrorText(q0) : q0;
-  const order = rng.shuffle([0,1,2,3]);
-  const mutatedAnswers = order.map(i=> template.answers[i]);
+  const order = rng.shuffle(template.answers.map((_, i) => i));
+  const mutatedAnswers = order.map((srcIdx, pos) => ({
+    ...template.answers[srcIdx],
+    label: LETTERS[pos],
+    text: isMirrored ? mirrorText(template.answers[srcIdx].text) : template.answers[srcIdx].text,
+  }));
   const correctAnswer = order.indexOf(template.correct);
-  const mutatedEvidence = template.evidence.map(ev=>{
-    let label = ev.label;
-    if(label.includes('2.1K')) label = label.replace('2.1K', ...);
-    if(label.includes('40%')) label = \`\${rng.int(30,55)}%\`;
-    if(label.includes('2000')) label = label.replace('2000', String(rng.int(1500,3500)));
-    if(label.includes('20')) label = label.replace('20', String(rng.int(15,30)));
-    return { ...ev, label };
-  });
+  const mutatedEvidence = template.evidence.map(ev => ({ ...ev, label: mutateNumbers(ev.label, rng) }));`,
  },
  {
    id: 'P11',
    title: 'GameState: безопасная загрузка, таблица уровней, погода дня, уникальные id',
    files: ['phaser/src/state/GameState.ts'],
    fixes: ['B19', 'B20', 'B21', 'B22'],
    summary:
      'try/catch + санитизация сейва; уровни считаются по balanceConfig.xp.levelThresholds (xp накопительный); погода детерминированно от даты; id ошибок с счётчиком; новый игрок стартует с L1 (демо-старт через ?demo=1).',
    diff: `--- a/phaser/src/state/GameState.ts
+++ b/phaser/src/state/GameState.ts
@@
+const THRESHOLDS = balanceConfig.xp.levelThresholds;
+function levelForXp(total: number): number {
+  let lvl = 1;
+  for (let i = 1; i < THRESHOLDS.length; i++) if (total >= THRESHOLDS[i]) lvl = i + 1;
+  // за пределами таблицы — +40% к шагу, но линейно по уровням
+  let need = THRESHOLDS[THRESHOLDS.length - 1], step = Math.round((need - THRESHOLDS[THRESHOLDS.length - 2]) * 1.4);
+  while (lvl < 99 && total >= need + step) { need += step; step = Math.round(step * 1.4); lvl++; }
+  return Math.min(99, lvl);
+}
+function xpMaxFor(level: number): number {
+  return level < THRESHOLDS.length ? THRESHOLDS[level] - THRESHOLDS[level - 1] : Math.round(THRESHOLDS[THRESHOLDS.length-1] * 0.4);
+}
+function weatherForToday(): GameProgress['weather'] {
+  const modes = balanceConfig.weather.modes;
+  return modes[hashString(todayKey()) % modes.length];
+}
+let errSeq = 0;
+
 function defaultProgress(): GameProgress {
+  const demo = typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo');
   return {
-    level: 4, xp: 680, xpMax: 1000, coins: 1240,
+    level: demo ? 4 : 1, xp: 0, xpMax: xpMaxFor(demo ? 4 : 1), totalXp: demo ? 680 : 0, coins: demo ? 1240 : 0,
     riskBudget: balanceConfig.riskBudget.initial, maxBudget: balanceConfig.riskBudget.max,
-    streak: 2,
+    streak: 0,
     ...
-    weather: 'TREND'
+    weather: weatherForToday(),
   };
 }
+function sanitize(p: Partial<GameProgress>): GameProgress {
+  const d = defaultProgress();
+  const num = (v: unknown, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
+  return {
+    ...d, ...p,
+    level: Math.max(1, Math.min(99, Math.floor(num(p.level, d.level)))),
+    xp: Math.max(0, num(p.xp, 0)),
+    xpMax: Math.max(1, num(p.xpMax, d.xpMax)),
+    coins: Math.max(0, num(p.coins, 0)),
+    riskBudget: Math.max(0, Math.min(d.maxBudget, num(p.riskBudget, d.riskBudget))),
+    errorScroll: Array.isArray(p.errorScroll) ? p.errorScroll : [],
+    calibration: Array.isArray(p.calibration) ? p.calibration : [],
+    cardRanks: { ...d.cardRanks, ...(p.cardRanks ?? {}) },
+    enemyStagesReached: { ...(p.enemyStagesReached ?? {}) },
+  };
+}
 export class GameState {
   progress: GameProgress;
   constructor(){
-    const saved = typeof localStorage!=='undefined' ? localStorage.getItem(STORAGE_KEY) : null;
-    this.progress = saved ? { ...defaultProgress(), ...JSON.parse(saved)} : defaultProgress();
+    let parsed: Partial<GameProgress> | null = null;
+    try {
+      const saved = typeof localStorage!=='undefined' ? localStorage.getItem(STORAGE_KEY) : null;
+      parsed = saved ? JSON.parse(saved) : null;
+    } catch { parsed = null; try { localStorage.removeItem(STORAGE_KEY); } catch {} }
+    this.progress = parsed && typeof parsed === 'object' ? sanitize(parsed) : defaultProgress();
+    this.progress.weather = weatherForToday();     // M13: режим дня
     this.refreshEpoch();
   }
   addXp(v:number){
-    this.progress.xp += v;
-    while(this.progress.xp >= this.progress.xpMax){
-      this.progress.xp -= this.progress.xpMax; this.progress.level++;
-      this.progress.xpMax = Math.round(this.progress.xpMax*1.4); this.refreshEpoch();
-    }
+    if (!Number.isFinite(v) || v <= 0) return;
+    const p = this.progress;
+    p.totalXp = (p.totalXp ?? 0) + v;
+    const newLevel = levelForXp(p.totalXp);
+    if (newLevel !== p.level) { p.level = newLevel; this.refreshEpoch(); }
+    p.xpMax = xpMaxFor(p.level);
+    p.xp = Math.max(0, p.totalXp - (THRESHOLDS[p.level - 1] ?? p.totalXp));
     this.save();
   }
   pushError(enemy:string, atom:string, missedEvidence:string){
-    this.progress.errorScroll.unshift({ id: 'e'+Date.now(), ...
+    this.progress.errorScroll.unshift({ id: \`e\${Date.now().toString(36)}\${(errSeq++).toString(36)}\`, ...`,
  },
  {
    id: 'P12',
    title: 'Оверлеи как контейнеры (ErrorJournal, Onboarding)',
    files: ['phaser/src/scenes/ErrorJournalScene.ts', 'phaser/src/scenes/OnboardingScene.ts'],
    fixes: ['B25', 'B26'],
    summary: 'Всё содержимое модалки складываем в Container и уничтожаем целиком; в онбординге держим фон вне «страничного» контейнера и чистим его отложенно.',
    diff: `--- a/phaser/src/scenes/ErrorJournalScene.ts
+++ b/phaser/src/scenes/ErrorJournalScene.ts
@@ private openEntry(id:string, y:number){
-    const overlay=this.add.rectangle(0,0,W,H, 0x070B14, 0.94).setOrigin(0).setInteractive();
-    this.add.text(20, 180, 'FIX MISSION', ...);
+    const modal = this.add.container(0, 0);
+    const overlay = this.add.rectangle(0,0,W,H, 0x070B14, 0.94).setOrigin(0).setInteractive();
+    modal.add(overlay);
+    modal.add(this.add.text(20, 180, 'FIX MISSION', ...));
     ... // каждый add.* оборачиваем в modal.add(...)
-    this.add.rectangle(20, 400, 350, 44, 0x31D6C4).setOrigin(0).setInteractive().on('pointerdown', ()=> overlay.destroy());
+    const btn = this.add.rectangle(20, 400, 350, 44, 0x31D6C4).setOrigin(0).setInteractive()
+      .on('pointerdown', ()=> modal.destroy(true));
+    modal.add(btn);
--- a/phaser/src/scenes/OnboardingScene.ts
+++ b/phaser/src/scenes/OnboardingScene.ts
@@ export class OnboardingScene extends Phaser.Scene {
   private step = 0;
+  private page?: Phaser.GameObjects.Container;
   create(){
     ...
-    this.showStep();
+    this.showStep();
   }
   private showStep(){
-    this.children.removeAll(true);
+    this.page?.destroy(true);
+    this.page = this.add.container(0, 0);
+    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.page!.add(o); return o; };
     const ep = epochOf(1);
-    this.add.rectangle(0, 0, W, H, 0x070B14).setOrigin(0);
+    // фон bg-wall из create() остаётся, полупрозрачная плашка вместо глухой
+    add(this.add.rectangle(0, 0, W, H, 0x070B14, 0.55).setOrigin(0));
     ... // остальные this.add.* → add(this.add.*)
-      if(this.step<2){ this.step++; this.showStep(); }
+      if(this.step<2){ this.step++; this.time.delayedCall(0, () => this.showStep()); }`,
  },
  {
    id: 'P13',
    title: 'Backend: цена покупки — только с сервера',
    files: ['backend/aibackend/http/router.ts', 'backend/aibackend/content/store.ts (new)'],
    fixes: ['B28'],
    summary: 'Каталог SKU живёт на сервере; клиент присылает только sku. purchase() списывает цену из каталога транзакционно.',
    diff: `--- /dev/null
+++ b/backend/aibackend/content/store.ts
+export const STORE: Record<string, { kind: 'premium' | 'cosmetic'; priceSig: number }> = {
+  'skin.street.acid':   { kind: 'cosmetic', priceSig: 300 },
+  'premium.month':      { kind: 'premium',  priceSig: 1800 },
+};
--- a/backend/aibackend/http/router.ts
+++ b/backend/aibackend/http/router.ts
@@
+import { STORE } from '../content/store';
 add('POST', '/billing/purchase', 'user', async c => {
-  const b = await parseBody(c.req, z.object({ sku: z.string().min(2), kind: z.enum(['premium', 'cosmetic']), priceSig: z.number().int().min(0).max(100000) }));
-  return purchase(uid(c), b.sku, b.kind, b.priceSig);
+  rateLimit('buy:' + uid(c), 10, 60_000);
+  const b = await parseBody(c.req, z.object({ sku: z.string().min(2).max(64) }));
+  const item = STORE[b.sku];
+  if (!item) throw new ApiError(404, 'sku_not_found');
+  return purchase(uid(c), b.sku, item.kind, item.priceSig); // внутри: UPDATE ... WHERE coins >= price
 });`,
  },
  {
    id: 'P14',
    title: 'Backend: секреты, admin-токен, rate-limit, 404, seed',
    files: ['backend/aibackend/http/index.ts', 'backend/aibackend/http/router.ts'],
    fixes: ['B29', 'B30', 'B31'],
    summary:
      'Падаем на старте без JWT_SECRET/ADMIN_TOKEN в production; сравнение токена constant-time и только из заголовка; JSON.parse под try; периодическая чистка бакетов; seed на отдельном SEED_SECRET; 404 без карты роутов в проде; decodeURIComponent под try; доверять X-Forwarded-For только за прокси.',
    diff: `--- a/backend/aibackend/http/index.ts
+++ b/backend/aibackend/http/index.ts
@@
-const secret = () => process.env.JWT_SECRET ?? 'signal-arena-dev-secret-change-me';
+const isProd = process.env.NODE_ENV === 'production';
+function requireEnv(name: string, devFallback: string): string {
+  const v = process.env[name];
+  if (v && v.length >= 16) return v;
+  if (isProd) throw new Error(\`[aibackend] \${name} обязателен в production\`);
+  return devFallback;
+}
+const secret = () => requireEnv('JWT_SECRET', 'signal-arena-dev-secret-change-me');
+const seedSecret = () => process.env.SEED_SECRET ?? 'signal-arena-seed-v1'; // НЕ ротируется вместе с JWT
@@ export function verifyToken(token: string): TokenClaims {
-  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as TokenClaims;
+  let claims: TokenClaims;
+  try { claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString()); }
+  catch { throw new ApiError(401, 'bad_token'); }
+  if (typeof claims?.sub !== 'string' || typeof claims.exp !== 'number') throw new ApiError(401, 'bad_token');
@@ export function requireAdmin(req: Request) {
-  const expected = process.env.ADMIN_TOKEN ?? 'admin-dev-token';
-  const got = req.headers.get('x-admin-token') ?? new URL(req.url).searchParams.get('admin_token') ?? '';
-  if (got !== expected) throw new ApiError(403, ...);
+  const expected = Buffer.from(requireEnv('ADMIN_TOKEN', 'admin-dev-token-0123456789'));
+  const got = Buffer.from(req.headers.get('x-admin-token') ?? '');
+  if (got.length !== expected.length || !timingSafeEqual(got, expected)) throw new ApiError(403, 'admin_forbidden');
 }
@@ rate limiting
 const buckets = new Map<string, { n: number; reset: number }>();
+setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k); }, 60_000).unref();
@@
 export function deterministicSeed(...parts: (string | number)[]): number {
-  const h = createHmac('sha256', secret()).update(parts.join('|')).digest();
+  const h = createHmac('sha256', seedSecret()).update(parts.join('|')).digest();
--- a/backend/aibackend/http/router.ts
+++ b/backend/aibackend/http/router.ts
@@ export async function dispatch(req: Request, segments: string[]) {
-  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
+  const trustProxy = process.env.TRUST_PROXY === '1';
+  const ip = (trustProxy ? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() : null) ?? 'direct';
     if (!candidates.length)
-      throw new ApiError(404, 'not_found', \`Нет маршрута \${path}\`, { routes: listRoutes() });
+      throw new ApiError(404, 'not_found', \`Нет маршрута \${path}\`, process.env.NODE_ENV === 'production' ? null : { routes: listRoutes() });
-    const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
+    let params: Record<string, string>;
+    try { params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])); }
+    catch { throw new ApiError(400, 'bad_path'); }`,
  },
];
