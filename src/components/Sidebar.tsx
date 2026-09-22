import { Brain, Upload, BarChart3, Fingerprint, Search, ShieldCheck, Settings, LucideIcon } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  upload: Upload,
  analysis: BarChart3,
  shield: ShieldCheck,
  fingerprint: Fingerprint,
  search: Search,
  settings: Settings,
};

interface SidebarProps {
  tabs: Tab[];
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ tabs, currentTab, onTabChange }: SidebarProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <aside className={`w-64 flex flex-col border-r ${
      isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">PersonaScope</h2>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>v2.0 Pro</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon] || Upload;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? isDark
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-violet-50 text-violet-700 border border-violet-200'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-violet-500' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Движок анализа</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-500">LLM Подключён</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Мульти-модельная поддержка</p>
        </div>
      </div>
    </aside>
  );
}
