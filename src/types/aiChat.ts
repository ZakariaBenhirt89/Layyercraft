import type { ComponentNode } from './component';

export type AIIntent = 'create' | 'modify' | 'delete' | 'explain';

export type AIModification = {
  componentId: string;
  updates: Partial<ComponentNode>;
};

export type AIResponse = {
  intent: AIIntent;
  components?: ComponentNode[];
  modifications?: AIModification[];
  message?: string;
};

export type AIChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: AIResponse;
  error?: string;
};
