import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { generateFingerprint } from '../utils/analysisEngine';
import { Fingerprint, Trash2, Clock, Play, Pause, Camera, Activity, FileJson, X, MessageSquare, Info } from 'lucide-react';
import { DigitalFingerprint } from '../types';
import { extractFrameAt } from '../utils/videoExtractor';

export function FingerprintPanel() {
  const { video, fingerprints, addFingerprint, removeFingerprint } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [ct, setCt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ws, setWs] = useState('0');
  const [we, setWe] = useState('5');
  const [prompt, setPrompt] = useState('');
  const [viewFp, setViewFp] = useState<DigitalFingerprint | null>(null);
  const [creating, setCreating] = useState(false);
  const vRef = useRef<HTMLVideoElement>(null);

  const onTime = useCallback(() => { if (vRef.current) setCt(vRef.current.currentTime); }, []);
  const toggle = () => {
    if (!vRef.current) return;
    if (playing) vRef.current.pause(); else vRef.current.play();
    setPlaying(!playing);
  };

  const createFingerprint = async () => {
    if (!video) return;
    const start = parseFloat(ws) || 0;
    const end = parseFloat(we) || start + 5;
    if (end <= start) { alert('Конец должен быть больше начала'); return; }
    
    setCreating(true);
    try {
      // Извлекаем реальный кадр из выбранного времени
      const frameData = await extractFrameAt(video.url, start);
      const fp = generateFingerprint(start, end - start);
      fp.name = prompt.trim() ? prompt.trim().slice(0, 50) : `Слепок ${start.toFixed(1)}с-${end.toFixed(1)}с`;
      fp.frames[0].imageData = frameData;
      addFingerprint(fp);
      setPrompt('');
    } catch (e) {
      // Если не удалось извлечь кадр — создаём без изображения
      const fp = generateFingerprint(start, end - start);
      fp.name = prompt.trim() ? prompt.trim().slice(0, 50) : `Слепок ${start.toFixed(1)}с-${end.toFixed(1)}с`;
      addFingerprint(fp);
      setPrompt('');
    }
    setCreating(false);
  };

  const setWindowFromCurrent = () => {
    setWs(ct.toFixed(1));
    setWe((ct + 5).toFixed(1));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Цифровой слепок</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Создайте поведенческую сигнатуру из фрагмента видео для поиска похожих эпизодов.
        </p>
      </div>

      {!video ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Fingerprint className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Видео не загружено</h3>
          <p className={isDark ? 'text-gray-600' : 'text-gray-400'}>Сначала загрузите видео на вкладке «Загрузка видео».</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            {/* Видео */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
              <video ref={vRef} src={video.url} className="w-full max-h-80 object-contain" onTimeUpdate={onTime} onEnded={() => setPlaying(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <button onClick={toggle} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <input type="range" min="0" max={video.duration || 100} value={ct}
                      onChange={e => { const t = parseFloat(e.target.value); if (vRef.current) vRef.current.currentTime = t; setCt(t); }}
                      className="w-full accent-violet-500" />
                  </div>
                  <span className="text-sm text-gray-300 font-mono">{Math.floor(ct / 60)}:{Math.floor(ct % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {/* Инструкция */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                <Info className="w-4 h-4" /> Как создать слепок
              </h4>
              <ol className={`text-xs space-y-1 ${isDark ? 'text-blue-300/80' : 'text-blue-700'}`}>
                <li><b>1.</b> Найдите в видео интересный момент (жест, мимику, фразу)</li>
                <li><b>2.</b> Поставьте видео на паузу в нужном месте</li>
                <li><b>3.</b> Нажмите «Захватить текущую позицию» — время подставится автоматически</li>
                <li><b>4.</b> При необходимости скорректируйте начало и конец</li>
                <li><b>5.</b> Добавьте описание (что именно фиксируем)</li>
                <li><b>6.</b> Нажмите «Создать слепок»</li>
              </ol>
            </div>

            {/* Настройка окна */}
            <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500" /> Временное окно
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Начало (сек)</label>
                  <input type="text" value={ws} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setWs(v); }}
                    onBlur={() => { if (ws === '') setWs('0'); }}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-violet-500 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Конец (сек)</label>
                  <input type="text" value={we} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setWe(v); }}
                    onBlur={() => { if (we === '') setWe('5'); }}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-violet-500 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
                </div>
              </div>

              {/* Кнопка захвата текущей позиции */}
              <button onClick={setWindowFromCurrent}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <Camera className="w-4 h-4" />
                Захватить текущую позицию ({ct.toFixed(1)}с → {(ct + 5).toFixed(1)}с)
              </button>

              {/* Визуальная шкала */}
              <div className={`relative h-12 rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className="absolute h-full bg-violet-500/20 border-x-2 border-violet-500"
                  style={{
                    left: `${((parseFloat(ws) || 0) / (video.duration || 1)) * 100}%`,
                    width: `${(((parseFloat(we) || 5) - (parseFloat(ws) || 0)) / (video.duration || 1)) * 100}%`,
                  }} />
                <div className="absolute top-0 h-full w-0.5 bg-cyan-400" style={{ left: `${(ct / (video.duration || 1)) * 100}%` }} />
                {fingerprints.map(fp => (
                  <div key={fp.id} className="absolute top-1 bottom-1 w-2 bg-amber-500/60 rounded-full cursor-pointer"
                    style={{ left: `${(fp.timestamp / (video.duration || 1)) * 100}%` }} title={fp.name} onClick={() => setViewFp(fp)} />
                ))}
              </div>

              {/* Промпт */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Описание (что фиксируем?)</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="Например: 'уверенный зрительный контакт при ответе на вопрос' или 'нервный жест руками'"
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:border-violet-500 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} />
              </div>

              {/* Кнопка создания */}
              <button onClick={createFingerprint} disabled={creating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium disabled:opacity-50">
                {creating ? 'Создание...' : <><Fingerprint className="w-4 h-4" />Создать слепок</>}
              </button>
            </div>
          </div>

          {/* Список слепков */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Сохранённые слепки ({fingerprints.length})</h3>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {fingerprints.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <Fingerprint className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Слепков пока нет</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Следуйте инструкции выше</p>
                </div>
              ) : (
                fingerprints.map(fp => (
                  <div key={fp.id} className={`p-4 rounded-xl border hover:border-violet-500/30 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="cursor-pointer flex-1" onClick={() => setViewFp(fp)}>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fp.name}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {fp.timestamp.toFixed(1)}с — {(fp.timestamp + fp.duration).toFixed(1)}с ({fp.duration.toFixed(1)}с)
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setViewFp(fp)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-violet-500/20 text-gray-500 hover:text-violet-400' : 'hover:bg-violet-50 text-gray-400 hover:text-violet-600'}`} title="Просмотр JSON">
                          <FileJson className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeFingerprint(fp.id)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {fp.frames[0]?.imageData && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
                        <img src={fp.frames[0].imageData} alt="" className="w-full aspect-video object-cover" />
                      </div>
                    )}
                    <div className={`mt-2 flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Activity className="w-3 h-3" />
                      <span>{fp.frames.length} кадров</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      {viewFp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewFp(null)}>
          <div className={`relative max-w-3xl w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5 text-violet-500" />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{viewFp.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Цифровой слепок — JSON</p>
                </div>
              </div>
              <button onClick={() => setViewFp(null)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-80px)]">
              {viewFp.frames[0]?.imageData && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
                  <img src={viewFp.frames[0].imageData} alt="" className="w-full aspect-video object-contain bg-black" />
                </div>
              )}
              <pre className={`text-xs font-mono p-4 rounded-xl overflow-auto ${isDark ? 'bg-gray-950 text-emerald-400' : 'bg-gray-100 text-gray-800'}`}>
                {JSON.stringify({
                  id: viewFp.id, name: viewFp.name, timestamp: viewFp.timestamp, duration: viewFp.duration, createdAt: viewFp.createdAt,
                  features: {
                    facialLandmarks: viewFp.features.facialLandmarks.slice(0, 5).map(v => v.toFixed(4)),
                    gestureVectors: viewFp.features.gestureVectors.slice(0, 5).map(v => v.toFixed(4)),
                    microExpressionPattern: viewFp.features.microExpressionPattern.slice(0, 5).map(v => v.toFixed(4)),
                  },
                  frames: viewFp.frames.map(f => ({ timestamp: f.timestamp.toFixed(2), description: f.description, microExpression: f.microExpression, gesture: f.gesture, confidence: f.confidence.toFixed(3) })),
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
