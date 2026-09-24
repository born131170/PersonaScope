import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { Key, Globe, Thermometer, Hash, Save, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export function SettingsPanel() {
  const { settings, setSettings } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [saved, setSaved] = useState(false);
  const [testRes, setTestRes] = useState<string | null>(null);
  // Локальные значения для кастомных полей (для сохранения)
  const [localModel, setLocalModel] = useState(settings.model);
  const [localUrl, setLocalUrl] = useState(settings.baseUrl);
  const [localKey, setLocalKey] = useState(settings.apiKey);

  // Синхронизация при смене settings извне
  useEffect(() => {
    setLocalModel(settings.model);
    setLocalUrl(settings.baseUrl);
    setLocalKey(settings.apiKey);
  }, [settings.model, settings.baseUrl, settings.apiKey]);

  const handleSave = () => {
    setSettings({
      model: localModel,
      baseUrl: localUrl,
      apiKey: localKey,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!localKey.trim()) { setTestRes('✗ Сначала введите API-ключ'); return; }
    if (!localUrl.trim()) { setTestRes('✗ Укажите Base URL'); return; }
    if (!localModel.trim()) { setTestRes('✗ Укажите модель'); return; }
    
    setTestRes('Проверка соединения...');
    try {
      const { callLLM } = await import('../utils/llmApi');
      await callLLM({ ...settings, model: localModel, baseUrl: localUrl, apiKey: localKey }, [{ role: 'user', content: 'Скажи "ОК"' }], { maxTokens: 10 });
      setTestRes('✓ Соединение успешно! API работает.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Неизвестная ошибка';
      if (msg.includes('Failed to fetch') || msg.includes('CORS')) {
        setTestRes('✗ CORS ошибка. Установите расширение Allow CORS для браузера или запустите локально через npm run dev.');
      } else if (msg.includes('401')) {
        setTestRes('✗ Неверный API-ключ');
      } else if (msg.includes('404')) {
        setTestRes('✗ Модель не найдена. Проверьте название модели.');
      } else {
        setTestRes(`✗ ${msg}`);
      }
    }
  };

  const inp = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-violet-500 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`;
  const card = `p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Настройки LLM</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Настройте провайдер ИИ для анализа.</p>
      </div>

      {/* Провайдер */}
      <div className={card}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-500" /> Провайдер
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'openai', l: 'OpenAI', d: 'GPT-4o' },
            { id: 'anthropic', l: 'Anthropic', d: 'Claude 3' },
            { id: 'google', l: 'Google', d: 'Gemini' },
            { id: 'custom', l: 'Свой', d: 'Любой OpenAI-совм.' },
          ].map(p => (
            <button key={p.id} onClick={() => {
              setSettings({ provider: p.id as any });
              if (p.id === 'openai') { setSettings({ model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' }); setLocalModel('gpt-4o-mini'); setLocalUrl('https://api.openai.com/v1'); }
              if (p.id === 'anthropic') { setSettings({ model: 'claude-3-5-sonnet-20241022', baseUrl: 'https://api.anthropic.com/v1' }); setLocalModel('claude-3-5-sonnet-20241022'); setLocalUrl('https://api.anthropic.com/v1'); }
              if (p.id === 'google') { setSettings({ model: 'gemini-2.0-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' }); setLocalModel('gemini-2.0-flash'); setLocalUrl('https://generativelanguage.googleapis.com/v1beta'); }
            }} className={`p-3 rounded-xl border text-left transition-all ${settings.provider === p.id ? isDark ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50' : isDark ? 'border-gray-700 bg-gray-800/30 hover:border-gray-600' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.l}</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{p.d}</p>
            </button>
          ))}
        </div>
      </div>

      {/* API-ключ */}
      <div className={card}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Key className="w-5 h-5 text-violet-500" /> API-ключ
        </h3>
        <input type="password" value={localKey} onChange={e => setLocalKey(e.target.value)} placeholder="Вставьте API-ключ..." className={inp} />
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>🔒 Ключ хранится только в браузере.</p>
      </div>

      {/* Модель и эндпоинт */}
      <div className={card}>
        <h3 className="text-lg font-semibold">Модель и эндпоинт</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Модель</label>
            <input type="text" value={localModel} onChange={e => setLocalModel(e.target.value)} className={inp} placeholder="Например: gpt-4o-mini" />
          </div>
          <div>
            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Base URL</label>
            <input type="text" value={localUrl} onChange={e => setLocalUrl(e.target.value)} className={inp} placeholder="https://api.example.com/v1" />
          </div>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          💡 Для кастомных провайдеров (Groq, OpenRouter, Selora и др.) выберите «Свой» и введите URL и модель.
        </p>
      </div>

      {/* Параметры */}
      <div className={card}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-violet-500" /> Параметры
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Температура</label>
              <span className="text-sm text-violet-500">{settings.temperature}</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={e => setSettings({ temperature: parseFloat(e.target.value) })} className="w-full accent-violet-500" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Hash className="w-4 h-4" /> Макс. токенов
              </label>
              <span className="text-sm text-violet-500">{settings.maxTokens}</span>
            </div>
            <input type="range" min="256" max="8192" step="256" value={settings.maxTokens} onChange={e => setSettings({ maxTokens: parseInt(e.target.value) })} className="w-full accent-violet-500" />
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium">
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Сохранено!' : 'Сохранить настройки'}
        </button>
        <button onClick={handleTest} className={`px-6 py-3 rounded-xl border ${isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
          🔌 Проверить
        </button>
      </div>

      {/* Результат */}
      {testRes && (
        <div className={`flex items-start gap-3 p-4 rounded-xl ${testRes.startsWith('✓') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' : testRes.startsWith('✗') ? 'bg-red-500/10 border border-red-500/30 text-red-500' : isDark ? 'bg-gray-800/50 border border-gray-700 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <span className="text-sm">{testRes}</span>
            {testRes.includes('CORS') && (
              <div className={`p-3 rounded-lg text-xs space-y-2 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                <p className="font-semibold">🔧 Как исправить CORS:</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Установите <a href="https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf" target="_blank" rel="noopener" className="underline">Allow CORS</a> для Chrome</li>
                  <li>Или запустите локально: <code className="bg-black/20 px-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Текущая конфигурация */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-blue-700'}`}>
          <b>💡 Текущая конфигурация:</b> Провайдер: <b>{settings.provider}</b>, Модель: <code className="bg-violet-500/10 px-1 rounded">{settings.model}</code>, URL: <code className="bg-violet-500/10 px-1 rounded text-[10px]">{settings.baseUrl}</code>
          {settings.apiKey ? ' • ✓ API-ключ задан' : ' • ⚠️ API-ключ не задан'}
        </p>
      </div>
    </div>
  );
}
