import { v4 as uuidv4 } from 'uuid';
import { AnalysisResult, VideoFrame, DigitalFingerprint } from '../types';

const mkFrames = (n: number, descs: string[]): VideoFrame[] =>
  Array.from({ length: n }, (_, i) => ({
    id: uuidv4(), timestamp: Math.random() * 120, imageData: '',
    description: descs[i % descs.length],
    microExpression: ['Микро-улыбка', 'Учащённое моргание', 'Поднятие бровей', 'Сжатие губ', 'Наклон головы'][i % 5],
    gesture: ['Открытая ладонь', 'Прикосновение', 'Скрещенные руки', 'Указание', 'Кивок'][i % 5],
    confidence: 0.6 + Math.random() * 0.4,
  }));

export const generateMockAnalysis = (): AnalysisResult => ({
  bigFive: {
    openness: { name: 'Открытость', value: 78, description: 'Высокая открытость опыту. Любознательность и креативность.', evidence: mkFrames(4, ['Оживлённые выражения при обсуждении новых концепций', 'Расширенные глаза — интеллектуальное любопытство', 'Наклон вперёд — вовлечённость', 'Спонтанные жесты при абстрактных рассуждениях']) },
    conscientiousness: { name: 'Сознательность', value: 65, description: 'Умеренная организованность, гибкий подход.', evidence: mkFrames(3, ['Структурированная речь', 'Периодическая самокоррекция', 'Сбалансированная поза']) },
    extraversion: { name: 'Экстраверсия', value: 72, description: 'Умеренная экстраверсия. Общителен и экспрессивен.', evidence: mkFrames(4, ['Частые улыбки и открытая поза', 'Анимированные жесты', 'Прямой зрительный контакт', 'Разнообразие интонаций']) },
    agreeableness: { name: 'Доброжелательность', value: 81, description: 'Высокая доброжелательность. Кооперативен и эмпатичен.', evidence: mkFrames(3, ['Тёплая улыбка при согласии', 'Открытые жесты ладоней', 'Мягкие выражения лица']) },
    neuroticism: { name: 'Невротизм', value: 35, description: 'Низкий невротизм. Эмоционально стабилен.', evidence: mkFrames(3, ['Стабильное базовое выражение', 'Ровный взгляд', 'Плавные переходы между состояниями']) },
  },
  mbti: {
    type: 'ENFJ', dimensions: { EI: { value: 72, label: 'Экстраверсия' }, SN: { value: 38, label: 'Интуиция' }, TF: { value: 68, label: 'Чувство' }, JP: { value: 55, label: 'Суждение' } },
    evidence: mkFrames(5, ['Экспрессивный стиль — экстраверсия', 'Абстрактный язык — интуиция', 'Эмпатичные реакции — чувство', 'Структурированный подход — суждение', 'Харизматичное присутствие']),
    description: 'Наставник — харизматичный и вдохновляющий лидер.',
  },
  enneagram: { type: 2, wing: 3, confidence: 0.74, evidence: mkFrames(4, ['Паттерны помощника', 'Ориентация на достижения (крыло 3)', 'Тёплое присутствие (тип 2)', 'Имидж-сознательные жесты']), description: 'Тип 2 (Помощник) с крылом 3. Заботливый и амбициозный.' },
  temperament: { primary: 'Сангвиник', secondary: 'Холерик', choleric: 30, sanguine: 42, melancholic: 12, phlegmatic: 16, evidence: mkFrames(3, ['Энтузиазм и экспрессия (Сангвиник)', 'Быстрые решения (Холерик)', 'Оптимистичный настрой']) },
  hexaco: {
    honestyHumility: { name: 'Честность-скромность', value: 72, description: 'Искренний и скромный стиль.', evidence: mkFrames(3, ['Последовательная коммуникация', 'Нет манипуляций', 'Скромные самоотсылки']) },
    emotionality: { name: 'Эмоциональность', value: 45, description: 'Умеренная чувствительность.', evidence: mkFrames(2, ['Адекватные реакции', 'Комфорт в обсуждении чувств']) },
    extraversion: { name: 'Экстраверсия', value: 75, description: 'Социально уверен.', evidence: mkFrames(3, ['Высокая энергия', 'Комфорт в центре внимания', 'Вовлечённость']) },
    agreeableness: { name: 'Доброжелательность', value: 78, description: 'Прощающий и мягкий.', evidence: mkFrames(2, ['Терпеливое слушание', 'Неконфронтационный стиль']) },
    conscientiousness: { name: 'Сознательность', value: 68, description: 'Организованный подход.', evidence: mkFrames(2, ['Методичная подача', 'Внимание к деталям']) },
    openness: { name: 'Открытость', value: 80, description: 'Открыт новому.', evidence: mkFrames(3, ['Энтузиазм к новому', 'Креативное мышление', 'Эстетическое чутьё']) },
  },
  pid5: {
    negativeAffectivity: { name: 'Негативная аффективность', value: 28, description: 'Низкий уровень негативных эмоций.', evidence: mkFrames(2, ['Минимум стресса', 'Стабильный позитив']) },
    detachment: { name: 'Отстранённость', value: 22, description: 'Социально вовлечён.', evidence: mkFrames(2, ['Активное общение', 'Эмоциональное тепло']) },
    antagonism: { name: 'Антагонизм', value: 18, description: 'Низкий антагонизм.', evidence: mkFrames(2, ['Кооперативный стиль', 'Уважительные выражения']) },
    disinhibition: { name: 'Дезингибиция', value: 32, description: 'Умеренный контроль.', evidence: mkFrames(2, ['Баланс импульсивности', 'Саморегуляция']) },
    psychoticism: { name: 'Психотицизм', value: 15, description: 'Очень низкий. Ясное мышление.', evidence: mkFrames(2, ['Логичные паттерны', 'Реалистичная коммуникация']) },
  },
  truthfulness: {
    overallScore: 82, verbalConsistency: 85, microExpressions: 78, bodyLanguage: 80, vocalPatterns: 84, eyeMovement: 83,
    evidence: mkFrames(4, ['Согласованный нарратив', 'Микро-выражения соответствуют эмоциям', 'Открытая поза', 'Естественные вокальные паттерны']),
    flags: ['Небольшая пауза на 0:34 — усилие вспоминания', 'Краткий отвод взгляда на 1:12 — креативное мышление', 'Учащённое моргание на 2:45 — когнитивная нагрузка'],
  },
  fingerprints: [], analyzedAt: new Date(),
});

export const generateFingerprint = (ts: number, dur: number): DigitalFingerprint => ({
  id: uuidv4(), name: `Слепок @ ${ts.toFixed(1)}с`, timestamp: ts, duration: dur,
  features: { facialLandmarks: Array.from({length:68},()=>Math.random()), gestureVectors: Array.from({length:12},()=>Math.random()), microExpressionPattern: Array.from({length:8},()=>Math.random()), vocalFeatures: Array.from({length:16},()=>Math.random()), postureVector: Array.from({length:6},()=>Math.random()) },
  frames: mkFrames(3, ['Паттерн жеста зафиксирован', 'Базовое выражение лица', 'Поза и ориентация']),
  createdAt: new Date(),
});

export const searchSimilar = (fp: DigitalFingerprint, all: VideoFrame[]): VideoFrame[] =>
  all.filter(f => f.confidence > 0.5).sort(() => Math.random() - 0.5).slice(0, 5).map(f => ({ ...f, description: `Совпадение: ${f.description}`, confidence: 0.6 + Math.random() * 0.4 }));
