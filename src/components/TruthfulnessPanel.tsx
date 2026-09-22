import { useAppStore } from '../store/useAppStore';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export function TruthfulnessPanel() {
  const { analysis } = useAppStore();

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldCheck className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Analysis Data</h3>
        <p className="text-gray-600 max-w-md">Upload and analyze a video first to see truthfulness assessment.</p>
      </div>
    );
  }

  const { truthfulness } = analysis;

  const radarData = [
    { dimension: 'Verbal', score: truthfulness.verbalConsistency },
    { dimension: 'Micro-expr.', score: truthfulness.microExpressions },
    { dimension: 'Body Lang.', score: truthfulness.bodyLanguage },
    { dimension: 'Vocal', score: truthfulness.vocalPatterns },
    { dimension: 'Eye Mov.', score: truthfulness.eyeMovement },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30';
    if (score >= 50) return 'from-amber-500/20 to-amber-500/5 border-amber-500/30';
    return 'from-red-500/20 to-red-500/5 border-red-500/30';
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Truthfulness Assessment</h2>
        <p className="text-gray-400">Multi-dimensional analysis of verbal and non-verbal indicators of truthfulness.</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Overall Score */}
        <div className="col-span-1 space-y-6">
          <div className={`p-8 rounded-2xl bg-gradient-to-br ${getScoreBg(truthfulness.overallScore)} border text-center`}>
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {truthfulness.overallScore}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Overall Truthfulness Score</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {truthfulness.overallScore >= 75 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">High Consistency</span>
                </>
              ) : truthfulness.overallScore >= 50 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-400">Moderate Indicators</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Concerning Patterns</span>
                </>
              )}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="col-span-2 space-y-6">
          {/* Dimension Scores */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Verbal Consistency', value: truthfulness.verbalConsistency, desc: 'Narrative coherence and consistency' },
              { label: 'Micro-expressions', value: truthfulness.microExpressions, desc: 'Involuntary facial muscle movements' },
              { label: 'Body Language', value: truthfulness.bodyLanguage, desc: 'Posture, gestures, and movements' },
              { label: 'Vocal Patterns', value: truthfulness.vocalPatterns, desc: 'Speech rhythm, pitch, and pauses' },
              { label: 'Eye Movement', value: truthfulness.eyeMovement, desc: 'Gaze patterns and blink rate' },
            ].map((dim) => (
              <div key={dim.label} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center">
                <p className={`text-2xl font-bold ${getScoreColor(dim.value)}`}>{dim.value}%</p>
                <p className="text-xs text-gray-400 mt-1">{dim.label}</p>
                <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getBarColor(dim.value)}`} style={{ width: `${dim.value}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">{dim.desc}</p>
              </div>
            ))}
          </div>

          {/* Flags */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Behavioral Flags & Notes
            </h3>
            <div className="space-y-3">
              {truthfulness.flags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-amber-400">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{flag}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Frames */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-400" />
              Supporting Evidence
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {truthfulness.evidence.map((frame) => {
                const minutes = Math.floor(frame.timestamp / 60);
                const seconds = Math.floor(frame.timestamp % 60);
                return (
                  <div key={frame.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                        <span className="text-xs text-emerald-400">{Math.round(frame.confidence * 100)}%</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5 truncate">{frame.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-400/80 text-center">
          ⚠️ This analysis is based on AI interpretation of behavioral patterns and should not be used as definitive evidence of deception. 
          Results are probabilistic and may be influenced by cultural differences, neurological conditions, and contextual factors.
        </p>
      </div>
    </div>
  );
}
