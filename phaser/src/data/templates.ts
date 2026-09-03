import type { EncounterTemplate } from '../types';

// MVP-набор шаблонов — по одному на врага/стадию, покрывает M1-M15
// Учебная цель → рыночная ситуация → атомы → источники → враг/стадия — порядок из ТЗ 1 §6.2
export const templates: EncounterTemplate[] = [
  {
    id:'T-E02-S1', learningGoal:'Отличить пробой с объёмом от пробоя без объёма', atoms:['C2.3'], enemyId:'E02', stage:1, domain:'technical',
    sources:['chart'],
    questionPool:[
      'Цена пробила уровень. Объём отказывается — твоё действие?',
      'Пробой нарисовался. Объём молчит. Что делаешь?',
      'Уровень пробит, но объём не подтверждает. Решение?'
    ],
    answers:[
      {label:'A', text:'Войти сразу — движение уже началось', errorType:'FOMO', enemyHint:'E05'},
      {label:'B', text:'Подождать ретест и подтверждение объёмом', errorType:''},
      {label:'C', text:'Снизить риск, проверить старшие таймфреймы', errorType:'wait-correct-alt'},
      {label:'D', text:'Увеличить позицию — сигнал сильный', errorType:'Leverage', enemyHint:'E04'},
    ],
    correct:1,
    evidence:[
      {id:'ev-vol', source:'chart', label:'Объём 2.1K — на 40% ниже среднего', isCorrect:true, hint:'объём — решающая улика'},
      {id:'ev-price', source:'chart', label:'Закрытие выше уровня', isCorrect:false},
      {id:'ev-wick', source:'chart', label:'Длинная тень', isCorrect:false},
    ],
    skills:['C2','C1','C4'],
  },
  {
    id:'T-E04-S1', learningGoal:'Рассчитать размер позиции от стопа и доли риска', atoms:['C4.2'], enemyId:'E04', stage:1, domain:'risk',
    sources:['chart','position'],
    questionPool:[
      'Депозит 2 000. Стоп 2%. Сколько рискуешь на сделку при 1% риска?',
      'Твой риск — 1% депозита. Где размер позиции?'
    ],
    answers:[
      {label:'A', text:'Риск 40, размер — до стопа 2%: плечо не нужно', errorType:''},
      {label:'B', text:'Риск 20 — экономлю', errorType:'under-risk'},
      {label:'C', text:'Ставлю 10% депозита — сигнал надёжный', errorType:'oversize', enemyHint:'E04'},
      {label:'D', text:'Ждать — рынок сомнительный', isWait:true, errorType:'PaperHands'},
    ],
    correct:0,
    evidence:[
      {id:'ev-risk', source:'position', label:'Калькулятор: риск 20 = 1% от 2000', isCorrect:true},
      {id:'ev-lev', source:'position', label:'Ликвидационная цена близко', isCorrect:false},
    ],
    skills:['C4','C2'],
  },
  {
    id:'T-E05-S1', learningGoal:'Распознать FOMO-вход после импульса', atoms:['C5.1'], enemyId:'E05', stage:1, domain:'human',
    sources:['chart','position'],
    questionPool:[
      'Свеча +8% за 15 минут. Ты вне позиции. Что делаешь?',
      'Памп уже случился. Входить?'
    ],
    answers:[
      {label:'A', text:'Ждать отката и плана, не гнаться', errorType:''},
      {label:'B', text:'Войти — упускаю движение', errorType:'FOMO', enemyHint:'E05'},
      {label:'C', text:'Удвоить — догоню', errorType:'Revenge', enemyHint:'E09'},
      {label:'D', text:'Купить половину сейчас', errorType:'partial-FOMO'},
    ],
    correct:0,
    evidence:[
      {id:'ev-impulse', source:'chart', label:'Импульс без отката, RSI 82', isCorrect:true},
      {id:'ev-news', source:'position', label:'Журнал: 3 FOMO-входа на этой неделе', isCorrect:true},
    ],
    skills:['C5','C1'],
    verdict: { factorA:'график', factorB:'эмоция', correctFactor:'B' } as any
  },
  {
    id:'T-E08-S2', learningGoal:'Отличить факт от фейка и его макро-вес', atoms:['C6.1'], enemyId:'E08', stage:2, domain:'context',
    sources:['news','chart'],
    questionPool:[
      'Новость: «Киты скупили». Но источник — анонимный канал. Вес?',
      'Заголовок кричит. Подтверждений нет. Что с позицией?'
    ],
    answers:[
      {label:'A', text:'Игнорировать канал, ждать подтверждения на графике', errorType:''},
      {label:'B', text:'Верить — киты знают', errorType:'Narrative', enemyHint:'E20'},
      {label:'C', text:'Купить с плечом — инсайд', errorType:'Leverage+FOMO'},
      {label:'D', text:'Ждать — не торговать слух', isWait:true, errorType:''},
    ],
    correct:0,
    evidence:[
      {id:'ev-src', source:'news', label:'Источник: анонимный TG-канал, 0 подтверждений', isCorrect:true},
      {id:'ev-chart', source:'chart', label:'Объём не растёт', isCorrect:true},
    ],
    skills:['C6','C11'],
  },
  {
    id:'T-E13-S1', learningGoal:'Проверить апрувы и домен перед клеймом', atoms:['C8.1'], enemyId:'E13', stage:1, domain:'crypto',
    sources:['wallet','tokenomics'],
    questionPool:[
      'Кошелёк просит approve на unlimited. Домен чуть отличается. Действие?',
      'Подпись unlimited + фишинг-домен. Что делаешь?'
    ],
    answers:[
      {label:'A', text:'Отклонить, проверить домен и лимит', errorType:''},
      {label:'B', text:'Подписать — сайт выглядит как настоящий', errorType:'ApprovalLeech', enemyHint:'E15'},
      {label:'C', text:'Подписать половину', errorType:'partial-approval'},
      {label:'D', text:'Ждать — не взаимодействовать', isWait:true, errorType:''},
    ],
    correct:0,
    evidence:[
      {id:'ev-approve', source:'wallet', label:'Approve: unlimited, домен xn-- (punycode)', isCorrect:true},
      {id:'ev-token', source:'tokenomics', label:'Распределение: команда 40% залочена', isCorrect:false},
    ],
    skills:['C8','C7'],
  },
  {
    id:'T-E18-S1', learningGoal:'Приоритизировать уровень над индикатором', atoms:['C3.6'], enemyId:'E03', stage:2, domain:'technical',
    sources:['chart'],
    questionPool:[
      'RSI говорит перекупленность, но цена держит уровень. Что важнее?',
      'Индикатор против уровня — кому верить?'
    ],
    answers:[
      {label:'A', text:'Уровень первее индикатора — ждать реакцию зоны', errorType:''},
      {label:'B', text:'Продать — RSI 78', errorType:'IndicatorCult', enemyHint:'E03'},
      {label:'C', text:'Купить на пробой индикатора', errorType:'indicator-break'},
      {label:'D', text:'Ждать подтверждения объёмом', isWait:true, errorType:''},
    ],
    correct:0,
    evidence:[
      {id:'ev-level', source:'chart', label:'Уровень удерживается 3 касания', isCorrect:true},
      {id:'ev-rsi', source:'chart', label:'RSI 78 в тренде — норма', isCorrect:true},
    ],
    skills:['C3','C2'],
  },
  {
    id:'T-VERDICT', learningGoal:'Выбрать доминирующий фактор в конфликте сигналов', atoms:['C2.6','C6.1'], enemyId:'E08', stage:3, domain:'context',
    sources:['chart','news','sentiment'],
    questionPool:[
      'График — флэт, новость — бычья, сентимент — эйфория. Что доминирует?',
    ],
    answers:[
      {label:'A', text:'Контекст старшего ТФ — флэт важнее эмоции', errorType:''},
      {label:'B', text:'Новость — покупаю', errorType:'HeadlineTitan', enemyHint:'E08'},
      {label:'C', text:'Сентимент — толпа права', errorType:'MemeMirage'},
      {label:'D', text:'Ждать — конфликт без явного перевеса', isWait:true, errorType:''},
    ],
    correct:0,
    verdict: { factorA:'структура', factorB:'нарратив', correctFactor:'A' },
    evidence:[
      {id:'ev-htf', source:'chart', label:'Старший ТФ: флэт, границы чёткие', isCorrect:true},
      {id:'ev-sent', source:'sentiment', label:'Эйфория 92 — пик', isCorrect:true},
    ],
    skills:['C2','C6','C11'],
  },
];

export const templateById = Object.fromEntries(templates.map(t=>[t.id,t])) as Record<string,EncounterTemplate>;
