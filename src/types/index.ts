export interface LLMSettings {
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
}

export interface VideoFrame {
  id: string;
  timestamp: number;
  imageData: string;
  description: string;
  microExpression?: string;
  gesture?: string;
  confidence: number;
}

export interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
  evidence: VideoFrame[];
}

export interface BigFiveResult {
  openness: PersonalityTrait;
  conscientiousness: PersonalityTrait;
  extraversion: PersonalityTrait;
  agreeableness: PersonalityTrait;
  neuroticism: PersonalityTrait;
}

export interface MBTIResult {
  type: string;
  dimensions: {
    EI: { value: number; label: string };
    SN: { value: number; label: string };
    TF: { value: number; label: string };
    JP: { value: number; label: string };
  };
  evidence: VideoFrame[];
  description: string;
}

export interface EnneagramResult {
  type: number;
  wing: number;
  confidence: number;
  evidence: VideoFrame[];
  description: string;
}

export interface TemperamentResult {
  primary: string;
  secondary: string;
  choleric: number;
  sanguine: number;
  melancholic: number;
  phlegmatic: number;
  evidence: VideoFrame[];
}

export interface HEXACOResult {
  honestyHumility: PersonalityTrait;
  emotionality: PersonalityTrait;
  extraversion: PersonalityTrait;
  agreeableness: PersonalityTrait;
  conscientiousness: PersonalityTrait;
  openness: PersonalityTrait;
}

export interface PID5Result {
  negativeAffectivity: PersonalityTrait;
  detachment: PersonalityTrait;
  antagonism: PersonalityTrait;
  disinhibition: PersonalityTrait;
  psychoticism: PersonalityTrait;
}

export interface TruthfulnessResult {
  overallScore: number;
  verbalConsistency: number;
  microExpressions: number;
  bodyLanguage: number;
  vocalPatterns: number;
  eyeMovement: number;
  evidence: VideoFrame[];
  flags: string[];
}

export interface DigitalFingerprint {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  features: {
    facialLandmarks: number[];
    gestureVectors: number[];
    microExpressionPattern: number[];
    vocalFeatures: number[];
    postureVector: number[];
  };
  frames: VideoFrame[];
  createdAt: Date;
}

export interface AnalysisResult {
  bigFive: BigFiveResult;
  mbti: MBTIResult;
  enneagram: EnneagramResult;
  temperament: TemperamentResult;
  hexaco: HEXACOResult;
  pid5: PID5Result;
  truthfulness: TruthfulnessResult;
  fingerprints: DigitalFingerprint[];
  analyzedAt: Date;
}

export interface VideoFile {
  file: File;
  url: string;
  duration: number;
  name: string;
}
