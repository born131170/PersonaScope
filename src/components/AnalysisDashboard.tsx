import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Eye, Clock, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { VideoFrame } from '../types';

function FrameCard({ frame }: { frame: VideoFrame }) {
  const [expanded, setExpanded] = useState(false);
  const minutes = Math.floor(frame.timestamp / 60);
  const seconds = Math.floor(frame.timestamp % 60);

  return (
    <div
      className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden hover:border-violet-500/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-400">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            {frame.microExpression && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {frame.microExpression}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-1 truncate">{frame.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400">{Math.round(frame.confidence * 100)}%</span>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-800 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {frame.gesture && (
              <div className="p-2 rounded-lg bg-gray-800/50">
                <span className="text-gray-500">Gesture:</span>
                <span className="text-gray-300 ml-1">{frame.gesture}</span>
              </div>
            )}
            {frame.microExpression && (
              <div className="p-2 rounded-lg bg-gray-800/50">
                <span className="text-gray-500">Expression:</span>
                <span className="text-gray-300 ml-1">{frame.microExpression}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">{frame.description}</p>
        </div>
      )}
    </div>
  );
}

function TraitBar({ name, value, color }: { name: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{name}</span>
        <span className="text-gray-400">{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AnalysisDashboard() {
  const { analysis } = useAppStore();
  const [activeSystem, setActiveSystem] = useState<string>('bigfive');

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Sparkles className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Analysis Data</h3>
        <p className="text-gray-600 max-w-md">Upload and analyze a video first to see personality assessment results across all psychological frameworks.</p>
      </div>
    );
  }

  const systems = [
    { id: 'bigfive', label: 'Big Five (OCEAN)' },
    { id: 'mbti', label: 'MBTI' },
    { id: 'enneagram', label: 'Enneagram' },
    { id: 'temperament', label: 'Temperament' },
    { id: 'hexaco', label: 'HEXACO' },
    { id: 'pid5', label: 'PID-5 (DSM-5)' },
  ];

  const bigFiveData = [
    { trait: 'Openness', value: analysis.bigFive.openness.value },
    { trait: 'Conscient.', value: analysis.bigFive.conscientiousness.value },
    { trait: 'Extraversion', value: analysis.bigFive.extraversion.value },
    { trait: 'Agreeable.', value: analysis.bigFive.agreeableness.value },
    { trait: 'Neuroticism', value: analysis.bigFive.neuroticism.value },
  ];

  const temperamentData = [
    { name: 'Choleric', value: analysis.temperament.choleric },
    { name: 'Sanguine', value: analysis.temperament.sanguine },
    { name: 'Melancholic', value: analysis.temperament.melancholic },
    { name: 'Phlegmatic', value: analysis.temperament.phlegmatic },
  ];

  const renderSystem = () => {
    switch (activeSystem) {
      case 'bigfive':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={bigFiveData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                    <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {Object.entries(analysis.bigFive).map(([key, trait]) => (
                  <TraitBar
                    key={key}
                    name={trait.name}
                    value={trait.value}
                    color="bg-gradient-to-r from-violet-500 to-cyan-500"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Evidence Frames</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {Object.values(analysis.bigFive).flatMap(t => t.evidence).map((frame) => (
                  <FrameCard key={frame.id} frame={frame} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'mbti':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-center">
                <p className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {analysis.mbti.type}
                </p>
                <p className="text-sm text-gray-400 mt-2">{analysis.mbti.description}</p>
              </div>
              <div className="space-y-4">
                {Object.entries(analysis.mbti.dimensions).map(([key, dim]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{key[0]}</span>
                      <span className="text-gray-400">{key[1]}</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                      <div
                        className="absolute h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${dim.value}%`, left: dim.value > 50 ? '0' : `${dim.value}%`, right: dim.value > 50 ? 'auto' : '0' }}
                      />
                    </div>
                    <p className="text-xs text-center text-violet-300">{dim.label} ({dim.value}%)</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Evidence Frames</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {analysis.mbti.evidence.map((frame) => (
                  <FrameCard key={frame.id} frame={frame} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'enneagram':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
                <p className="text-6xl font-bold text-amber-400">{analysis.enneagram.type}w{analysis.enneagram.wing}</p>
                <p className="text-sm text-gray-400 mt-2">{analysis.enneagram.description}</p>
                <p className="text-xs text-amber-400 mt-3">Confidence: {Math.round(analysis.enneagram.confidence * 100)}%</p>
              </div>
              <div className="grid grid-cols-9 gap-1">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-16 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i + 1 === analysis.enneagram.type
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-800 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Evidence Frames</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {analysis.enneagram.evidence.map((frame) => (
                  <FrameCard key={frame.id} frame={frame} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'temperament':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={temperamentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-violet-300">{analysis.temperament.primary}</span>
                  {' '}primary, {' '}
                  <span className="font-semibold text-cyan-300">{analysis.temperament.secondary}</span>
                  {' '}secondary
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Evidence Frames</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {analysis.temperament.evidence.map((frame) => (
                  <FrameCard key={frame.id} frame={frame} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'hexaco':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(analysis.hexaco).map(([key, trait]) => (
                <TraitBar
                  key={key}
                  name={trait.name}
                  value={trait.value}
                  color="bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Evidence Frames</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {Object.values(analysis.hexaco).flatMap(t => t.evidence).map((frame) => (
                  <FrameCard key={frame.id} frame={frame} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'pid5':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(analysis.pid5).map(([key, trait]) => (
                <div key={key} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">{trait.name}</span>
                    <span className={`text-sm font-semibold ${trait.value > 60 ? 'text-red-400' : trait.value > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {trait.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        trait.value > 60 ? 'bg-red-500' : trait.value > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${trait.value}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{trait.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Evidence Frames</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {Object.values(analysis.pid5).flatMap(t => t.evidence).map((frame) => (
                  <FrameCard key={frame.id} frame={frame} />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personality Analysis Results</h2>
        <p className="text-gray-400">Comprehensive assessment across 6 psychological frameworks with behavioral evidence.</p>
      </div>

      {/* System Tabs */}
      <div className="flex gap-2 flex-wrap">
        {systems.map((sys) => (
          <button
            key={sys.id}
            onClick={() => setActiveSystem(sys.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSystem === sys.id
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-gray-400 hover:text-gray-200 bg-gray-900/50 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {sys.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-gray-900/30 border border-gray-800 p-6">
        {renderSystem()}
      </div>
    </div>
  );
}
