import { v4 as uuidv4 } from 'uuid';
import { AnalysisResult, VideoFrame, DigitalFingerprint } from '../types';

const generateFrames = (count: number, descriptions: string[]): VideoFrame[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    timestamp: Math.random() * 120,
    imageData: '',
    description: descriptions[i % descriptions.length],
    microExpression: ['Micro-smile', 'Blink rate increase', 'Eyebrow raise', 'Lip compression', 'Head tilt'][Math.floor(Math.random() * 5)],
    gesture: ['Open palm', 'Self-touch', 'Crossed arms', 'Pointing', 'Nodding'][Math.floor(Math.random() * 5)],
    confidence: 0.6 + Math.random() * 0.4,
  }));
};

export const generateMockAnalysis = (): AnalysisResult => {
  return {
    bigFive: {
      openness: {
        name: 'Openness',
        value: 78,
        description: 'High openness to experience. Shows curiosity, creativity, and willingness to try new things.',
        evidence: generateFrames(4, [
          'Subject shows animated facial expressions when discussing novel concepts',
          'Widened eyes and raised eyebrows indicate intellectual curiosity',
          'Leaning forward posture suggests engagement with new ideas',
          'Spontaneous gestures while describing abstract concepts',
        ]),
      },
      conscientiousness: {
        name: 'Conscientiousness',
        value: 65,
        description: 'Moderately conscientious. Organized but flexible approach to tasks.',
        evidence: generateFrames(3, [
          'Structured speech patterns indicate organized thinking',
          'Periodic self-correction shows attention to detail',
          'Balanced posture suggests controlled yet adaptable demeanor',
        ]),
      },
      extraversion: {
        name: 'Extraversion',
        value: 72,
        description: 'Moderately extraverted. Sociable and expressive but also comfortable with solitude.',
        evidence: generateFrames(4, [
          'Frequent smiling and open body language',
          'Animated hand gestures during storytelling',
          'Direct eye contact with camera/audience',
          'Vocal variety and expressive tone',
        ]),
      },
      agreeableness: {
        name: 'Agreeableness',
        value: 81,
        description: 'High agreeableness. Cooperative, empathetic, and considerate of others.',
        evidence: generateFrames(3, [
          'Warm smile and nodding during agreement',
          'Open palm gestures suggesting honesty and openness',
          'Soft facial expressions when discussing interpersonal topics',
        ]),
      },
      neuroticism: {
        name: 'Neuroticism',
        value: 35,
        description: 'Low neuroticism. Emotionally stable and resilient under pressure.',
        evidence: generateFrames(3, [
          'Consistent baseline expression with minimal anxiety indicators',
          'Steady gaze and controlled breathing patterns',
          'Smooth transitions between emotional states',
        ]),
      },
    },
    mbti: {
      type: 'ENFJ',
      dimensions: {
        EI: { value: 72, label: 'Extraversion' },
        SN: { value: 38, label: 'Intuition' },
        TF: { value: 68, label: 'Feeling' },
        JP: { value: 55, label: 'Judging' },
      },
      evidence: generateFrames(5, [
        'Expressive communication style suggests Extraversion',
        'Abstract language and future-oriented statements indicate Intuition',
        'Empathetic responses and value-based decisions suggest Feeling',
        'Structured approach to topics indicates Judging preference',
        'Charismatic presence and natural leadership cues',
      ]),
      description: 'The Protagonist - Charismatic and inspiring leader who can mesmerize listeners. Natural-born leaders full of passion and charisma.',
    },
    enneagram: {
      type: 2,
      wing: 3,
      confidence: 0.74,
      evidence: generateFrames(4, [
        'Helper patterns: frequent offers of assistance in speech',
        'Achievement-oriented body language (Type 3 wing)',
        'Warm, engaging presence typical of Type 2',
        'Image-conscious gestures suggest 2w3 combination',
      ]),
      description: 'Type 2 (The Helper) with a 3 wing. Helpful, caring, and ambitious. Seeks to be loved and appreciated while maintaining a successful image.',
    },
    temperament: {
      primary: 'Sanguine',
      secondary: 'Choleric',
      choleric: 30,
      sanguine: 42,
      melancholic: 12,
      phlegmatic: 16,
      evidence: generateFrames(3, [
        'Enthusiastic and expressive demeanor (Sanguine)',
        'Quick decision-making and assertiveness (Choleric)',
        'Optimistic outlook and social engagement',
      ]),
    },
    hexaco: {
      honestyHumility: {
        name: 'Honesty-Humility',
        value: 72,
        description: 'Generally sincere and modest, with genuine communication style.',
        evidence: generateFrames(3, [
          'Consistent verbal and non-verbal communication',
          'No signs of manipulation or deception',
          'Humble self-references and acknowledgment of limitations',
        ]),
      },
      emotionality: {
        name: 'Emotionality',
        value: 45,
        description: 'Moderate emotional sensitivity. Balanced emotional responses.',
        evidence: generateFrames(2, [
          'Appropriate emotional responses to topics',
          'Comfortable discussing feelings without excessive vulnerability',
        ]),
      },
      extraversion: {
        name: 'Extraversion',
        value: 75,
        description: 'Socially confident and lively in interactions.',
        evidence: generateFrames(3, [
          'High energy in social expressions',
          'Comfortable being center of attention',
          'Enthusiastic engagement with topics',
        ]),
      },
      agreeableness: {
        name: 'Agreeableness',
        value: 78,
        description: 'Forgiving and gentle in interactions.',
        evidence: generateFrames(2, [
          'Patient listening behaviors',
          'Non-confrontational communication style',
        ]),
      },
      conscientiousness: {
        name: 'Conscientiousness',
        value: 68,
        description: 'Organized and disciplined approach.',
        evidence: generateFrames(2, [
          'Methodical presentation of ideas',
          'Attention to detail in explanations',
        ]),
      },
      openness: {
        name: 'Openness',
        value: 80,
        description: 'Highly open to new experiences and ideas.',
        evidence: generateFrames(3, [
          'Enthusiastic about novel concepts',
          'Creative and unconventional thinking patterns',
          'Appreciation for art and aesthetics',
        ]),
      },
    },
    pid5: {
      negativeAffectivity: {
        name: 'Negative Affectivity',
        value: 28,
        description: 'Low levels of negative emotional experiences.',
        evidence: generateFrames(2, [
          'Minimal signs of emotional distress',
          'Stable positive affect baseline',
        ]),
      },
      detachment: {
        name: 'Detachment',
        value: 22,
        description: 'Well-connected socially and emotionally engaged.',
        evidence: generateFrames(2, [
          'Active social engagement indicators',
          'Emotional warmth and connection',
        ]),
      },
      antagonism: {
        name: 'Antagonism',
        value: 18,
        description: 'Low antagonism. Cooperative and empathetic.',
        evidence: generateFrames(2, [
          'Collaborative communication style',
          'Respectful and considerate expressions',
        ]),
      },
      disinhibition: {
        name: 'Disinhibition',
        value: 32,
        description: 'Moderate impulse control with appropriate restraint.',
        evidence: generateFrames(2, [
          'Balanced impulsivity indicators',
          'Appropriate self-regulation',
        ]),
      },
      psychoticism: {
        name: 'Psychoticism',
        value: 15,
        description: 'Very low levels. Clear and grounded thinking.',
        evidence: generateFrames(2, [
          'Coherent and logical thought patterns',
          'Reality-grounded communication',
        ]),
      },
    },
    truthfulness: {
      overallScore: 82,
      verbalConsistency: 85,
      microExpressions: 78,
      bodyLanguage: 80,
      vocalPatterns: 84,
      eyeMovement: 83,
      evidence: generateFrames(4, [
        'Consistent verbal narrative with no contradictions detected',
        'Micro-expressions align with stated emotions',
        'Open body language throughout the recording',
        'Natural vocal patterns without stress indicators',
      ]),
      flags: [
        'Minor hesitation detected at 0:34 - possible recall effort (not deception)',
        'Brief gaze aversion at 1:12 - consistent with creative thinking',
        'Slight increase in blink rate at 2:45 - cognitive load, not deception',
      ],
    },
    fingerprints: [],
    analyzedAt: new Date(),
  };
};

export const generateFingerprint = (timestamp: number, duration: number): DigitalFingerprint => {
  return {
    id: uuidv4(),
    name: `Fingerprint @ ${timestamp.toFixed(1)}s`,
    timestamp,
    duration,
    features: {
      facialLandmarks: Array.from({ length: 68 }, () => Math.random()),
      gestureVectors: Array.from({ length: 12 }, () => Math.random()),
      microExpressionPattern: Array.from({ length: 8 }, () => Math.random()),
      vocalFeatures: Array.from({ length: 16 }, () => Math.random()),
      postureVector: Array.from({ length: 6 }, () => Math.random()),
    },
    frames: generateFrames(3, [
      'Captured gesture pattern for fingerprint',
      'Facial expression baseline recorded',
      'Posture and body orientation noted',
    ]),
    createdAt: new Date(),
  };
};

export const searchSimilarEpisodes = (fingerprint: DigitalFingerprint, allFrames: VideoFrame[]): VideoFrame[] => {
  // Simulate similarity search
  return allFrames
    .filter(f => f.confidence > 0.5)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map(f => ({
      ...f,
      description: `Similar pattern found: ${f.description}`,
      confidence: 0.6 + Math.random() * 0.4,
    }));
};
