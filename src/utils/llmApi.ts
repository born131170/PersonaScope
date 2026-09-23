import { LLMSettings } from '../types';

export async function callLLM(settings: LLMSettings, messages: {role:string;content:string}[], opts?: {maxTokens?:number;temperature?:number}): Promise<string> {
  const { provider, apiKey, model, baseUrl, temperature, maxTokens } = settings;
  
  if (!apiKey) throw new Error('API-ключ не указан');
  if (!baseUrl) throw new Error('Base URL не указан');
  
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  let url = baseUrl;
  let body: any = { 
    model, 
    messages, 
    temperature: opts?.temperature ?? temperature, 
    max_tokens: opts?.maxTokens ?? maxTokens 
  };

  if (provider === 'openai' || provider === 'custom') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    url = `${baseUrl}/chat/completions`;
  } else if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    url = `${baseUrl}/messages`;
    body = { 
      model, 
      max_tokens: maxTokens, 
      messages: messages.filter(m => m.role !== 'system').map(m => ({role: m.role, content: m.content})), 
      system: messages.find(m => m.role === 'system')?.content 
    };
  } else if (provider === 'google') {
    url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    body = { 
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{text: m.content}]
      })), 
      generationConfig: { 
        temperature, 
        maxOutputTokens: maxTokens 
      } 
    };
  }

  try {
    const res = await fetch(url, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = `API Error (${res.status})`;
      
      if (res.status === 401) {
        errorMsg = 'Неверный API-ключ (401)';
      } else if (res.status === 403) {
        errorMsg = 'Доступ запрещён (403)';
      } else if (res.status === 404) {
        errorMsg = 'Модель или эндпоинт не найдены (404)';
      } else if (res.status === 429) {
        errorMsg = 'Превышен лимит запросов (429)';
      } else if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg += `: ${errorJson.error?.message || errorText}`;
        } catch {
          errorMsg += `: ${errorText}`;
        }
      }
      
      throw new Error(errorMsg);
    }
    
    const data = await res.json();
    
    if (provider === 'google') {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    if (provider === 'anthropic') {
      return data.content?.[0]?.text || '';
    }
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Ошибка сети: не удалось подключиться к API. Проверьте URL и интернет-соединение.');
    }
    throw error;
  }
}
