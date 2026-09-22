import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { Key, Globe, Thermometer, Hash, Save, CheckCircle, AlertCircle, ExternalLink, Info } from 'lucide-react';

export function SettingsPanel() {
  const { settings, setSettings } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showFreeApiGuide, setShowFreeApiGuide] = useState(false);

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

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-violet-500 transition-colors ${
    isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const cardClass = `p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Настройки LLM</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Настройте провайдер ИИ для анализа личности.</p>
      </div>

      <div className="space-y-6">
        {/* Provider */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-500" /> Провайдер
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'openai', label: 'OpenAI', desc: 'GPT-4 Vision' },
              { id: 'anthropic', label: 'Anthropic', desc: 'Claude 3' },
              { id: 'google', label: 'Google', desc: 'Gemini Pro' },
              { id: 'custom', label: 'Свой', desc: 'OpenAI-совместимый' },
            ].map((p) => (
              <button key={p.id} onClick={() => {
                setSettings({ provider: p.id as typeof settings.provider });
                if (p.id === 'openai') setSettings({ model: 'gpt-4-vision-preview', baseUrl: 'https://api.openai.com/v1' });
                if (p.id === 'anthropic') setSettings({ model: 'claude-3-opus-20240229', baseUrl: 'https://api.anthropic.com/v1' });
                if (p.id === 'google') setSettings({ model: 'gemini-pro-vision', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' });
              }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.provider === p.id
                    ? isDark ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50'
                    : isDark ? 'border-gray-700 hover:border-gray-600 bg-gray-800/30' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.label}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-500" /> API-ключ
          </h3>
          <input type="password" value={settings.apiKey} onChange={(e) => setSettings({ apiKey: e.target.value })}
            placeholder={`Введите API-ключ ${settings.provider}...`} className={inputClass} />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Ваш ключ хранится локально и не отправляется на наши серверы.
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
        <div className="flex items-center gap-4">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Сохранено!' : 'Сохранить'}
          </button>
          <button onClick={handleTest}
            className={`px-6 py-3 rounded-xl border transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
            Проверить соединение
          </button>
          <button onClick={() => setShowFreeApiGuide(!showFreeApiGuide)}
            className={`px-6 py-3 rounded-xl border transition-colors flex items-center gap-2 ${isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
            <Info className="w-4 h-4" /> Бесплатный API
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

        {/* Free API Guide */}
        {showFreeApiGuide && (
          <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-emerald-500" /> Как получить бесплатный API для тестирования
            </h3>
            
            <div className="space-y-4">
              {/* Google Gemini */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-xs">G</span>
                  Google Gemini (рекомендуется) — 15 запросов/мин бесплатно
                </h4>
                <ol className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>1. Перейдите на <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-violet-500 underline">aistudio.google.com/apikey</a></li>
                  <li>2. Войдите через Google аккаунт</li>
                  <li>3. Нажмите «Create API Key»</li>
                  <li>4. Скопируйте ключ</li>
                  <li>5. В настройках выберите провайдер <b>Google</b></li>
                  <li>6. Вставьте ключ, модель: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">gemini-1.5-flash</code></li>
                  <li>7. Base URL: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://generativelanguage.googleapis.com/v1beta</code></li>
                </ol>
              </div>

              {/* Groq */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-orange-50 border-orange-200'}`}>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white text-xs">Q</span>
                  Groq — Быстрый и бесплатный (Llama 3, Mixtral)
                </h4>
                <ol className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>1. Перейдите на <a href="https://console.groq.com/keys" target="_blank" rel="noopener" className="text-violet-500 underline">console.groq.com/keys</a></li>
                  <li>2. Зарегистрируйтесь (бесплатно)</li>
                  <li>3. Создайте API ключ</li>
                  <li>4. В настройках выберите провайдер <b>Custom</b></li>
                  <li>5. Вставьте ключ, модель: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">llama-3.1-70b-versatile</code></li>
                  <li>6. Base URL: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://api.groq.com/openai/v1</code></li>
                </ol>
              </div>

              {/* OpenRouter */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-purple-50 border-purple-200'}`}>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white text-xs">R</span>
                  OpenRouter — Бесплатные модели (Llama, Mistral и др.)
                </h4>
                <ol className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>1. Перейдите на <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-violet-500 underline">openrouter.ai/keys</a></li>
                  <li>2. Зарегистрируйтесь (можно через GitHub)</li>
                  <li>3. Создайте API ключ</li>
                  <li>4. В настройках выберите провайдер <b>Custom</b></li>
                  <li>5. Вставьте ключ, модель: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">meta-llama/llama-3.1-8b-instruct:free</code></li>
                  <li>6. Base URL: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://openrouter.ai/api/v1</code></li>
                </ol>
              </div>

              {/* OpenAI Free */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-green-50 border-green-200'}`}>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-white text-xs">O</span>
                  OpenAI — $5 бесплатных кредитов для новых аккаунтов
                </h4>
                <ol className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>1. Перейдите на <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-violet-500 underline">platform.openai.com/api-keys</a></li>
                  <li>2. Создайте аккаунт (новые получают $5 кредитов)</li>
                  <li>3. Создайте API ключ</li>
                  <li>4. В настройках выберите провайдер <b>OpenAI</b></li>
                  <li>5. Вставьте ключ, модель: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">gpt-4o-mini</code> (дешевле)</li>
                </ol>
              </div>
            </div>

            <div className={`p-3 rounded-lg text-xs ${isDark ? 'bg-violet-500/10 border border-violet-500/20 text-violet-300' : 'bg-violet-50 border border-violet-200 text-violet-700'}`}>
              <b>💡 Совет:</b> Для тестирования лучше всего подходит Google Gemini (15 запросов/мин бесплатно) или Groq (очень быстрый, без лимита на базовом тарифе).
              Для мультимодального анализа (видео-кадры) используйте модели с поддержкой vision: Gemini Flash, GPT-4o-mini, Llama 3.2 Vision.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
