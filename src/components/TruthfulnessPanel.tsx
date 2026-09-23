import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export function TruthfulnessPanel() {
  const { analysis } = useAppStore(); const { theme } = useThemeStore(); const isDark = theme === 'dark';
  if (!analysis) return (<div className="flex flex-col items-center justify-center h-96"><ShieldCheck className="w-16 h-16 text-gray-700 mb-4"/><h3 className="text-xl font-semibold text-gray-400 mb-2">Нет данных</h3><p className={isDark?'text-gray-600':'text-gray-400'}>Сначала проанализируйте видео.</p></div>);
  const { truthfulness } = analysis;
  const rd = [{d:'Вербальная',s:truthfulness.verbalConsistency},{d:'Микро-выр.',s:truthfulness.microExpressions},{d:'Язык тела',s:truthfulness.bodyLanguage},{d:'Вокальная',s:truthfulness.vocalPatterns},{d:'Движ. глаз',s:truthfulness.eyeMovement}];
  const sc = (v:number) => v>=75?'text-emerald-500':v>=50?'text-amber-500':'text-red-500';
  const bg = (v:number) => v>=75?'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30':v>=50?'from-amber-500/20 to-amber-500/5 border-amber-500/30':'from-red-500/20 to-red-500/5 border-red-500/30';
  const bc = (v:number) => v>=75?'bg-emerald-500':v>=50?'bg-amber-500':'bg-red-500';

  return (<div className="max-w-6xl mx-auto space-y-8"><div><h2 className="text-2xl font-bold mb-2">Оценка правдивости</h2><p className={isDark?'text-gray-400':'text-gray-600'}>Многомерный анализ индикаторов правдивости.</p></div>
    <div className="grid grid-cols-3 gap-8"><div className="col-span-1 space-y-6">
      <div className={`p-8 rounded-2xl bg-gradient-to-br ${bg(truthfulness.overallScore)} border text-center`}>
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-400"/><p className="text-5xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">{truthfulness.overallScore}%</p>
        <p className={`text-sm mt-2 ${isDark?'text-gray-400':'text-gray-600'}`}>Общая оценка</p>
        <div className="mt-4 flex items-center justify-center gap-2">{truthfulness.overallScore>=75?<><CheckCircle className="w-4 h-4 text-emerald-500"/><span className="text-sm text-emerald-500">Высокая согласованность</span></>:truthfulness.overallScore>=50?<><AlertTriangle className="w-4 h-4 text-amber-500"/><span className="text-sm text-amber-500">Умеренные индикаторы</span></>:<><XCircle className="w-4 h-4 text-red-500"/><span className="text-sm text-red-500">Тревожные паттерны</span></>}</div>
      </div>
      <div className={`p-4 rounded-2xl border ${isDark?'bg-gray-900/50 border-gray-800':'bg-white border-gray-200'}`}><div className="h-56"><ResponsiveContainer><RadarChart data={rd}><PolarGrid stroke={isDark?'#374151':'#d1d5db'}/><PolarAngleAxis dataKey="d" tick={{fill:isDark?'#9CA3AF':'#6B7280',fontSize:10}}/><PolarRadiusAxis angle={90} domain={[0,100]} tick={{fill:isDark?'#6B7280':'#9CA3AF',fontSize:9}}/><Radar dataKey="s" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2}/></RadarChart></ResponsiveContainer></div></div>
    </div><div className="col-span-2 space-y-6">
      <div className="grid grid-cols-5 gap-3">{[{l:'Вербальная',v:truthfulness.verbalConsistency,d:'Связность нарратива'},{l:'Микро-выражения',v:truthfulness.microExpressions,d:'Лицевые мышцы'},{l:'Язык тела',v:truthfulness.bodyLanguage,d:'Поза и жесты'},{l:'Вокальные',v:truthfulness.vocalPatterns,d:'Ритм и тон'},{l:'Движение глаз',v:truthfulness.eyeMovement,d:'Паттерны взгляда'}].map(x=>(
        <div key={x.l} className={`p-4 rounded-xl border text-center ${isDark?'bg-gray-900/50 border-gray-800':'bg-white border-gray-200'}`}><p className={`text-2xl font-bold ${sc(x.v)}`}>{x.v}%</p><p className={`text-xs mt-1 ${isDark?'text-gray-400':'text-gray-500'}`}>{x.l}</p><div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark?'bg-gray-800':'bg-gray-200'}`}><div className={`h-full rounded-full ${bc(x.v)}`} style={{width:`${x.v}%`}}/></div><p className={`text-xs mt-2 ${isDark?'text-gray-600':'text-gray-400'}`}>{x.d}</p></div>))}</div>
      <div className={`p-6 rounded-2xl border ${isDark?'bg-gray-900/50 border-gray-800':'bg-white border-gray-200'}`}><h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500"/>Поведенческие маркеры</h3><div className="space-y-3">{truthfulness.flags.map((f,i)=>(<div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${isDark?'bg-gray-800/30 border-gray-800':'bg-gray-50 border-gray-200'}`}><div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0"><span className="text-xs text-amber-500">{i+1}</span></div><p className={`text-sm ${isDark?'text-gray-300':'text-gray-700'}`}>{f}</p></div>))}</div></div>
    </div></div>
    <div className={`p-4 rounded-xl border ${isDark?'bg-amber-500/5 border-amber-500/20':'bg-amber-50 border-amber-200'}`}><p className={`text-xs text-center ${isDark?'text-amber-400/80':'text-amber-700'}`}>⚠️ Анализ основан на ИИ и не является окончательным доказательством. Результаты вероятностны.</p></div>
  </div>);
}
