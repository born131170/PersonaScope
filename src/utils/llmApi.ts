import { LLMSettings } from '../types';

function normalizeUrl(baseUrl: string): string {
  // Убираем trailing slash
  return baseUrl.replace(/\/+$/, '');
}

export async function callLLM(settings: LLMSettings, messages: {role:string;content:string}[], opts?: {maxTokens?:number;temperature?:number}): Promise<string> {
  const { provider, apiKey, model, baseUrl, temperature, maxTokens } = settings;
  
  if (!apiKey) throw new Error('API-ключ не указан');
  if (!baseUrl) throw new Error('Base URL не указан');
  
  const cleanBaseUrl = normalizeUrl(baseUrl);
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  let url = cleanBaseUrl;
  let body: any = { 
    model, 
    messages, 
    temperature: opts?.temperature ?? temperature, 
    max_tokens: opts?.maxTokens ?? maxTokens 
  };

  if (provider === 'openai' || provider === 'custom') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    url = `${cleanBaseUrl}/chat/completions`;
  } else if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    url = `${cleanBaseUrl}/messages`;
    body = { 
      model, 
      max_tokens: maxTokens, 
      messages: messages.filter(m => m.role !== 'system').map(m => ({role: m.role, content: m.content})), 
      system: messages.find(m => m.role === 'system')?.content 
    };
  } else if (provider === 'google') {
    url = `${cleanBaseUrl}/models/${model}:generateContent?key=${apiKey}`;
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

  // Пробуем прямой запрос
  try {
    const res = await fetch(url, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = `API Error (${res.status})`;
      
      if (res.status === 401) errorMsg = 'Неверный API-ключ (401)';
      else if (res.status === 403) errorMsg = 'Доступ запрещён (403)';
      else if (res.status === 404) errorMsg = 'Модель или эндпоинт не найдены (404). Проверьте URL и название модели.';
      else if (res.status === 429) errorMsg = 'Превышен лимит запросов (429)';
      else if (res.status === 500) errorMsg = 'Ошибка сервера API (500)';
      else if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg += `: ${errorJson.error?.message || errorJson.message || errorText.slice(0, 200)}`;
        } catch {
          errorMsg += `: ${errorText.slice(0, 200)}`;
        }
      }
      
      throw new Error(errorMsg);
    }
    
    const data = await res.json();
    
    if (provider === 'google') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (provider === 'anthropic') return data.content?.[0]?.text || '';
    return data.choices?.[0]?.message?.content || '';
    
  } catch (error) {
    // Если Failed to fetch — пробуем через CORS-прокси
    if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('fetch'))) {
      
      // Пробуем через CORS-прокси
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      ];
      
      for (const proxyUrl of proxyUrls) {
        try {
          const proxyHeaders = { ...headers };
          // Для CORS-прокси добавляем auth в заголовки
          if (provider === 'openai' || provider === 'custom') {
            proxyHeaders['x-cors-headers'] = JSON.stringify({
              'Authorization': `Bearer ${apiKey}`
            });
          }
          
          const res = await fetch(proxyUrl, { 
            method: 'POST', 
            headers: proxyHeaders, 
            body: JSON.stringify(body) 
          });
          
          if (res.ok) {
            const data = await res.json();
            if (provider === 'google') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (provider === 'anthropic') return data.content?.[0]?.text || '';
            return data.choices?.[0]?.message?.content || '';
          }
        } catch {
          continue;
        }
      }
      
      throw new Error(
        `CORS ошибка: браузер блокирует прямые запросы к ${cleanBaseUrl}. ` +
        `Это проблема безопасности браузера, не API. ` +
        `Решение: используйте приложение через локальный сервер (npm run dev) или установите расширение CORS для браузера.`
      );
    }
    throw error;
  }
}
