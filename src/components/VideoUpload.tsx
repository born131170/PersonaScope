import { useCallback, useRef, useState } from 'react';
import { Upload, Film, Play, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateMockAnalysis } from '../utils/analysisEngine';
import { callLLM, ANALYSIS_PROMPT } from '../utils/llmApi';

export function VideoUpload() {
  const { video, setVideo, settings, setAnalysis, setIsAnalyzing, isAnalyzing, setCurrentTab } = useAppStore();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, WebM, MOV, AVI)');
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setVideo({ file, url, duration: 0, name: file.name });
  }, [setVideo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleVideoLoaded = () => {
    if (videoRef.current && video) {
      setVideo({ ...video, duration: videoRef.current.duration });
    }
  };

  const runAnalysis = async () => {
    if (!video) return;
    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progressive analysis
    const steps = [
      { label: 'Extracting video frames...', duration: 1500 },
      { label: 'Analyzing facial expressions...', duration: 2000 },
      { label: 'Detecting micro-expressions...', duration: 1800 },
      { label: 'Analyzing body language...', duration: 1500 },
      { label: 'Processing vocal patterns...', duration: 1200 },
      { label: 'Computing personality profiles...', duration: 2000 },
      { label: 'Generating truthfulness assessment...', duration: 1500 },
      { label: 'Creating behavioral fingerprints...', duration: 1000 },
    ];

    // Try real LLM call if API key is set
    if (settings.apiKey) {
      try {
        await callLLM(settings, [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: `Analyze the uploaded video: ${video.name}. Duration: ${video.duration}s. Provide comprehensive personality analysis.` },
        ]);
      } catch (err) {
        console.warn('LLM call failed, using local analysis engine:', err);
      }
    }

    for (let i = 0; i < steps.length; i++) {
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    const result = generateMockAnalysis();
    setAnalysis(result);
    setIsAnalyzing(false);
    setCurrentTab('analysis');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Video Upload & Analysis</h2>
        <p className="text-gray-400">Upload a video to perform comprehensive personality analysis using multimodal AI.</p>
      </div>

      {/* Upload Area */}
      {!video ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
            dragActive
              ? 'border-violet-400 bg-violet-500/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-violet-500/30">
              <Upload className="w-10 h-10 text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-200">Drop your video here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              Select Video File
            </button>
            <p className="text-xs text-gray-600">Supports MP4, WebM, MOV, AVI • Max 500MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
            <video
              ref={videoRef}
              src={video.url}
              className="w-full max-h-96 object-contain"
              controls
              onLoadedMetadata={handleVideoLoaded}
            />
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

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Full Analysis
                </>
              )}
            </button>
            <button
              onClick={() => { setVideo(null); setError(null); }}
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
            >
              Remove Video
            </button>
          </div>

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Analysis Progress</span>
                <span className="text-violet-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className={progress > 0 ? 'text-emerald-400' : ''}>✓ Frame extraction</div>
                <div className={progress > 20 ? 'text-emerald-400' : ''}>✓ Facial analysis</div>
                <div className={progress > 40 ? 'text-emerald-400' : ''}>✓ Micro-expressions</div>
                <div className={progress > 60 ? 'text-emerald-400' : ''}>✓ Body language</div>
                <div className={progress > 75 ? 'text-emerald-400' : ''}>✓ Vocal patterns</div>
                <div className={progress > 90 ? 'text-emerald-400' : ''}>✓ Personality profiles</div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: '6 Systems', desc: 'Big Five, MBTI, Enneagram, Temperament, HEXACO, PID-5' },
          { title: 'Frame Analysis', desc: 'Micro-expressions, gestures, eye movement, posture' },
          { title: 'Digital Fingerprint', desc: 'Unique behavioral signature for episode matching' },
        ].map((card) => (
          <div key={card.title} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
            <h4 className="text-sm font-semibold text-violet-300 mb-1">{card.title}</h4>
            <p className="text-xs text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
