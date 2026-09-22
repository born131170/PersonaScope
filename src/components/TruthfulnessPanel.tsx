import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export function TruthfulnessPanel() {
  const { analysis } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldCheck className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">Нет данных анализа</h3>
        <p className={isDark ? 'text-gray-600' : 'text-gray-400'}>Сначала загрузите и проанализируйте видео.</p>
      </div>
    );
  }

  const { truthfulness } = analysis;
  const radarData = [
    { dimension: 'Вербальная', score: truthfulness.verbalConsistency },
    { dimension: 'Микро-выр.', score: truthfulness.microExpressions },
    { dimension: 'Язык тела', score: truthfulness.bodyLanguage },
    { dimension: 'Вокальная', score: truthfulness.vocalPatterns },
    { dimension: 'Движ. глаз', score: truthfulness.eyeMovement },
  ];

  const getScoreColor = (s: number) => s >= 75 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
  const getScoreBg = (s: number) => s >= 75 ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30' : s >= 50 ? 'from-amber-500/20 to-amber-500/5 border-amber-500/30' : 'from-red-500/20 to-red-500/5 border-red-500/30';
  const getBarColor = (s: number) => s >= 75 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Оценка правдивости</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Многомерный анализ вербальных и невербальных индикаторов правдивости.</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          <div className={`p-8 rounded-2xl bg-gradient-to-br ${getScoreBg(truthfulness.overallScore)} border text-center`}>
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-5xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              {truthfulness.overallScore}%
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Общая оценка правдивости</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {truthfulness.overallScore >= 75 ? (
                <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-sm text-emerald-500">Высокая согласованность</span></>
              ) : truthfulness.overallScore >= 50 ? (
                <><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-sm text-amber-500">Умеренные индикаторы</span></>
              ) : (
                <><XCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500">Тревожные паттерны</span></>
              )}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? '#374151' : '#d1d5db'} />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: isDark ? '#6B7280' : '#9CA3AF', fontSize: 9 }} />
                  <Radar name="Оценка" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Вербальная согласованность', value: truthfulness.verbalConsistency, desc: 'Связность и непротиворечивость нарратива' },
              { label: 'Микро-выражения', value: truthfulness.microExpressions, desc: 'Непроизвольные движения лицевых мышц' },
              { label: 'Язык тела', value: truthfulness.bodyLanguage, desc: 'Поза, жесты и движения' },
              { label: 'Вокальные паттерны', value: truthfulness.vocalPatterns, desc: 'Ритм речи, тон и паузы' },
              { label: 'Движение глаз', value: truthfulness.eyeMovement, desc: 'Паттерны взгляда и частота моргания' },
            ].map((dim) => (
              <div key={dim.label} className={`p-4 rounded-xl border text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <p className={`text-2xl font-bold ${getScoreColor(dim.value)}`}>{dim.value}%</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{dim.label}</p>
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div className={`h-full rounded-full ${getBarColor(dim.value)}`} style={{ width: `${dim.value}%` }} />
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{dim.desc}</p>
              </div>
            ))}
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Поведенческие маркеры
            </h3>
            <div className="space-y-3">
              {truthfulness.flags.map((flag, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-amber-500">{idx + 1}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{flag}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-500" /> Подтверждающие кадры
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {truthfulness.evidence.map((frame) => {
                const m = Math.floor(frame.timestamp / 60);
                const s = Math.floor(frame.timestamp % 60);
                return (
                  <div key={frame.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m}:{s.toString().padStart(2, '0')}</span>
                        <span className="text-xs text-emerald-500">{Math.round(frame.confidence * 100)}%</span>
                      </div>
                      <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{frame.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
        <p className={`text-xs text-center ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
          ⚠️ Данный анализ основан на интерпретации поведенческих паттернов ИИ и не должен использоваться как окончательное доказательство обмана.
          Результаты носят вероятностный характер и могут зависеть от культурных различий, неврологических особенностей и контекста.
        </p>
      </div>
    </div>
  );
}
