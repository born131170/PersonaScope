import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Key, Globe, Thermometer, Hash, Save, CheckCircle, AlertCircle } from 'lucide-react';

export function SettingsPanel() {
  const { settings, setSettings } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTestResult('Testing connection...');
    try {
      const { callLLM } = await import('../utils/llmApi');
      await callLLM(settings, [
        { role: 'user', content: 'Say "Connection successful" in one sentence.' },
      ], { maxTokens: 50 });
      setTestResult('✓ Connection successful! API is working correctly.');
    } catch (err) {
      setTestResult(`✗ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">LLM Configuration</h2>
        <p className="text-gray-400">Configure your AI provider settings for personality analysis.</p>
      </div>

      <div className="space-y-6">
        {/* Provider Selection */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-400" />
            Provider
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'openai', label: 'OpenAI', desc: 'GPT-4 Vision' },
              { id: 'anthropic', label: 'Anthropic', desc: 'Claude 3' },
              { id: 'google', label: 'Google', desc: 'Gemini Pro' },
              { id: 'custom', label: 'Custom', desc: 'Any OpenAI-compatible' },
            ].map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSettings({ provider: provider.id as typeof settings.provider });
                  if (provider.id === 'openai') setSettings({ model: 'gpt-4-vision-preview', baseUrl: 'https://api.openai.com/v1' });
                  if (provider.id === 'anthropic') setSettings({ model: 'claude-3-opus-20240229', baseUrl: 'https://api.anthropic.com/v1' });
                  if (provider.id === 'google') setSettings({ model: 'gemini-pro-vision', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' });
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.provider === provider.id
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                }`}
              >
                <p className="text-sm font-medium text-gray-200">{provider.label}</p>
                <p className="text-xs text-gray-500 mt-1">{provider.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-400" />
            API Key
          </h3>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({ apiKey: e.target.value })}
            placeholder={`Enter your ${settings.provider} API key...`}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <p className="text-xs text-gray-500">Your API key is stored locally and never sent to our servers.</p>
        </div>

        {/* Model & Endpoint */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold">Model & Endpoint</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Model</label>
              <input
                type="text"
                value={settings.model}
                onChange={(e) => setSettings({ model: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Base URL</label>
              <input
                type="text"
                value={settings.baseUrl}
                onChange={(e) => setSettings({ baseUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-violet-400" />
            Generation Parameters
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Temperature</label>
                <span className="text-sm text-violet-400">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-violet-500"
              />
              <p className="text-xs text-gray-600 mt-1">Lower = more deterministic, Higher = more creative</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400 flex items-center gap-1">
                  <Hash className="w-4 h-4" /> Max Tokens
                </label>
                <span className="text-sm text-violet-400">{settings.maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ maxTokens: parseInt(e.target.value) })}
                className="w-full accent-violet-500"
              />
              <p className="text-xs text-gray-600 mt-1">Maximum response length</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
          <button
            onClick={handleTest}
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
          >
            Test Connection
          </button>
        </div>

        {testResult && (
          <div className={`flex items-center gap-3 p-4 rounded-xl ${
            testResult.startsWith('✓') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
            testResult.startsWith('✗') ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
            'bg-gray-800/50 border border-gray-700 text-gray-400'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
}
