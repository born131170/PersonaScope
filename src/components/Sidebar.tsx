import { Brain, LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  tabs: Tab[];
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ tabs, currentTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900/50 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">PersonaScope</h2>
            <p className="text-xs text-gray-500">v2.0 Pro</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Analysis Engine</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400">LLM Connected</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Multi-model support</p>
        </div>
      </div>
    </aside>
  );
}
