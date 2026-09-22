import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { searchSimilarEpisodes } from '../utils/analysisEngine';
import { Search, Upload, Fingerprint, Clock, Eye, Loader2 } from 'lucide-react';
import { VideoFrame } from '../types';
import { FrameThumbnail, FrameViewer, getFrameImage } from './FrameViewer';

export function SearchPanel() {
  const { analysis, fingerprints, setSearchResults } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [searchMode, setSearchMode] = useState<'fingerprint' | 'upload'>('fingerprint');
  const [selectedFingerprint, setSelectedFingerprint] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [results, setResults] = useState<VideoFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<VideoFrame | null>(null);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);

  const handleSearch = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (searchMode === 'fingerprint' && selectedFingerprint && analysis) {
      const fp = fingerprints.find(f => f.id === selectedFingerprint);
      if (fp) {
        const allFrames = [
          ...Object.values(analysis.bigFive).flatMap(t => t.evidence),
          ...analysis.mbti.evidence,
          ...analysis.enneagram.evidence,
          ...analysis.temperament.evidence,
          ...analysis.truthfulness.evidence,
        ];
        const found = searchSimilarEpisodes(fp, allFrames);
        setResults(found);
        setSearchResults(found);
      }
    } else {
      const mockResults: VideoFrame[] = Array.from({ length: 4 }, (_, i) => ({
        id: `search-${i}`,
        timestamp: Math.random() * 120,
        imageData: '',
        description: [
          'Обнаружен аналогичный паттерн поднятия бровей',
          'Найдена совпадающая последовательность жестов рук',
          'Сопоставимый кластер микро-выражений',
          'Похожая поза и ориентация тела',
        ][i],
        microExpression: ['Поднятие бровей', 'Уголок губ', 'Подбородок вверх', 'Наклон головы'][i],
        gesture: ['Открытая ладонь', 'Указание', 'Прикосновение', 'Скрещенные руки'][i],
        confidence: 0.65 + Math.random() * 0.3,
      }));
      setResults(mockResults);
      setSearchResults(mockResults);
    }
    setIsSearching(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Поиск эпизодов</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Найдите похожие поведенческие эпизоды по цифровым слепкам или загруженному изображению.
        </p>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setSearchMode('fingerprint')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
            searchMode === 'fingerprint'
              ? isDark ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-violet-50 text-violet-700 border border-violet-200'
              : isDark ? 'bg-gray-900/50 text-gray-400 border border-gray-800' : 'bg-white text-gray-600 border border-gray-200'
          }`}>
          <Fingerprint className="w-4 h-4" /> Поиск по слепку
        </button>
        <button onClick={() => setSearchMode('upload')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
            searchMode === 'upload'
              ? isDark ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-violet-50 text-violet-700 border border-violet-200'
              : isDark ? 'bg-gray-900/50 text-gray-400 border border-gray-800' : 'bg-white text-gray-600 border border-gray-200'
          }`}>
          <Upload className="w-4 h-4" /> Поиск по изображению
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-4">
          {searchMode === 'fingerprint' ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Выберите слепок</h3>
              {fingerprints.length === 0 ? (
                <div className={`p-6 text-center rounded-xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <Fingerprint className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Нет доступных слепков</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Создайте слепки во вкладке «Цифровой слепок»</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fingerprints.map((fp) => (
                    <button key={fp.id} onClick={() => setSelectedFingerprint(fp.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedFingerprint === fp.id
                          ? isDark ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-violet-50 border border-violet-200'
                          : isDark ? 'bg-gray-900/50 border border-gray-800 hover:border-gray-700' : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fp.name}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Длительность: {fp.duration.toFixed(1)}с</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Загрузите референс</h3>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="search-image" />
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Референс" className="max-h-40 mx-auto rounded-lg" />
                ) : (
                  <label htmlFor="search-image" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Нажмите для загрузки</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>PNG, JPG до 10МБ</p>
                  </label>
                )}
              </div>
            </div>
          )}

          <button onClick={handleSearch}
            disabled={isSearching || (searchMode === 'fingerprint' ? !selectedFingerprint : !uploadedImage)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium text-sm transition-all disabled:opacity-50">
            {isSearching ? (<><Loader2 className="w-4 h-4 animate-spin" />Поиск...</>) : (<><Search className="w-4 h-4" />Найти похожие эпизоды</>)}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-sm font-semibold">
            Результаты поиска {results.length > 0 && `(${results.length} совпадений)`}
          </h3>
          {results.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-64 text-center rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <Search className="w-12 h-12 text-gray-700 mb-3" />
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Пока нет результатов</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Выберите слепок или загрузите изображение</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {results.map((result, idx) => (
                <div key={result.id}
                  className={`p-4 rounded-xl border hover:border-violet-500/30 transition-colors cursor-pointer ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}
                  onClick={() => { setSelectedFrame(result); setSelectedFrameIdx(idx); }}>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                      <img src={getFrameImage(idx + 80)} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {Math.floor(result.timestamp / 60)}:{Math.floor(result.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-500 mt-0.5">Совпадение: {Math.round(result.confidence * 100)}%</p>
                    </div>
                    <span className={`ml-auto text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>#{idx + 1}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{result.description}</p>
                  <div className="flex gap-2 mt-3">
                    {result.microExpression && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {result.microExpression}
                      </span>
                    )}
                    {result.gesture && (
                      <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        {result.gesture}
                      </span>
                    )}
                  </div>
                  <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                      style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFrame && (
        <FrameViewer frame={selectedFrame} index={selectedFrameIdx + 80} onClose={() => setSelectedFrame(null)} />
      )}
    </div>
  );
}
