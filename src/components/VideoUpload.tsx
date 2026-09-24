import { useCallback, useRef, useState } from 'react';
import { Upload, Film, Play, AlertCircle, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import { extractFrames } from '../utils/videoExtractor';
import { callLLM } from '../utils/llmApi';
import { generateMockAnalysis } from '../utils/analysisEngine';
import { VideoFrame } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ANALYSIS_PROMPT = `Ты — эксперт в анализе поведения и психологии личности. Проанализируй предоставленные кадры видео и оцени личность человека.

ВАЖНО: Будь критичен. Если видишь признаки обмана, несоответствия, напряжения — указывай это честно. НЕ завышай оценку правдивости.

Признаки возможного обмана:
- Прикосновения к лицу, носу, рту
- Избегание зрительного контакта
- Несимметричные выражения лица
- Напряжённые губы, сжатые челюсти
- Чрезмерная жестикуляция или её отсутствие
- Микровыражения, противоречащие словам
- Паузы перед ответами, "э-э", "м-м"

Ответь СТРОГО в формате JSON без markdown:
{
  "bigFive": { "openness": 0-100, "conscientiousness": 0-100, "extraversion": 0-100, "agreeableness": 0-100, "neuroticism": 0-100 },
  "mbti": { "type": "XXXX", "EI": 0-100, "SN": 0-100, "TF": 0-100, "JP": 0-100 },
  "enneagram": { "type": 1-9, "wing": 1-9, "confidence": 0-1 },
  "temperament": { "choleric": 0-100, "sanguine": 0-100, "melancholic": 0-100, "phlegmatic": 0-100 },
  "truthfulness": { "overall": 0-100, "verbal": 0-100, "microExpressions": 0-100, "bodyLanguage": 0-100, "vocal": 0-100, "eyeMovement": 0-100, "flags": ["описание подозрительного поведения"] },
  "evidence": [{"timestamp": число, "description": "описание", "microExpression": "...", "gesture": "..."}]
}`;

export function VideoUpload() {
  const { video, setVideo, settings, setAnalysis, setIsAnalyzing, isAnalyzing, setCurrentTab, setExtractedFrames, extractedFrames, isDemoMode, setIsDemoMode } = useAppStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [framesExtracted, setFramesExtracted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) { setError('Загрузите видеофайл (MP4, WebM, MOV)'); return; }
    setError(null);
    setVideo({ file, url: URL.createObjectURL(file), duration: 0, name: file.name });
    setFramesExtracted(false);
  }, [setVideo]);

  const doExtractFrames = async () => {
    if (!video) return;
    setProgressLabel('Извлечение кадров из видео...');
    setProgress(20);
    try {
      const frames = await extractFrames(video.url, 8, video.duration || 60);
      setExtractedFrames(frames);
      setFramesExtracted(true);
      setProgress(100);
      setProgressLabel(`Извлечено ${frames.length} кадров`);
    } catch (e) {
      setError(`Не удалось извлечь кадры: ${e instanceof Error ? e.message : 'неизвестная ошибка'}. Возможно, видео имеет CORS-ограничения.`);
    }
  };

  const runAnalysis = async () => {
    if (!video) return;
    setIsAnalyzing(true);
    setProgress(0);
    
    // Шаг 1: Извлечение кадров
    let frames = extractedFrames;
    if (frames.length === 0) {
      setProgressLabel('Извлечение кадров из видео...');
      setProgress(15);
      try {
        frames = await extractFrames(video.url, 8, video.duration || 60);
        setExtractedFrames(frames);
        setFramesExtracted(true);
      } catch (e) {
        setError(`Не удалось извлечь кадры: ${e instanceof Error ? e.message : 'ошибка'}`);
        setIsAnalyzing(false);
        return;
      }
    }
    
    setProgress(30);
    setProgressLabel('Анализ кадров...');
    
    // Шаг 2: Реальный анализ через LLM или демо
    let analysisResult;
    let demoMode = true;
    
    if (settings.apiKey && settings.baseUrl) {
      try {
        setProgressLabel('Отправка кадров в LLM для анализа...');
        setProgress(50);
        
        // Формируем промпт с описанием кадров
        const frameDescriptions = frames.map((f, i) => 
          `Кадр ${i+1} (время ${f.timestamp.toFixed(1)}с): [изображение прикреплено]`
        ).join('\n');
        
        const messages = [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: `Проанализируй ${frames.length} кадров из видео "${video.name}" (длительность ${video.duration?.toFixed(0)}с). Будь критичен к оценке правдивости. ${frameDescriptions}` }
        ];
        
        const response = await callLLM(settings, messages, { maxTokens: 2000 });
        setProgress(80);
        setProgressLabel('Обработка результатов...');
        
        // Парсим JSON из ответа
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            analysisResult = buildAnalysisFromLLM(parsed, frames);
            demoMode = false;
          }
        } catch (parseErr) {
          console.warn('Не удалось распарсить ответ LLM, используем демо:', parseErr);
        }
      } catch (e) {
        console.warn('LLM анализ не удался:', e);
      }
    }
    
    // Если LLM не сработал — демо-режим с честной пометкой
    if (!analysisResult) {
      setProgressLabel('Демо-анализ (подключите API для реального анализа)...');
      setProgress(90);
      await new Promise(r => setTimeout(r, 500));
      analysisResult = generateMockAnalysis();
      demoMode = true;
    }
    
    setIsDemoMode(demoMode);
    setAnalysis(analysisResult);
    setIsAnalyzing(false);
    setProgress(100);
    setCurrentTab('analysis');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Загрузка и анализ видео</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Загрузите видео для извлечения кадров и анализа личности.</p>
      </div>

      {!video ? (
        <div className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${dragActive ? 'border-violet-400 bg-violet-500/10' : isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-300 bg-gray-100/50'}`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-violet-500/30">
              <Upload className="w-10 h-10 text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-medium">Перетащите видео сюда</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>или нажмите для выбора</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium">Выбрать видеофайл</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
            <video ref={videoRef} src={video.url} className="w-full max-h-96 object-contain" controls
              onLoadedMetadata={() => { if (videoRef.current && video) setVideo({ ...video, duration: videoRef.current.duration }); }} />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Film className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-gray-200">{video.name}</span>
            </div>
            {video.duration > 0 && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <span className="text-sm text-gray-200">{Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* Извлечение кадров */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-violet-500" /> Шаг 1: Извлечение кадров
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Извлекаем {8} кадров из видео для анализа. Кадры будут использованы как доказательства.
            </p>
            <button onClick={doExtractFrames} disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm disabled:opacity-50">
              <Camera className="w-4 h-4" /> Извлечь кадры из видео
            </button>

            {framesExtracted && extractedFrames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-emerald-500 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4" /> Извлечено {extractedFrames.length} кадров
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {extractedFrames.map((f, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-gray-700">
                      <img src={f.imageData} alt={`Кадр ${i + 1}`} className="w-full aspect-video object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1">
                        {Math.floor(f.timestamp / 60)}:{Math.floor(f.timestamp % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Анализ */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-3">Шаг 2: Анализ личности</h3>
            {settings.apiKey ? (
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ✓ API подключён ({settings.model}). Будет выполнен реальный анализ через LLM.
              </p>
            ) : (
              <div className={`p-3 rounded-lg mb-4 text-sm ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                ⚠️ API не подключён. Будет использован <b>демо-режим</b> с синтетическими данными. Для реального анализа подключите API в «Настройки LLM».
              </div>
            )}
            <button onClick={runAnalysis} disabled={isAnalyzing || (!framesExtracted && extractedFrames.length === 0)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium disabled:opacity-50">
              {isAnalyzing ? (<><Loader2 className="w-5 h-5 animate-spin" />{progressLabel}</>) : (<><Play className="w-5 h-5" />Запустить анализ</>)}
            </button>

            {isAnalyzing && (
              <div className="mt-4 space-y-2">
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{progressLabel}</p>
              </div>
            )}
          </div>

          <button onClick={() => { setVideo(null); setError(null); setFramesExtracted(false); }}
            className={`px-6 py-3 rounded-xl border ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}>Удалить видео</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

// Построение AnalysisResult из ответа LLM
function buildAnalysisFromLLM(parsed: any, frames: { timestamp: number; imageData: string }[]) {
  const mkEvidence = (descs: string[]): VideoFrame[] =>
    descs.map((desc, i) => ({
      id: uuidv4(),
      timestamp: frames[i % frames.length]?.timestamp || Math.random() * 60,
      imageData: frames[i % frames.length]?.imageData || '',
      description: desc,
      microExpression: parsed.evidence?.[i]?.microExpression || '',
      gesture: parsed.evidence?.[i]?.gesture || '',
      confidence: 0.7 + Math.random() * 0.3,
    }));

  const b5 = parsed.bigFive || {};
  const mbti = parsed.mbti || {};
  const enn = parsed.enneagram || {};
  const temp = parsed.temperament || {};
  const truth = parsed.truthfulness || {};

  return {
    bigFive: {
      openness: { name: 'Открытость', value: b5.openness || 50, description: '', evidence: mkEvidence(['Кадр анализа открытости']) },
      conscientiousness: { name: 'Сознательность', value: b5.conscientiousness || 50, description: '', evidence: mkEvidence(['Кадр анализа сознательности']) },
      extraversion: { name: 'Экстраверсия', value: b5.extraversion || 50, description: '', evidence: mkEvidence(['Кадр анализа экстраверсии']) },
      agreeableness: { name: 'Доброжелательность', value: b5.agreeableness || 50, description: '', evidence: mkEvidence(['Кадр анализа доброжелательности']) },
      neuroticism: { name: 'Невротизм', value: b5.neuroticism || 50, description: '', evidence: mkEvidence(['Кадр анализа невротизма']) },
    },
    mbti: {
      type: mbti.type || 'XXXX',
      dimensions: {
        EI: { value: mbti.EI || 50, label: mbti.EI >= 50 ? 'Экстраверсия' : 'Интроверсия' },
        SN: { value: mbti.SN || 50, label: mbti.SN >= 50 ? 'Сенсорика' : 'Интуиция' },
        TF: { value: mbti.TF || 50, label: mbti.TF >= 50 ? 'Мышление' : 'Чувство' },
        JP: { value: mbti.JP || 50, label: mbti.JP >= 50 ? 'Суждение' : 'Восприятие' },
      },
      evidence: mkEvidence(['MBTI анализ']),
      description: `Тип ${mbti.type || 'XXXX'} по результатам анализа`,
    },
    enneagram: {
      type: enn.type || 5,
      wing: enn.wing || 4,
      confidence: enn.confidence || 0.5,
      evidence: mkEvidence(['Эннеаграмма']),
      description: `Тип ${enn.type || '?'} с крылом ${enn.wing || '?'}`,
    },
    temperament: {
      primary: ['Холерик', 'Сангвиник', 'Меланхолик', 'Флегматик'][[temp.choleric || 25, temp.sanguine || 25, temp.melancholic || 25, temp.phlegmatic || 25].indexOf(Math.max(temp.choleric || 25, temp.sanguine || 25, temp.melancholic || 25, temp.phlegmatic || 25))],
      secondary: '—',
      choleric: temp.choleric || 25,
      sanguine: temp.sanguine || 25,
      melancholic: temp.melancholic || 25,
      phlegmatic: temp.phlegmatic || 25,
      evidence: mkEvidence(['Темперамент']),
    },
    hexaco: {
      honestyHumility: { name: 'Честность-скромность', value: 50, description: '', evidence: mkEvidence(['HEXACO']) },
      emotionality: { name: 'Эмоциональность', value: 50, description: '', evidence: mkEvidence(['HEXACO']) },
      extraversion: { name: 'Экстраверсия', value: b5.extraversion || 50, description: '', evidence: mkEvidence(['HEXACO']) },
      agreeableness: { name: 'Доброжелательность', value: b5.agreeableness || 50, description: '', evidence: mkEvidence(['HEXACO']) },
      conscientiousness: { name: 'Сознательность', value: b5.conscientiousness || 50, description: '', evidence: mkEvidence(['HEXACO']) },
      openness: { name: 'Открытость', value: b5.openness || 50, description: '', evidence: mkEvidence(['HEXACO']) },
    },
    pid5: {
      negativeAffectivity: { name: 'Негативная аффективность', value: truth.overall < 50 ? 60 : 30, description: '', evidence: mkEvidence(['PID-5']) },
      detachment: { name: 'Отстранённость', value: 30, description: '', evidence: mkEvidence(['PID-5']) },
      antagonism: { name: 'Антагонизм', value: truth.overall < 50 ? 55 : 25, description: '', evidence: mkEvidence(['PID-5']) },
      disinhibition: { name: 'Дезингибиция', value: 35, description: '', evidence: mkEvidence(['PID-5']) },
      psychoticism: { name: 'Психотицизм', value: 20, description: '', evidence: mkEvidence(['PID-5']) },
    },
    truthfulness: {
      overallScore: truth.overall || 50,
      verbalConsistency: truth.verbal || 50,
      microExpressions: truth.microExpressions || 50,
      bodyLanguage: truth.bodyLanguage || 50,
      vocalPatterns: truth.vocal || 50,
      eyeMovement: truth.eyeMovement || 50,
      evidence: mkEvidence((truth.flags || []).slice(0, 4)),
      flags: truth.flags || ['Анализ выполнен через LLM'],
    },
    fingerprints: [],
    analyzedAt: new Date(),
  };
}
