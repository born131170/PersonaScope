import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { searchSimilar } from '../utils/analysisEngine';
import { Search, Upload, Fingerprint, Clock, Eye, Loader2 } from 'lucide-react';
import { VideoFrame } from '../types';
import { FrameViewer, getFrameImage } from './FrameViewer';

export function SearchPanel() {
  const { analysis, fingerprints } = useAppStore();
  const { theme } = useThemeStore(); const isDark = theme === 'dark';
  const [mode, setMode] = useState<'fp'|'img'>('fp');
  const [selFp, setSelFp] = useState<string|null>(null);
  const [searching, setSearching] = useState(false);
  const [img, setImg] = useState<string|null>(null);
  const [results, setResults] = useState<VideoFrame[]>([]);
  const [selFrame, setSelFrame] = useState<VideoFrame|null>(null);
  const [selIdx, setSelIdx] = useState(0);

  const doSearch = async () => {
    setSearching(true); await new Promise(r=>setTimeout(r,2000));
    if (mode==='fp' && selFp && analysis) {
      const fp = fingerprints.find(f=>f.id===selFp);
      if (fp) { const all=[...Object.values(analysis.bigFive).flatMap(t=>t.evidence),...analysis.mbti.evidence,...analysis.enneagram.evidence,...analysis.temperament.evidence,...analysis.truthfulness.evidence]; setResults(searchSimilar(fp,all)); }
    } else {
      setResults(Array.from({length:4},(_,i)=>({id:`s-${i}`,timestamp:Math.random()*120,imageData:'',description:['Аналогичный паттерн бровей','Совпадающие жесты','Сопоставимые микро-выражения','Похожая поза'][i],microExpression:['Поднятие бровей','Уголок губ','Подбородок','Наклон'][i],gesture:['Открытая ладонь','Указание','Прикосновение','Скрещенные'][i],confidence:0.65+Math.random()*0.3})));
    }
    setSearching(false);
  };

  return (<div className="max-w-6xl mx-auto space-y-8"><div><h2 className="text-2xl font-bold mb-2">Поиск эпизодов</h2><p className={isDark?'text-gray-400':'text-gray-600'}>Найдите похожие эпизоды по слепкам или изображению.</p></div>
    <div className="flex gap-4"><button onClick={()=>setMode('fp')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm ${mode==='fp'?isDark?'bg-violet-500/20 text-violet-300 border border-violet-500/30':'bg-violet-50 text-violet-700 border border-violet-200':isDark?'bg-gray-900/50 text-gray-400 border border-gray-800':'bg-white text-gray-600 border border-gray-200'}`}><Fingerprint className="w-4 h-4"/>По слепку</button>
      <button onClick={()=>setMode('img')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm ${mode==='img'?isDark?'bg-violet-500/20 text-violet-300 border border-violet-500/30':'bg-violet-50 text-violet-700 border border-violet-200':isDark?'bg-gray-900/50 text-gray-400 border border-gray-800':'bg-white text-gray-600 border border-gray-200'}`}><Upload className="w-4 h-4"/>По изображению</button></div>
    <div className="grid grid-cols-3 gap-8"><div className="col-span-1 space-y-4">
      {mode==='fp' ? (<div className="space-y-4"><h3 className="text-sm font-semibold">Выберите слепок</h3>{fingerprints.length===0?(<div className={`p-6 text-center rounded-xl border ${isDark?'bg-gray-900/30 border-gray-800':'bg-gray-50 border-gray-200'}`}><Fingerprint className="w-10 h-10 text-gray-700 mx-auto mb-3"/><p className={`text-sm ${isDark?'text-gray-500':'text-gray-400'}`}>Нет слепков</p></div>):(<div className="space-y-2">{fingerprints.map(fp=>(<button key={fp.id} onClick={()=>setSelFp(fp.id)} className={`w-full p-3 rounded-xl text-left ${selFp===fp.id?isDark?'bg-violet-500/20 border border-violet-500/30':'bg-violet-50 border border-violet-200':isDark?'bg-gray-900/50 border border-gray-800':'bg-white border border-gray-200'}`}><p className={`text-sm font-medium ${isDark?'text-gray-200':'text-gray-800'}`}>{fp.name}</p><p className={`text-xs mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>{fp.duration.toFixed(1)}с</p></button>))}</div>)}</div>) : (<div className="space-y-4"><h3 className="text-sm font-semibold">Загрузите референс</h3><div className={`border-2 border-dashed rounded-xl p-8 text-center ${isDark?'border-gray-700':'border-gray-300'}`}><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=ev=>setImg(ev.target?.result as string);r.readAsDataURL(f)}}} className="hidden" id="si"/>{img?<img src={img} alt="" className="max-h-40 mx-auto rounded-lg"/>:<label htmlFor="si" className="cursor-pointer"><Upload className="w-10 h-10 text-gray-600 mx-auto mb-2"/><p className={`text-sm ${isDark?'text-gray-500':'text-gray-400'}`}>Нажмите для загрузки</p></label>}</div></div>)}
      <button onClick={doSearch} disabled={searching||(mode==='fp'?!selFp:!img)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium text-sm disabled:opacity-50">{searching?<><Loader2 className="w-4 h-4 animate-spin"/>Поиск...</>:<><Search className="w-4 h-4"/>Найти эпизоды</>}</button>
    </div><div className="col-span-2 space-y-4"><h3 className="text-sm font-semibold">Результаты {results.length>0&&`(${results.length})`}</h3>
      {results.length===0?(<div className={`flex flex-col items-center justify-center h-64 rounded-2xl border ${isDark?'bg-gray-900/30 border-gray-800':'bg-gray-50 border-gray-200'}`}><Search className="w-12 h-12 text-gray-700 mb-3"/><p className={isDark?'text-gray-500':'text-gray-400'}>Нет результатов</p></div>):(<div className="grid grid-cols-2 gap-4">{results.map((r,i)=>(<div key={r.id} className={`p-4 rounded-xl border hover:border-violet-500/30 cursor-pointer ${isDark?'bg-gray-900/50 border-gray-800':'bg-white border-gray-200'}`} onClick={()=>{setSelFrame(r);setSelIdx(i)}}>
        <div className="flex items-center gap-3 mb-3"><div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800"><img src={getFrameImage(i+80)} alt="" className="w-full h-full object-cover"/></div><div><div className="flex items-center gap-2"><Clock className="w-3 h-3 text-gray-500"/><span className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>{Math.floor(r.timestamp/60)}:{Math.floor(r.timestamp%60).toString().padStart(2,'0')}</span></div><p className="text-xs text-emerald-500 mt-0.5">Совпадение: {Math.round(r.confidence*100)}%</p></div><span className={`ml-auto text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>#{i+1}</span></div>
        <p className={`text-sm ${isDark?'text-gray-300':'text-gray-700'}`}>{r.description}</p><div className="flex gap-2 mt-3">{r.microExpression&&<span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{r.microExpression}</span>}{r.gesture&&<span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{r.gesture}</span>}</div>
        <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${isDark?'bg-gray-800':'bg-gray-200'}`}><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{width:`${r.confidence*100}%`}}/></div>
      </div>))}</div>)}
    </div></div>
    {selFrame && <FrameViewer frame={selFrame} index={selIdx+80} onClose={()=>setSelFrame(null)}/>}
  </div>);
}
