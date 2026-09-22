import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { generateFingerprint } from '../utils/analysisEngine';
import { Fingerprint, Trash2, Clock, Play, Pause, Camera, Activity, FileJson, X, MessageSquare } from 'lucide-react';
import { DigitalFingerprint } from '../types';

export function FingerprintPanel() {
  const { video, fingerprints, addFingerprint, removeFingerprint } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [windowStart, setWindowStart] = useState('0');
  const [windowEnd, setWindowEnd] = useState('5');
  const [isRecording, setIsRecording] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [viewingFp, setViewingFp] = useState<DigitalFingerprint | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const captureFingerprint = () => {
    const start = parseFloat(windowStart) || 0;
    const end = parseFloat(windowEnd) || start + 5;
    const fp = generateFingerprint(start, end - start);
    if (customPrompt.trim()) {
      fp.name = customPrompt.trim().slice(0, 50);
    }
    addFingerprint(fp);
    setIsRecording(false);
    setCustomPrompt('');
  };

  const setWindowToCurrent = () => {
    setWindowStart(currentTime.toFixed(1));
    setWindowEnd((currentTime + 5).toFixed(1));
    setIsRecording(true);
  };

  const stopAndCapture = () => {
    setWindowEnd(currentTime.toFixed(1));
    captureFingerprint();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Цифровой слепок</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Создайте поведенческие сигнатуры из сегментов видео для поиска паттернов и сопоставления эпизодов.
        </p>
      </div>

      {!video ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Fingerprint className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Видео не загружено</h3>
          <p className={isDark ? 'text-gray-600' : 'text-gray-400'}>Сначала загрузите видео для создания слепков.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {/* Video & Controls */}
          <div className="col-span-2 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
              <video ref={videoRef} src={video.url} className="w-full max-h-80 object-contain"
                onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <input type="range" min="0" max={video.duration || 100} value={currentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        if (videoRef.current) videoRef.current.currentTime = time;
                        setCurrentTime(time);
                      }} className="w-full accent-violet-500" />
                  </div>
                  <span className="text-sm text-gray-300 font-mono">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Window */}
            <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500" /> Выбор временного окна
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Начало (секунды)</label>
                  <input type="text" value={windowStart}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) setWindowStart(val);
                    }}
                    onBlur={() => { if (windowStart === '') setWindowStart('0'); }}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-violet-500 ${
                      isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`} />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Конец (секунды)</label>
                  <input type="text" value={windowEnd}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) setWindowEnd(val);
                    }}
                    onBlur={() => { if (windowEnd === '') setWindowEnd('5'); }}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-violet-500 ${
                      isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`} />
                </div>
              </div>

              {/* Timeline */}
              <div className={`relative h-12 rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className="absolute h-full bg-violet-500/20 border-x-2 border-violet-500 transition-all"
                  style={{
                    left: `${((parseFloat(windowStart) || 0) / (video.duration || 1)) * 100}%`,
                    width: `${(((parseFloat(windowEnd) || 5) - (parseFloat(windowStart) || 0)) / (video.duration || 1)) * 100}%`,
                  }} />
                <div className="absolute top-0 h-full w-0.5 bg-cyan-400 transition-all"
                  style={{ left: `${(currentTime / (video.duration || 1)) * 100}%` }} />
                {fingerprints.map((fp) => (
                  <div key={fp.id} className="absolute top-1 bottom-1 w-2 bg-amber-500/60 rounded-full cursor-pointer"
                    style={{ left: `${(fp.timestamp / (video.duration || 1)) * 100}%` }}
                    title={fp.name} onClick={() => setViewingFp(fp)} />
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={isRecording ? stopAndCapture : setWindowToCurrent}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                    isRecording ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}>
                  <Camera className="w-4 h-4" />
                  {isRecording ? 'Стоп и захват' : 'Установить окно'}
                </button>
                <button onClick={captureFingerprint} disabled={isRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors disabled:opacity-50">
                  <Fingerprint className="w-4 h-4" /> Создать слепок
                </button>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-500" /> Уточняющий промпт
              </h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Опишите, какой паттерн поведения вы хотите зафиксировать... Например: 'момент уверенного зрительного контакта при ответе на сложный вопрос'"
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:border-violet-500 ${
                  isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Этот промпт будет использован при создании слепка для уточнения фокуса анализа.
              </p>
            </div>
          </div>

          {/* Fingerprints List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Сохранённые слепки ({fingerprints.length})</h3>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {fingerprints.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <Fingerprint className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Слепков пока нет</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Выберите окно и создайте</p>
                </div>
              ) : (
                fingerprints.map((fp) => (
                  <div key={fp.id} className={`p-4 rounded-xl border hover:border-violet-500/30 transition-colors ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="cursor-pointer" onClick={() => setViewingFp(fp)}>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fp.name}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Длительность: {fp.duration.toFixed(1)}с</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setViewingFp(fp)}
                          className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-violet-500/20 text-gray-500 hover:text-violet-400' : 'hover:bg-violet-50 text-gray-400 hover:text-violet-600'}`}
                          title="Просмотр JSON">
                          <FileJson className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeFingerprint(fp.id)}
                          className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {fp.features.facialLandmarks.slice(0, 10).map((v, i) => (
                        <div key={i} className="h-6 rounded bg-gradient-to-t from-violet-500/40 to-cyan-500/40"
                          style={{ opacity: 0.3 + v * 0.7 }} title={`Признак ${i}: ${v.toFixed(3)}`} />
                      ))}
                    </div>
                    <div className={`mt-2 flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Activity className="w-3 h-3" />
                      <span>{fp.frames.length} кадров захвачено</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* JSON Viewer Modal */}
      {viewingFp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewingFp(null)}>
          <div className={`relative max-w-3xl w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5 text-violet-500" />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{viewingFp.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Цифровой слепок — JSON</p>
                </div>
              </div>
              <button onClick={() => setViewingFp(null)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-80px)]">
              <pre className={`text-xs font-mono p-4 rounded-xl overflow-auto ${isDark ? 'bg-gray-950 text-emerald-400' : 'bg-gray-100 text-gray-800'}`}>
                {JSON.stringify({
                  id: viewingFp.id,
                  name: viewingFp.name,
                  timestamp: viewingFp.timestamp,
                  duration: viewingFp.duration,
                  createdAt: viewingFp.createdAt,
                  features: {
                    facialLandmarks_count: viewingFp.features.facialLandmarks.length,
                    gestureVectors_count: viewingFp.features.gestureVectors.length,
                    microExpressionPattern_count: viewingFp.features.microExpressionPattern.length,
                    vocalFeatures_count: viewingFp.features.vocalFeatures.length,
                    postureVector_count: viewingFp.features.postureVector.length,
                    facialLandmarks_sample: viewingFp.features.facialLandmarks.slice(0, 5).map(v => v.toFixed(4)),
                    gestureVectors_sample: viewingFp.features.gestureVectors.slice(0, 5).map(v => v.toFixed(4)),
                    microExpressionPattern_sample: viewingFp.features.microExpressionPattern.slice(0, 5).map(v => v.toFixed(4)),
                  },
                  frames: viewingFp.frames.map(f => ({
                    id: f.id,
                    timestamp: f.timestamp.toFixed(2),
                    description: f.description,
                    microExpression: f.microExpression,
                    gesture: f.gesture,
                    confidence: f.confidence.toFixed(3),
                  })),
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
