import { X, Clock, Eye, Maximize2 } from 'lucide-react';
import { VideoFrame } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';

// Запасные изображения если нет реальных кадров
const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=480&fit=crop&crop=face',
];

export const getFrameImage = (i: number) => FALLBACK_IMGS[i % FALLBACK_IMGS.length];

// Получить реальное изображение кадра из извлечённых
function useFrameImage(frame: VideoFrame, index: number): string {
  const { extractedFrames } = useAppStore();
  if (frame.imageData) return frame.imageData;
  // Ищем ближайший извлечённый кадр по timestamp
  const closest = extractedFrames.reduce((prev, curr) =>
    Math.abs(curr.timestamp - frame.timestamp) < Math.abs(prev.timestamp - frame.timestamp) ? curr : prev
  , extractedFrames[0]);
  return closest?.imageData || getFrameImage(index);
}

export function FrameViewer({ frame, onClose, index = 0 }: { frame: VideoFrame; onClose: () => void; index?: number }) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const m = Math.floor(frame.timestamp / 60), s = Math.floor(frame.timestamp % 60);
  const imgSrc = frame.imageData || getFrameImage(index);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`relative max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center"><Eye className="w-4 h-4 text-violet-400" /></div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Кадр из видео</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" /><span>{m}:{s.toString().padStart(2, '0')}</span>
                {frame.microExpression && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">{frame.microExpression}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="relative aspect-video bg-gray-800">
          <img src={imgSrc} alt="" className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <Maximize2 className="w-4 h-4" /><span>Уверенность: {Math.round(frame.confidence * 100)}%</span>
              {frame.gesture && <span className="ml-auto px-2 py-1 rounded-full bg-white/10 text-xs">Жест: {frame.gesture}</span>}
            </div>
          </div>
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm font-mono">{m}:{s.toString().padStart(2, '0')}</div>
        </div>
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{frame.description}</p>
          <div className="flex gap-2 mt-3">
            {frame.microExpression && <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">{frame.microExpression}</span>}
            {frame.gesture && <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{frame.gesture}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FrameThumbnail({ frame, index, onClick }: { frame: VideoFrame; index: number; onClick: () => void }) {
  const { theme } = useThemeStore();
  const { extractedFrames } = useAppStore();
  const isDark = theme === 'dark';
  const m = Math.floor(frame.timestamp / 60), s = Math.floor(frame.timestamp % 60);
  
  // Реальный кадр из видео или запасной
  const closest = extractedFrames.reduce((prev, curr) =>
    Math.abs(curr.timestamp - frame.timestamp) < Math.abs(prev.timestamp - frame.timestamp) ? curr : prev
  , extractedFrames[0]);
  const imgSrc = frame.imageData || closest?.imageData || getFrameImage(index);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border hover:border-violet-500/30 transition-all cursor-pointer group ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`} onClick={onClick}>
      <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
        <img src={imgSrc} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">{m}:{s.toString().padStart(2, '0')}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {frame.microExpression && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{frame.microExpression}</span>}
          <span className="text-[10px] text-emerald-500 ml-auto">{Math.round(frame.confidence * 100)}%</span>
        </div>
        <p className={`text-xs mt-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{frame.description}</p>
      </div>
    </div>
  );
}
