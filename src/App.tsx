import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { VideoUpload } from './components/VideoUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { FingerprintPanel } from './components/FingerprintPanel';
import { SearchPanel } from './components/SearchPanel';
import { TruthfulnessPanel } from './components/TruthfulnessPanel';
import { Brain, Upload, BarChart3, Fingerprint, Search, ShieldCheck, Settings } from 'lucide-react';

const tabs = [
  { id: 'upload', label: 'Video Upload', icon: Upload },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'truthfulness', label: 'Truthfulness', icon: ShieldCheck },
  { id: 'fingerprint', label: 'Digital Fingerprint', icon: Fingerprint },
  { id: 'search', label: 'Episode Search', icon: Search },
  { id: 'settings', label: 'LLM Settings', icon: Settings },
];

export default function App() {
  const { currentTab, setCurrentTab, video, analysis } = useAppStore();

  const renderContent = () => {
    switch (currentTab) {
      case 'upload':
        return <VideoUpload />;
      case 'analysis':
        return <AnalysisDashboard />;
      case 'truthfulness':
        return <TruthfulnessPanel />;
      case 'fingerprint':
        return <FingerprintPanel />;
      case 'search':
        return <SearchPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <VideoUpload />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Sidebar tabs={tabs} currentTab={currentTab} onTabChange={setCurrentTab} />
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 px-8 py-4">
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-violet-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              PersonaScope — Multimodal Personality Analysis
            </h1>
            {video && (
              <span className="ml-auto text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {video.name}
              </span>
            )}
            {analysis && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Analysis Complete
              </span>
            )}
          </div>
        </header>
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
