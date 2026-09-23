import { create } from 'zustand';
import { VideoFile, LLMSettings, AnalysisResult, DigitalFingerprint, VideoFrame } from '../types';

interface AppStore {
  video: VideoFile | null;
  settings: LLMSettings;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  currentTab: string;
  fingerprints: DigitalFingerprint[];
  searchResults: VideoFrame[];
  extractedFrames: { timestamp: number; imageData: string }[];
  isDemoMode: boolean;
  setVideo: (v: VideoFile | null) => void;
  setSettings: (s: Partial<LLMSettings>) => void;
  setAnalysis: (a: AnalysisResult | null) => void;
  setIsAnalyzing: (b: boolean) => void;
  setCurrentTab: (t: string) => void;
  addFingerprint: (fp: DigitalFingerprint) => void;
  removeFingerprint: (id: string) => void;
  setSearchResults: (r: VideoFrame[]) => void;
  setExtractedFrames: (f: { timestamp: number; imageData: string }[]) => void;
  setIsDemoMode: (b: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  video: null,
  settings: { provider: 'custom', apiKey: '', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1', temperature: 0.3, maxTokens: 4096 },
  analysis: null,
  isAnalyzing: false,
  currentTab: 'upload',
  fingerprints: [],
  searchResults: [],
  extractedFrames: [],
  isDemoMode: true,
  setVideo: (video) => set({ video, extractedFrames: [], analysis: null }),
  setSettings: (settings) => set((s) => ({ settings: { ...s.settings, ...settings } })),
  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (b) => set({ isAnalyzing: b }),
  setCurrentTab: (t) => set({ currentTab: t }),
  addFingerprint: (fp) => set((s) => ({ fingerprints: [...s.fingerprints, fp] })),
  removeFingerprint: (id) => set((s) => ({ fingerprints: s.fingerprints.filter(f => f.id !== id) })),
  setSearchResults: (r) => set({ searchResults: r }),
  setExtractedFrames: (f) => set({ extractedFrames: f }),
  setIsDemoMode: (b) => set({ isDemoMode: b }),
}));
