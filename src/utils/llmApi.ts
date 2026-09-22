import { LLMSettings } from '../types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export async function callLLM(
  settings: LLMSettings,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const { provider, apiKey, model, baseUrl, temperature, maxTokens } = settings;

  if (!apiKey) {
    throw new Error('API key is required. Please configure your LLM settings.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let url = baseUrl;
  let body: Record<string, unknown> = {
    model,
    messages,
    temperature: options?.temperature ?? temperature,
    max_tokens: options?.maxTokens ?? maxTokens,
  };

  switch (provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      url = `${baseUrl}/chat/completions`;
      break;
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      url = `${baseUrl}/messages`;
      body = {
        model,
        max_tokens: options?.maxTokens ?? maxTokens,
        messages: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content,
        })),
        system: messages.find(m => m.role === 'system')?.content,
      };
      break;
    case 'google':
      url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
      body = {
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: typeof m.content === 'string' ? m.content : m.content.map(c => c.text || '').join('') }],
        })),
        generationConfig: {
          temperature: options?.temperature ?? temperature,
          maxOutputTokens: options?.maxTokens ?? maxTokens,
        },
      };
      break;
    case 'custom':
      headers['Authorization'] = `Bearer ${apiKey}`;
      url = `${baseUrl}/chat/completions`;
      break;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  const data = await response.json();

  switch (provider) {
    case 'openai':
    case 'custom':
      return data.choices[0]?.message?.content || '';
    case 'anthropic':
      return data.content[0]?.text || '';
    case 'google':
      return data.candidates[0]?.content?.parts[0]?.text || '';
    default:
      return '';
  }
}

export const ANALYSIS_PROMPT = `You are an expert in personality psychology and behavioral analysis. Analyze the provided video frames and assess the person's personality using multiple psychological frameworks.

For each framework, provide:
1. Numerical scores (0-100) for each dimension
2. Specific behavioral evidence from the frames
3. Confidence level for each assessment

Frameworks to use:
- Big Five (OCEAN): Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- MBTI: E/I, S/N, T/F, J/P dimensions
- Enneagram: Primary type (1-9) with wing
- Temperament Theory: Choleric, Sanguine, Melancholic, Phlegmatic percentages
- HEXACO: All 6 dimensions
- PID-5 (DSM-5): All 5 trait domains

Also assess truthfulness based on:
- Verbal consistency
- Micro-expression analysis
- Body language congruence
- Vocal pattern analysis
- Eye movement patterns

Respond in structured JSON format.`;

export const FRAME_ANALYSIS_PROMPT = `Analyze this video frame for behavioral indicators:
1. Facial expressions and micro-expressions
2. Body posture and gestures
3. Eye direction and gaze patterns
4. Any signs of emotional states
5. Indicators of truthfulness or deception

Provide a detailed analysis with confidence scores.`;

export const FINGERPRINT_PROMPT = `Create a digital behavioral fingerprint from these sequential frames. Capture:
1. Facial landmark patterns
2. Gesture vectors and dynamics
3. Micro-expression sequences
4. Posture and orientation
5. Temporal patterns in behavior

This fingerprint will be used for matching similar behavioral episodes.`;
