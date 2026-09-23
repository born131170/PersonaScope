# PersonaScope — Мультимодальный анализатор типа личности

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

**Комплексный анализ личности по 6 психометрическим системам с использованием ИИ**

[Демо](#демо) • [Возможности](#возможности) • [Быстрый старт](#быстрый-старт) • [Документация](#документация)

</div>

---

## 🎯 Возможности

### 📹 Анализ видео
- Загрузка видео (MP4, WebM, MOV, AVI)
- Автоматическое извлечение кадров
- Анализ микро-выражений и жестов

### 🧠 6 психометрических систем
- **Big Five (OCEAN)** — 5 факторов личности
- **MBTI** — 16 типов личности
- **Эннеаграмма** — 9 типов с крыльями
- **Темперамент** — 4 типа (холерик, сангвиник, меланхолик, флегматик)
- **HEXACO** — 6 факторов
- **PID-5 (DSM-5)** — 5 доменов

### 🛡️ Оценка правдивости
- Вероятность правдивости (0-100%)
- Анализ вербальной согласованности
- Детекция микро-выражений
- Анализ языка тела
- Вокальные паттерны
- Движение глаз

### 🔬 Цифровой слепок
- Создание поведенческих сигнатур
- Выбор временного окна
- Уточняющие промпты
- Экспорт в JSON

### 🔍 Поиск эпизодов
- Поиск по цифровому слепку
- Поиск по загруженному изображению
- Визуализация результатов

### ⚙️ Настройки LLM
- Поддержка OpenAI, Anthropic, Google, Custom
- Бесплатные API (Groq, Gemini, OpenRouter)
- Настройка температуры и токенов
- Тестирование соединения

---

## 🚀 Быстрый старт

### Локальный запуск

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/personascope.git
cd personascope

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev

# Открыть в браузере
# http://localhost:3000
```

### Деплой на GitHub Pages

#### Шаг 1: Создайте репозиторий на GitHub

1. Перейдите на [github.com/new](https://github.com/new)
2. Введите имя репозитория (например, `personascope`)
3. Выберите **Public** (обязательно для GitHub Pages)
4. Нажмите **Create repository**

#### Шаг 2: Загрузите код

```bash
# Инициализируйте git
git init

# Добавьте все файлы
git add .

# Создайте коммит
git commit -m "Initial commit"

# Добавьте remote (замените USERNAME и REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# Отправьте код
git branch -M main
git push -u origin main
```

#### Шаг 3: Включите GitHub Pages

1. Перейдите в **Settings** → **Pages**
2. В разделе **Source** выберите **GitHub Actions**
3. Workflow запустится автоматически

#### Шаг 4: Дождитесь деплоя

- Перейдите в **Actions** для отслеживания прогресса
- После успешного деплоя сайт будет доступен по адресу:
  ```
  https://USERNAME.github.io/REPO/
  ```

### Альтернативные платформы

#### Vercel (рекомендуется)

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel
```

#### Netlify

```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Деплой
netlify deploy --prod
```

---

## 🔑 Настройка LLM API

### Бесплатные варианты

#### Google Gemini (рекомендуется)

1. Перейдите на [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Войдите через Google аккаунт
3. Нажмите **Create API Key**
4. Скопируйте ключ
5. В приложении: **Настройки LLM** → **Google** → вставьте ключ
6. Модель: `gemini-2.0-flash`
7. Лимит: 15 запросов/мин, 1000/день

#### Groq (самый быстрый)

1. Перейдите на [console.groq.com/keys](https://console.groq.com/keys)
2. Зарегистрируйтесь
3. Создайте API ключ
4. В приложении: **Настройки LLM** → **Custom**
5. Model: `llama-3.3-70b-versatile`
6. Base URL: `https://api.groq.com/openai/v1`
7. Лимит: безлимитно (30 запросов/мин)

#### OpenRouter

1. Перейдите на [openrouter.ai/keys](https://openrouter.ai/keys)
2. Зарегистрируйтесь
3. Создайте ключ
4. В приложении: **Настройки LLM** → **Custom**
5. Model: `meta-llama/llama-3.3-70b-instruct:free`
6. Base URL: `https://openrouter.ai/api/v1`

### Платные варианты

#### OpenAI

- Модель: `gpt-4o-mini` (дешевле) или `gpt-4o` (лучше)
- Стоимость: ~$0.15-15 за 1M токенов
- Поддержка vision для анализа изображений

#### Anthropic Claude

- Модель: `claude-3-5-sonnet-20241022`
- Стоимость: ~$3-15 за 1M токенов
- Отличное качество анализа

---

## 📚 Документация

### Структура проекта

```
personascope/
├── src/
│   ├── components/          # React компоненты
│   │   ├── AnalysisDashboard.tsx
│   │   ├── FingerprintPanel.tsx
│   │   ├── SearchPanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── TruthfulnessPanel.tsx
│   │   └── VideoUpload.tsx
│   ├── store/               # Zustand state management
│   │   ├── useAppStore.ts
│   │   └── useThemeStore.ts
│   ├── types/               # TypeScript типы
│   │   └── index.ts
│   ├── utils/               # Утилиты
│   │   ├── analysisEngine.ts
│   │   └── llmApi.ts
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Стили
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions
├── package.json
├── vite.config.js
└── README.md
```

### Технологии

- **React 18** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **Tailwind CSS** — стили
- **Zustand** — state management
- **Recharts** — графики
- **Lucide React** — иконки
- **Framer Motion** — анимации

### API Endpoints

Приложение использует следующие LLM API:

```typescript
// OpenAI
POST https://api.openai.com/v1/chat/completions

// Anthropic
POST https://api.anthropic.com/v1/messages

// Google
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent

// Custom (Groq, OpenRouter, etc.)
POST {baseUrl}/chat/completions
```

---

## 🎨 Темы

Приложение поддерживает две темы:
- **Тёмная** (по умолчанию)
- **Светлая**

Переключение через кнопку ☀️/🌙 в хедере.

---

## 🔒 Безопасность

- API-ключи хранятся только в браузере (localStorage)
- Данные не передаются на сторонние серверы
- Видео обрабатывается локально
- Анализ выполняется через выбранный LLM API

---

## 🐛 Известные ограничения

- Демо-режим использует синтетические данные
- Реальный анализ требует API-ключ
- Поддержка vision зависит от модели
- Максимальный размер видео: 500MB

---

## 🤝 Contributing

Pull requests приветствуются! Для крупных изменений сначала откройте issue.

---

## 📄 Лицензия

MIT © 2024

---

## 💡 Советы

### Для лучшего качества анализа

1. Используйте видео с хорошим освещением
2. Лицо должно быть хорошо видно
3. Минимум 30 секунд видео
4. Чёткая речь (для вокального анализа)

### Для экономии API кредитов

1. Используйте бесплатные модели (Gemini Flash, Groq)
2. Уменьшите `maxTokens` до 2048
3. Анализируйте короткие видео (1-2 минуты)
4. Используйте `temperature: 0.3` для более точных результатов

---

## 📞 Поддержка

Если у вас возникли вопросы:
1. Проверьте [Issues](https://github.com/USERNAME/REPO/issues)
2. Создайте новый issue с описанием проблемы
3. Приложите скриншоты и логи

---

<div align="center">

**Сделано с ❤️ для анализа личности**

[⭐ Поставьте звезду](#) если проект полезен!

</div>
