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
  setVideo: (v: VideoFile | null) => void;
  setSettings: (s: Partial<LLMSettings>) => void;
  setAnalysis: (a: AnalysisResult | null) => void;
  setIsAnalyzing: (b: boolean) => void;
  setCurrentTab: (t: string) => void;
  addFingerprint: (fp: DigitalFingerprint) => void;
  removeFingerprint: (id: string) => void;
  setSearchResults: (r: VideoFrame[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  video: null,
  settings: { provider: 'openai', apiKey: '', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1', temperature: 0.3, maxTokens: 4096 },
  analysis: null,
  isAnalyzing: false,
  currentTab: 'upload',
  fingerprints: [],
  searchResults: [],
  setVideo: (video) => set({ video }),
  setSettings: (settings) => set((s) => ({ settings: { ...s.settings, ...settings } })),
  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (b) => set({ isAnalyzing: b }),
  setCurrentTab: (t) => set({ currentTab: t }),
  addFingerprint: (fp) => set((s) => ({ fingerprints: [...s.fingerprints, fp] })),
  removeFingerprint: (id) => set((s) => ({ fingerprints: s.fingerprints.filter(f => f.id !== id) })),
  setSearchResults: (r) => set({ searchResults: r }),
}));
