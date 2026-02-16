import type { AIResponse } from '../types/aiChat';

export type AIChatRequest = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  componentTree: unknown;
  selectedComponentId?: string | null;
  viewMode: string;
  model?: string;
};

const getEndpoint = () => {
  const env = import.meta.env as { VITE_AI_CHAT_ENDPOINT?: string };
  return env.VITE_AI_CHAT_ENDPOINT ?? '/api/chat';
};

export const sendAIChatRequest = async (payload: AIChatRequest, signal?: AbortSignal) => {
  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const data = (await response.json().catch(() => null)) as AIResponse | null;
  if (!data) {
    throw new Error('Invalid AI response payload.');
  }
  return data;
};
