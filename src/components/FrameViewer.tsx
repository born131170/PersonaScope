import { X, Clock, Eye, Maximize2 } from 'lucide-react';
import { VideoFrame } from '../types';

// Placeholder frame images for demo
const FRAME_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&h=480&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=480&fit=crop&crop=face',
];

export function getFrameImage(index: number): string {
  return FRAME_IMAGES[index % FRAME_IMAGES.length];
}

interface FrameViewerProps {
  frame: VideoFrame;
  onClose: () => void;
  index?: number;
}

export function FrameViewer({ frame, onClose, index = 0 }: FrameViewerProps) {
  const minutes = Math.floor(frame.timestamp / 60);
  const seconds = Math.floor(frame.timestamp % 60);
  const imageUrl = getFrameImage(index);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Кадр анализа</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                {frame.microExpression && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {frame.microExpression}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Image */}
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
          <img
            src={imageUrl}
            alt={`Frame at ${minutes}:${seconds}`}
            className="w-full h-full object-cover"
          />
          {/* Overlay info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <Maximize2 className="w-4 h-4" />
              <span>Уверенность: {Math.round(frame.confidence * 100)}%</span>
              {frame.gesture && (
                <span className="ml-auto px-2 py-1 rounded-full bg-white/10 text-xs">
                  Жест: {frame.gesture}
                </span>
              )}
            </div>
          </div>
          {/* Timestamp badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm font-mono">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">{frame.description}</p>
          <div className="flex gap-2 mt-3">
            {frame.microExpression && (
              <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                {frame.microExpression}
              </span>
            )}
            {frame.gesture && (
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-violet-500/20">
                {frame.gesture}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Thumbnail component for frame cards
interface FrameThumbnailProps {
  frame: VideoFrame;
  index: number;
  onClick: () => void;
}

export function FrameThumbnail({ frame, index, onClick }: FrameThumbnailProps) {
  const minutes = Math.floor(frame.timestamp / 60);
  const seconds = Math.floor(frame.timestamp % 60);
  const imageUrl = getFrameImage(index);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-violet-500/30 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {frame.microExpression && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {frame.microExpression}
            </span>
          )}
          <span className="text-[10px] text-emerald-500 dark:text-emerald-400 ml-auto">
            {Math.round(frame.confidence * 100)}%
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{frame.description}</p>
      </div>
    </div>
  );
}
