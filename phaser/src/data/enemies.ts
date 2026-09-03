import type { Enemy } from '../types';

// 33 врага по ТЗ Часть 4 §5 — полный реестр, но в прототипе показываем все 33 с минимальными стадиями
// домены и палитра по Части 5
export const enemies: Enemy[] = [
  { id:'E01', name:'Wick Mimic', domain:'technical', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:1, requiredCards:[{cardId:'C1',rank:1}], sources:['chart'], factor:'длинная тень — неопределённость', layers:'S1 базовый'},
    {stage:2, level:3, requiredCards:[{cardId:'C1',rank:2}], sources:['chart'], factor:'объём почти выключен', layers:'S2 lantern'},
    {stage:3, level:9, requiredCards:[{cardId:'C1',rank:2},{cardId:'C2',rank:1}], sources:['chart','sentiment'], factor:'подсветка толпы', secondDomain:'human', comboRequired:['K01'], layers:'S3 pink rim'},
    {stage:4, level:22, requiredCards:[{cardId:'C1',rank:3}], sources:['chart'], factor:'арена', layers:'S4 arena'},
  ]},
  { id:'E02', name:'Fake Breakout Phantom', domain:'technical', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:4, requiredCards:[{cardId:'C2',rank:1}], sources:['chart'], factor:'пробой без объёма', layers:'S1'},
    {stage:2, level:7, requiredCards:[{cardId:'C2',rank:1}], sources:['chart'], factor:'дивергенция объём', layers:'S2 mask'},
    {stage:3, level:18, requiredCards:[{cardId:'C2',rank:2},{cardId:'C6',rank:1}], sources:['chart','news'], factor:'новость-фейк усиливает пробой', secondDomain:'context', layers:'S3 newspaper'},
    {stage:4, level:32, requiredCards:[{cardId:'C2',rank:2}], sources:['chart','orderbook'], factor:'ликвидации-арена', layers:'S4 hooks'},
  ]},
  { id:'E03', name:'Indicator Cult', domain:'technical', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:8, requiredCards:[{cardId:'C3',rank:1}], sources:['chart'], factor:'перекупленность в тренде', layers:'S1'},
    {stage:2, level:13, requiredCards:[{cardId:'C3',rank:2}], sources:['chart'], factor:'конфликтующие индикаторы', layers:'S2 many needles'},
    {stage:3, level:26, requiredCards:[{cardId:'C3',rank:2},{cardId:'C2',rank:2}], sources:['chart'], factor:'уровень игнорируется культом', secondDomain:'technical', comboRequired:['K02'], layers:'S3 storm'},
    {stage:4, level:44, requiredCards:[{cardId:'C3',rank:3}], sources:['chart'], factor:'арена диалов', layers:'S4 mosaic'},
  ]},
  { id:'E04', name:'Leverage Goblin', domain:'risk', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:12, requiredCards:[{cardId:'C4',rank:1}], sources:['chart','position'], factor:'плечо x20 без стопа', layers:'S1 goblin+lever'},
    {stage:2, level:16, requiredCards:[{cardId:'C4',rank:2}], sources:['chart','position'], factor:'волатильность ATR', layers:'S2 storm cloud'},
    {stage:3, level:33, requiredCards:[{cardId:'C4',rank:2},{cardId:'C2',rank:2}], sources:['position','orderbook'], factor:'стоп по структуре', secondDomain:'technical', comboRequired:['K03'], layers:'S3 kraken tentacle'},
    {stage:4, level:52, requiredCards:[{cardId:'C4',rank:3},{cardId:'C10',rank:1},{cardId:'C14',rank:1}], sources:['position','orderbook'], factor:'деривативы выживания', secondDomain:'cognitive', comboRequired:['T02'], layers:'S4 embers'},
  ]},
  { id:'E05', name:'FOMO Wraith', domain:'human', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:16, requiredCards:[{cardId:'C5',rank:1}], sources:['chart','position'], factor:'вход после импульса', layers:'S1 sprint'},
    {stage:2, level:20, requiredCards:[{cardId:'C5',rank:1}], sources:['chart','news'], factor:'новость-триггер', layers:'S2 newspaper'},
    {stage:3, level:38, requiredCards:[{cardId:'C5',rank:2},{cardId:'C11',rank:1}], sources:['sentiment','chart'], factor:'сирена нарратива', secondDomain:'cognitive', layers:'S3 siren'},
    {stage:4, level:55, requiredCards:[{cardId:'C5',rank:3}], sources:['chart'], factor:'арена — толпа уходит', layers:'S4 crowd leaving'},
  ]},
  { id:'E06', name:'Loss Aversion Wraith', domain:'human', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:18, requiredCards:[{cardId:'C5',rank:1}], sources:['chart','position'], factor:'держит убыток', layers:'S1 ember'},
    {stage:2, level:24, requiredCards:[{cardId:'C5',rank:2}], sources:['position'], factor:'усреднение', layers:'S2 second ember'},
    {stage:3, level:40, requiredCards:[{cardId:'C4',rank:1},{cardId:'C5',rank:2}], sources:['chart','position'], factor:'стоп в безубыток рано', secondDomain:'risk', layers:'S3 poltergeist tug'},
    {stage:4, level:58, requiredCards:[{cardId:'C5',rank:3}], sources:['position'], factor:'кристаллические зарубки', layers:'S4 frost tally'},
  ]},
  { id:'E07', name:'Meme Mirage', domain:'technical', rankDanger:1, mode:'normal', stages:[
    {stage:1, level:10, requiredCards:[{cardId:'C2',rank:1}], sources:['sentiment','chart'], factor:'мем-памп без объёма', layers:'S1 haze'},
    {stage:2, level:15, requiredCards:[{cardId:'C2',rank:1}], sources:['sentiment'], factor:'рой пузырей больше тела', layers:'S2 large swarm'},
    {stage:3, level:29, requiredCards:[{cardId:'C11',rank:1},{cardId:'C5',rank:1}], sources:['sentiment','onchain'], factor:'мало реальных холдеров', secondDomain:'crypto', layers:'S3 chain-links'},
    {stage:4, level:48, requiredCards:[{cardId:'C11',rank:2}], sources:['sentiment'], factor:'арена', layers:'S4'},
  ]},
  { id:'E08', name:'Headline Titan', domain:'context', rankDanger:2, mode:'normal', stages:[
    {stage:1, level:31, requiredCards:[{cardId:'C6',rank:1}], sources:['news','chart'], factor:'новость без понимания веса', layers:'S1 newspaper stone'},
    {stage:2, level:36, requiredCards:[{cardId:'C6',rank:1}], sources:['news'], factor:'фейковые страницы', layers:'S2 peeling pages'},
    {stage:3, level:49, requiredCards:[{cardId:'C6',rank:2},{cardId:'C2',rank:2}], sources:['news','chart'], factor:'новость у уровня', secondDomain:'technical', comboRequired:['K07'], layers:'S3 silk threads'},
    {stage:4, level:66, requiredCards:[{cardId:'C2',rank:2},{cardId:'C6',rank:2},{cardId:'C16',rank:1}], sources:['news','chart'], factor:'контекст трёх слоёв', secondDomain:'context', comboRequired:['T01'], layers:'S4 gavel'},
  ]},
  { id:'E09', name:'Revenge Wraith', domain:'human', rankDanger:2, mode:'normal', stages:[
    {stage:1, level:22, requiredCards:[{cardId:'C5',rank:1}], sources:['position'], factor:'рост размера после потери', layers:'S1 fists'},
    {stage:2, level:27, requiredCards:[{cardId:'C5',rank:2},{cardId:'C4',rank:1}], sources:['position'], factor:'плечо как рычаг', layers:'S2 lever'},
    {stage:3, level:45, requiredCards:[{cardId:'C5',rank:2},{cardId:'C4',rank:2}], sources:['position'], factor:'хладнокровный размер', secondDomain:'risk', comboRequired:['K05'], layers:'S3 dice'},
    {stage:4, level:64, requiredCards:[{cardId:'C5',rank:3},{cardId:'C12',rank:2},{cardId:'C17',rank:1}], sources:['position'], factor:'дисциплина системы', secondDomain:'cognitive', comboRequired:['T03'], layers:'S4 stop-sign'},
  ]},
  { id:'E10', name:'Dopamine Imp', domain:'human', rankDanger:2, mode:'normal', stages:[
    {stage:1, level:25, requiredCards:[{cardId:'C5',rank:1}], sources:['position'], factor:'сделки ради ощущения', layers:'S1 slot machine'},
    {stage:2, level:30, requiredCards:[{cardId:'C5',rank:2}], sources:['position','sentiment'], factor:'частота как симптом', layers:'S2 bells'},
    {stage:3, level:50, requiredCards:[{cardId:'C5',rank:2},{cardId:'C12',rank:2}], sources:['position'], factor:'пауза по правилу', secondDomain:'human', comboRequired:['K06'], layers:'S3 pause'},
    {stage:4, level:68, requiredCards:[{cardId:'C5',rank:3}], sources:['position'], factor:'арена', layers:'S4'},
  ]},
  // сокращённо: остальные враги с 2 стадиями для MVP-контента, полная матрица — в content_package
  { id:'E11', name:'Unlock Titan', domain:'crypto', rankDanger:2, mode:'normal', stages:[
    {stage:1, level:26, requiredCards:[{cardId:'C7',rank:1}], sources:['tokenomics'], factor:'анлок', layers:'S1 padlock'},
    {stage:2, level:34, requiredCards:[{cardId:'C7',rank:2},{cardId:'C9',rank:1}], sources:['tokenomics','onchain'], factor:'движение на цепи', secondDomain:'context', comboRequired:['K09'], layers:'S2 chain'},
    {stage:3, level:60, requiredCards:[{cardId:'C7',rank:2}], sources:['tokenomics'], factor:'фандинг перегрев', layers:'S3 gauge'},
    {stage:4, level:78, requiredCards:[{cardId:'C7',rank:3}], sources:['tokenomics'], factor:'арена', layers:'S4'},
  ]},
  { id:'E13', name:'Rug Pull Phantom', domain:'crypto', rankDanger:2, mode:'normal', stages:[
    {stage:1, level:26, requiredCards:[{cardId:'C8',rank:1}], sources:['wallet','tokenomics'], factor:'ковёр-мост', layers:'S1 carpet'},
    {stage:2, level:35, requiredCards:[{cardId:'C8',rank:2},{cardId:'C7',rank:1}], sources:['wallet','tokenomics'], factor:'контракт и владелец', secondDomain:'crypto', comboRequired:['K10'], layers:'S2 envelopes'},
    {stage:3, level:55, requiredCards:[{cardId:'C8',rank:2}], sources:['wallet'], factor:'бридж-риск', layers:'S3 rope bridge'},
    {stage:4, level:75, requiredCards:[{cardId:'C8',rank:2},{cardId:'C9',rank:1},{cardId:'C11',rank:1}], sources:['wallet','onchain','sentiment'], factor:'скам под нарративом', secondDomain:'cognitive', comboRequired:['T04'], layers:'S4 audit badge'},
  ]},
  { id:'E18', name:'Stop-Hunt Kraken', domain:'risk', rankDanger:2, mode:'normal', stages:[
    {stage:1, level:33, requiredCards:[{cardId:'C10',rank:1}], sources:['chart','orderbook'], factor:'охота за стопами', layers:'S1 hooks'},
    {stage:2, level:42, requiredCards:[{cardId:'C10',rank:1}], sources:['orderbook'], factor:'плечо как груз', layers:'S2 brass weights'},
    {stage:3, level:56, requiredCards:[{cardId:'C10',rank:2},{cardId:'C4',rank:2}], sources:['orderbook','position'], factor:'стоп, который исполнится', secondDomain:'risk', comboRequired:['K14'], layers:'S3 ruler'},
    {stage:4, level:70, requiredCards:[{cardId:'C10',rank:2}], sources:['orderbook'], factor:'кипение', layers:'S4 boiling'},
  ]},
  { id:'E19', name:'Liquidity Hydra', domain:'risk', rankDanger:3, mode:'normal', stages:[
    {stage:1, level:43, requiredCards:[{cardId:'C10',rank:1}], sources:['orderbook','chart'], factor:'карта ликвидаций', layers:'S1 many heads'},
    {stage:2, level:54, requiredCards:[{cardId:'C10',rank:2},{cardId:'C9',rank:1}], sources:['orderbook','onchain'], factor:'потоки перед каскадом', secondDomain:'context', layers:'S2 chain inflows'},
    {stage:3, level:73, requiredCards:[{cardId:'C10',rank:2},{cardId:'C15',rank:1}], sources:['orderbook','tokenomics'], factor:'депег и лендинг', secondDomain:'crypto', layers:'S3 melting coin'},
    {stage:4, level:93, requiredCards:[{cardId:'C10',rank:3},{cardId:'C4',rank:2},{cardId:'C14',rank:1}], sources:['orderbook','position'], factor:'турнир', secondDomain:'cognitive', comboRequired:['T02'], layers:'S4 coliseum'},
  ]},
  { id:'E31', name:'Drawdown Leviathan', domain:'risk', rankDanger:4, mode:'event', stages:[
    {stage:1, level:13, requiredCards:[{cardId:'C4',rank:1}], sources:['position'], factor:'конец бюджета — разбо�� структуры потерь', layers:'S1 spine'},
    {stage:2, level:75, requiredCards:[{cardId:'C4',rank:2},{cardId:'C14',rank:1}], sources:['position'], factor:'асимметрия просадки', layers:'S2 peaks'},
    {stage:3, level:90, requiredCards:[{cardId:'C4',rank:2},{cardId:'C14',rank:1},{cardId:'C16',rank:1}], sources:['position','chart'], factor:'просадка портфеля, кэш как позиция', layers:'S3 pier lantern'},
    {stage:4, level:97, requiredCards:[{cardId:'C4',rank:3},{cardId:'C14',rank:2},{cardId:'C17',rank:1}], sources:['position'], factor:'босс', layers:'S4 jaws'},
  ]},
  { id:'E32', name:'Hubris Dragon', domain:'human', rankDanger:4, mode:'event', stages:[
    {stage:1, level:20, requiredCards:[{cardId:'C5',rank:1}], sources:['position'], factor:'серия побед → переоценка', layers:'S1 dragon eye'},
    {stage:2, level:80, requiredCards:[{cardId:'C5',rank:2},{cardId:'C14',rank:1}], sources:['position'], factor:'hindsight я знал', layers:'S2 scales'},
    {stage:3, level:92, requiredCards:[{cardId:'C5',rank:3},{cardId:'C17',rank:1}], sources:['position'], factor:'система переписана после удачи', layers:'S3 rewritten scroll'},
    {stage:4, level:98, requiredCards:[{cardId:'C5',rank:3},{cardId:'C14',rank:2},{cardId:'C17',rank:1}], sources:['position'], factor:'босс', layers:'S4 flames'},
  ]},
  { id:'E33', name:'System Breaker', domain:'cognitive', rankDanger:4, mode:'boss', stages:[
    {stage:1, level:81, requiredCards:[{cardId:'C17',rank:1}], sources:['position','chart'], factor:'отклонение по ситуации', layers:'S1 crack'},
    {stage:2, level:89, requiredCards:[{cardId:'C17',rank:2},{cardId:'C14',rank:1}], sources:['position'], factor:'переобучение', layers:'S2 overfit grid'},
    {stage:3, level:95, requiredCards:[{cardId:'C17',rank:2},{cardId:'C5',rank:2},{cardId:'C12',rank:2}], sources:['position'], factor:'конфликт трёх искажений', layers:'S3 three masks'},
    {stage:4, level:99, requiredCards:[{cardId:'C17',rank:3}], sources:['chart'], factor:'финал — любые 5 комбо, 2 тройки', layers:'S4 all cards aura'},
  ]},
];

export const enemyById = Object.fromEntries(enemies.map(e=>[e.id,e])) as Record<string,Enemy>;
export function stageOf(enemyId:string, stageNum:number){ const e=enemyById[enemyId]; return e?.stages.find(s=>s.stage===stageNum); }
