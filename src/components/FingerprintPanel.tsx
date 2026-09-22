import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateFingerprint } from '../utils/analysisEngine';
import { Fingerprint, Plus, Trash2, Clock, Play, Pause, Camera, Activity } from 'lucide-react';

export function FingerprintPanel() {
  const { video, fingerprints, addFingerprint, removeFingerprint } = useAppStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [windowStart, setWindowStart] = useState(0);
  const [windowEnd, setWindowEnd] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const captureFingerprint = () => {
    const fp = generateFingerprint(windowStart, windowEnd - windowStart);
    addFingerprint(fp);
    setIsRecording(false);
  };

  const startRecording = () => {
    setWindowStart(currentTime);
    setWindowEnd(currentTime + 5);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setWindowEnd(currentTime);
    captureFingerprint();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Digital Fingerprint</h2>
        <p className="text-gray-400">Create behavioral signatures from video segments for pattern matching and episode search.</p>
      </div>

      {!video ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Fingerprint className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Video Loaded</h3>
          <p className="text-gray-600">Upload a video first to create digital fingerprints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {/* Video & Controls */}
          <div className="col-span-2 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
              <video
                ref={videoRef}
                src={video.url}
                className="w-full max-h-80 object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={video.duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        if (videoRef.current) videoRef.current.currentTime = time;
                        setCurrentTime(time);
                      }}
                      className="w-full accent-violet-500"
                    />
                  </div>
                  <span className="text-sm text-gray-300 font-mono">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Window Selector */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Time Window Selection
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start (seconds)</label>
                  <input
                    type="number"
                    value={windowStart.toFixed(1)}
                    onChange={(e) => setWindowStart(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max={video.duration}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End (seconds)</label>
                  <input
                    type="number"
                    value={windowEnd.toFixed(1)}
                    onChange={(e) => setWindowEnd(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max={video.duration}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="absolute h-full bg-violet-500/20 border-x-2 border-violet-500 transition-all"
                  style={{
                    left: `${(windowStart / (video.duration || 1)) * 100}%`,
                    width: `${((windowEnd - windowStart) / (video.duration || 1)) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-cyan-400 transition-all"
                  style={{ left: `${(currentTime / (video.duration || 1)) * 100}%` }}
                />
                {/* Fingerprint markers */}
                {fingerprints.map((fp) => (
                  <div
                    key={fp.id}
                    className="absolute top-1 bottom-1 w-2 bg-amber-500/60 rounded-full"
                    style={{ left: `${(fp.timestamp / (video.duration || 1)) * 100}%` }}
                    title={fp.name}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {isRecording ? 'Stop & Capture' : 'Set Window'}
                </button>
                <button
                  onClick={captureFingerprint}
                  disabled={isRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  Generate Fingerprint
                </button>
              </div>
            </div>
          </div>

          {/* Fingerprints List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">
                Saved Fingerprints ({fingerprints.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {fingerprints.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-gray-900/30 border border-gray-800">
                  <Fingerprint className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No fingerprints yet</p>
                  <p className="text-xs text-gray-600 mt-1">Select a time window and capture</p>
                </div>
              ) : (
                fingerprints.map((fp) => (
                  <div key={fp.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-violet-500/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{fp.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Duration: {fp.duration.toFixed(1)}s
                        </p>
                      </div>
                      <button
                        onClick={() => removeFingerprint(fp.id)}
                        className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {fp.features.facialLandmarks.slice(0, 10).map((v, i) => (
                        <div
                          key={i}
                          className="h-6 rounded bg-gradient-to-t from-violet-500/40 to-cyan-500/40"
                          style={{ opacity: 0.3 + v * 0.7 }}
                          title={`Feature ${i}: ${v.toFixed(3)}`}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Activity className="w-3 h-3" />
                      <span>{fp.frames.length} frames captured</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
