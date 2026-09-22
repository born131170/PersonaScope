import { create } from 'zustand';
import { AppState, VideoFile, LLMSettings, AnalysisResult, DigitalFingerprint, VideoFrame } from '../types';

interface AppStore extends AppState {
  setVideo: (video: VideoFile | null) => void;
  setSettings: (settings: Partial<LLMSettings>) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setCurrentTab: (tab: string) => void;
  addFingerprint: (fp: DigitalFingerprint) => void;
  removeFingerprint: (id: string) => void;
  setSearchResults: (results: VideoFrame[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  video: null,
  settings: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4-vision-preview',
    baseUrl: 'https://api.openai.com/v1',
    temperature: 0.3,
    maxTokens: 4096,
  },
  analysis: null,
  isAnalyzing: false,
  currentTab: 'upload',
  fingerprints: [],
  searchResults: [],

  setVideo: (video) => set({ video }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setCurrentTab: (currentTab) => set({ currentTab }),
  addFingerprint: (fp) => set((state) => ({ fingerprints: [...state.fingerprints, fp] })),
  removeFingerprint: (id) => set((state) => ({ fingerprints: state.fingerprints.filter(f => f.id !== id) })),
  setSearchResults: (searchResults) => set({ searchResults }),
}));
