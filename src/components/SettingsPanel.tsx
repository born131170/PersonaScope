import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { Key, Globe, Thermometer, Hash, Save, CheckCircle, AlertCircle, ExternalLink, Info, Zap, Sparkles, Rocket, Copy, Check } from 'lucide-react';

interface FreeApiPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  freeLimit: string;
  visionSupport: boolean;
  speed: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  model: string;
  baseUrl: string;
  signupUrl: string;
  steps: string[];
}

const FREE_API_PRESETS: FreeApiPreset[] = [
  {
    id: 'groq',
    name: 'Groq',
    icon: '⚡',
    color: 'from-orange-500 to-red-500',
    description: 'Самый быстрый бесплатный API. Llama 3.3, Mixtral.',
    freeLimit: 'Безлимитно (rate limit 30/мин)',
    visionSupport: false,
    speed: '~100 токенов/сек',
    provider: 'custom',
    model: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    signupUrl: 'https://console.groq.com/keys',
    steps: [
      'Перейдите на console.groq.com/keys',
      'Зарегистрируйтесь через Google/GitHub',
      'Нажмите "Create API Key"',
      'Скопируйте ключ (начинается с gsk_)',
      'Нажмите "Подключить" ниже',
      'Вставьте ключ и нажмите "Сохранить"',
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✦',
    color: 'from-blue-500 to-cyan-500',
    description: 'Мультимодальный ИИ от Google. Поддержка vision.',
    freeLimit: '15 запросов/мин, 1000/день',
    visionSupport: true,
    speed: '~60 токенов/сек',
    provider: 'google',
    model: 'gemini-2.0-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    signupUrl: 'https://aistudio.google.com/apikey',
    steps: [
      'Перейдите на aistudio.google.com/apikey',
      'Войдите через Google аккаунт',
      'Нажмите "Create API Key"',
      'Выберите проект (или создайте новый)',
      'Скопируйте ключ',
      'Нажмите "Подключить" ниже',
      'Вставьте ключ и нажмите "Сохранить"',
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🔀',
    color: 'from-purple-500 to-pink-500',
    description: 'Агрегатор моделей. Много бесплатных вариантов.',
    freeLimit: 'Разные модели — разные лимиты',
    visionSupport: true,
    speed: 'Зависит от модели',
    provider: 'custom',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    baseUrl: 'https://openrouter.ai/api/v1',
    signupUrl: 'https://openrouter.ai/keys',
    steps: [
      'Перейдите на openrouter.ai/keys',
      'Зарегистрируйтесь (GitHub/Google)',
      'Нажмите "Create Key"',
      'Скопируйте ключ (начинается с sk-or-)',
      'Нажмите "Подключить" ниже',
      'Вставьте ключ и нажмите "Сохранить"',
    ],
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    icon: '🧠',
    color: 'from-emerald-500 to-teal-500',
    description: 'Сверхбыстрый inference на чипах Cerebras.',
    freeLimit: 'Бесплатно при регистрации',
    visionSupport: false,
    speed: '~1500 токенов/сек',
    provider: 'custom',
    model: 'llama3.1-70b',
    baseUrl: 'https://api.cerebras.ai/v1',
    signupUrl: 'https://cloud.cerebras.ai/',
    steps: [
      'Перейдите на cloud.cerebras.ai',
      'Зарегистрируйтесь',
      'Перейдите в "API Keys"',
      'Создайте новый ключ',
      'Нажмите "Подключить" ниже',
      'Вставьте ключ и нажмите "Сохранить"',
    ],
  },
  {
    id: 'together',
    name: 'Together AI',
    icon: '🤝',
    color: 'from-indigo-500 to-violet-500',
    description: 'Llama, Mistral, Qwen. $1 кредит бесплатно.',
    freeLimit: '$1 бесплатный кредит',
    visionSupport: true,
    speed: '~80 токенов/сек',
    provider: 'custom',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    baseUrl: 'https://api.together.xyz/v1',
    signupUrl: 'https://api.together.ai/settings/api-keys',
    steps: [
      'Перейдите на api.together.ai',
      'Зарегистрируйтесь',
      'Получите $1 бесплатный кредит',
      'Создайте API ключ',
      'Нажмите "Подключить" ниже',
      'Вставьте ключ и нажмите "Сохранить"',
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '◉',
    color: 'from-green-500 to-emerald-500',
    description: 'GPT-4o-mini. $5 кредитов для новых.',
    freeLimit: '$5 бесплатных кредитов',
    visionSupport: true,
    speed: '~60 токенов/сек',
    provider: 'openai',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    signupUrl: 'https://platform.openai.com/api-keys',
    steps: [
      'Перейдите на platform.openai.com',
      'Создайте аккаунт (новые получают $5)',
      'Перейдите в API Keys',
      'Создайте новый секретный ключ',
      'Нажмите "Подключить" ниже',
      'Вставьте ключ и нажмите "Сохранить"',
    ],
  },
];

export function SettingsPanel() {
  const { settings, setSettings } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showFreeApiGuide, setShowFreeApiGuide] = useState(false);
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTestResult('Проверка соединения...');
    try {
      const { callLLM } = await import('../utils/llmApi');
      await callLLM(settings, [
        { role: 'user', content: 'Скажи "Соединение установлено" одним предложением.' },
      ], { maxTokens: 50 });
      setTestResult('✓ Соединение успешно! API работает корректно.');
    } catch (err) {
      setTestResult(`✗ Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  const applyPreset = (preset: FreeApiPreset) => {
    setSettings({
      provider: preset.provider,
      model: preset.model,
      baseUrl: preset.baseUrl,
    });
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-violet-500 transition-colors ${
    isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const cardClass = `p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Настройки LLM</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Настройте провайдер ИИ для анализа личности.</p>
      </div>

      {/* Quick Connect — Free APIs */}
      <div className={cardClass}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-emerald-500" />
          Быстрое подключение — бесплатные API
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Выберите провайдера, получите бесплатный ключ и подключите в один клик.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {FREE_API_PRESETS.map((preset) => (
            <div key={preset.id} className={`rounded-xl border overflow-hidden transition-all ${
              isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <button
                onClick={() => setExpandedPreset(expandedPreset === preset.id ? null : preset.id)}
                className={`w-full p-4 text-left transition-colors ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center text-lg`}>
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{preset.name}</p>
                      {preset.visionSupport && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                          Vision
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{preset.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px]">
                  <span className="text-emerald-500">{preset.freeLimit}</span>
                  <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>•</span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{preset.speed}</span>
                </div>
              </button>
              
              {expandedPreset === preset.id && (
                <div className={`px-4 pb-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} pt-3 space-y-3`}>
                  <ol className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {preset.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-violet-500 font-bold">{i + 1}.</span>
                        <span>{step.includes('http') ? (
                          <a href={step.match(/https?:\/\/[^\s)]+/)?.[0]} target="_blank" rel="noopener" className="text-violet-500 underline break-all">
                            {step}
                          </a>
                        ) : step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="flex gap-2">
                    <a href={preset.signupUrl} target="_blank" rel="noopener"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
                      <ExternalLink className="w-3 h-3" /> Получить ключ
                    </a>
                    <button onClick={() => applyPreset(preset)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
                      <Zap className="w-3 h-3" /> Подключить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manual Configuration */}
      <div className={cardClass}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-500" /> Ручная настройка
        </h3>
        
        <div>
          <label className={`text-sm mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Провайдер</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'openai', label: 'OpenAI', desc: 'GPT-4o' },
              { id: 'anthropic', label: 'Anthropic', desc: 'Claude 3' },
              { id: 'google', label: 'Google', desc: 'Gemini' },
              { id: 'custom', label: 'Свой', desc: 'OpenAI-совм.' },
            ].map((p) => (
              <button key={p.id} onClick={() => {
                setSettings({ provider: p.id as typeof settings.provider });
                if (p.id === 'openai') setSettings({ model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' });
                if (p.id === 'anthropic') setSettings({ model: 'claude-3-5-sonnet-20241022', baseUrl: 'https://api.anthropic.com/v1' });
                if (p.id === 'google') setSettings({ model: 'gemini-2.0-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' });
              }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.provider === p.id
                    ? isDark ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50'
                    : isDark ? 'border-gray-700 hover:border-gray-600 bg-gray-800/30' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.label}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className={cardClass}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Key className="w-5 h-5 text-violet-500" /> API-ключ
        </h3>
        <div className="relative">
          <input type="password" value={settings.apiKey} onChange={(e) => setSettings({ apiKey: e.target.value })}
            placeholder="Вставьте ваш API-ключ сюда..." className={inputClass} />
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          🔒 Ключ хранится только в вашем браузере и не передаётся на наши серверы.
        </p>
      </div>

      {/* Model & Endpoint */}
      <div className={cardClass}>
        <h3 className="text-lg font-semibold">Модель и эндпоинт</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Модель</label>
            <input type="text" value={settings.model} onChange={(e) => setSettings({ model: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Base URL</label>
            <input type="text" value={settings.baseUrl} onChange={(e) => setSettings({ baseUrl: e.target.value })} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className={cardClass}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-violet-500" /> Параметры генерации
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Температура</label>
              <span className="text-sm text-violet-500">{settings.temperature}</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={settings.temperature}
              onChange={(e) => setSettings({ temperature: parseFloat(e.target.value) })} className="w-full accent-violet-500" />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Ниже = точнее, Выше = креативнее</p>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Hash className="w-4 h-4" /> Макс. токенов
              </label>
              <span className="text-sm text-violet-500">{settings.maxTokens}</span>
            </div>
            <input type="range" min="256" max="8192" step="256" value={settings.maxTokens}
              onChange={(e) => setSettings({ maxTokens: parseInt(e.target.value) })} className="w-full accent-violet-500" />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Максимальная длина ответа</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Сохранено!' : 'Сохранить настройки'}
        </button>
        <button onClick={handleTest}
          className={`px-6 py-3 rounded-xl border transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
          🔌 Проверить соединение
        </button>
      </div>

      {testResult && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          testResult.startsWith('✓') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' :
          testResult.startsWith('✗') ? 'bg-red-500/10 border border-red-500/30 text-red-500' :
          isDark ? 'bg-gray-800/50 border border-gray-700 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{testResult}</span>
        </div>
      )}

      {/* Info about current API */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-violet-500/5 border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}>
        <p className={`text-xs ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
          <b>💡 О текущем API:</b> Это приложение работает через API сторонних провайдеров. 
          Текущая сессия использует <b>{settings.provider === 'openai' ? 'OpenAI' : settings.provider === 'anthropic' ? 'Anthropic' : settings.provider === 'google' ? 'Google' : 'Custom'}</b> модель <code className="bg-violet-500/10 px-1 rounded">{settings.model}</code>.
          {settings.apiKey ? ' API-ключ настроен ✓' : ' Для работы введите API-ключ выше или используйте быстрое подключение.'}
        </p>
      </div>
    </div>
  );
}
