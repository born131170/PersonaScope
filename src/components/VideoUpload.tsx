import { useCallback, useRef, useState } from 'react';
import { Upload, Film, Play, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { generateMockAnalysis } from '../utils/analysisEngine';

export function VideoUpload() {
  const { video, setVideo, setAnalysis, setIsAnalyzing, isAnalyzing, setCurrentTab } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) { setError('Загрузите видеофайл (MP4, WebM, MOV)'); return; }
    setError(null);
    setVideo({ file, url: URL.createObjectURL(file), duration: 0, name: file.name });
  }, [setVideo]);

  const runAnalysis = async () => {
    if (!video) return;
    setIsAnalyzing(true); setProgress(0);
    for (let i = 0; i < 8; i++) { setProgress(((i+1)/8)*100); await new Promise(r=>setTimeout(r,600)); }
    setAnalysis(generateMockAnalysis());
    setIsAnalyzing(false); setCurrentTab('analysis');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div><h2 className="text-2xl font-bold mb-2">Загрузка и анализ видео</h2><p className={isDark?'text-gray-400':'text-gray-600'}>Загрузите видео для комплексного анализа личности.</p></div>
      {!video ? (
        <div className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${dragActive?'border-violet-400 bg-violet-500/10':isDark?'border-gray-700 bg-gray-900/30':'border-gray-300 bg-gray-100/50'}`}
          onDragOver={e=>{e.preventDefault();setDragActive(true)}} onDragLeave={()=>setDragActive(false)}
          onDrop={e=>{e.preventDefault();setDragActive(false);if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0])}}>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-violet-500/30"><Upload className="w-10 h-10 text-violet-400" /></div>
            <div><p className="text-lg font-medium">Перетащите видео сюда</p><p className={`text-sm mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>или нажмите для выбора</p></div>
            <button onClick={()=>fileInputRef.current?.click()} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium">Выбрать видеофайл</button>
            <p className={`text-xs ${isDark?'text-gray-600':'text-gray-400'}`}>MP4, WebM, MOV • Макс. 500МБ</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
            <video ref={videoRef} src={video.url} className="w-full max-h-96 object-contain" controls onLoadedMetadata={()=>{if(videoRef.current&&video)setVideo({...video,duration:videoRef.current.duration})}} />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5"><Film className="w-4 h-4 text-violet-400" /><span className="text-sm text-gray-200">{video.name}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={runAnalysis} disabled={isAnalyzing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium disabled:opacity-50">
              {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin"/>Анализ...</> : <><Play className="w-5 h-5"/>Запустить анализ</>}
            </button>
            <button onClick={()=>{setVideo(null);setError(null)}} className={`px-6 py-3 rounded-xl border ${isDark?'border-gray-700 text-gray-400':'border-gray-300 text-gray-600'}`}>Удалить видео</button>
          </div>
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className={isDark?'text-gray-400':'text-gray-600'}>Прогресс анализа</span><span className="text-violet-500">{Math.round(progress)}%</span></div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark?'bg-gray-800':'bg-gray-200'}`}><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all" style={{width:`${progress}%`}}/></div>
            </div>
          )}
        </div>
      )}
      {error && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500"><AlertCircle className="w-5 h-5"/><span className="text-sm">{error}</span></div>}
      <div className="grid grid-cols-3 gap-4">
        {[{t:'6 систем',d:'Big Five, MBTI, Эннеаграмма, Темперамент, HEXACO, PID-5'},{t:'Анализ кадров',d:'Микро-выражения, жесты, движение глаз'},{t:'Цифровой слепок',d:'Уникальная сигнатура для поиска'}].map(c=>(
          <div key={c.t} className={`p-4 rounded-xl border ${isDark?'bg-gray-900/50 border-gray-800':'bg-white border-gray-200'}`}>
            <h4 className="text-sm font-semibold text-violet-500 mb-1">{c.t}</h4><p className={`text-xs ${isDark?'text-gray-500':'text-gray-500'}`}>{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
