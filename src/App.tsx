import { useAppStore } from './store/useAppStore';
import { useThemeStore } from './store/useThemeStore';
import { Sidebar } from './components/Sidebar';
import { VideoUpload } from './components/VideoUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { FingerprintPanel } from './components/FingerprintPanel';
import { SearchPanel } from './components/SearchPanel';
import { TruthfulnessPanel } from './components/TruthfulnessPanel';
import { Brain, Sun, Moon } from 'lucide-react';
import { useEffect } from 'react';

const tabs = [
  { id: 'upload', label: 'Загрузка видео', icon: 'upload' },
  { id: 'analysis', label: 'Анализ', icon: 'analysis' },
  { id: 'truthfulness', label: 'Правдивость', icon: 'shield' },
  { id: 'fingerprint', label: 'Цифровой слепок', icon: 'fingerprint' },
  { id: 'search', label: 'Поиск эпизодов', icon: 'search' },
  { id: 'settings', label: 'Настройки LLM', icon: 'settings' },
];

export default function App() {
  const { currentTab, setCurrentTab, video, analysis } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const renderContent = () => {
    switch (currentTab) {
      case 'upload': return <VideoUpload />;
      case 'analysis': return <AnalysisDashboard />;
      case 'truthfulness': return <TruthfulnessPanel />;
      case 'fingerprint': return <FingerprintPanel />;
      case 'search': return <SearchPanel />;
      case 'settings': return <SettingsPanel />;
      default: return <VideoUpload />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar tabs={tabs} currentTab={currentTab} onTabChange={setCurrentTab} />
      <main className="flex-1 overflow-y-auto">
        <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-8 py-4 ${
          theme === 'dark' ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-violet-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              PersonaScope — Мультимодальный анализ личности
            </h1>
            {video && (
              <span className="ml-auto text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {video.name}
              </span>
            )}
            {analysis && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-500 border border-violet-500/30">
                Анализ завершён
              </span>
            )}
            <button
              onClick={toggleTheme}
              className={`ml-4 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
