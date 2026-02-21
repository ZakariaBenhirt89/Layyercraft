import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RefreshCcw, Sparkles, Wand2 } from 'lucide-react';
import type { ComponentNode } from '../../types/component';
import type { AIChatMessage, AIResponse, AIModification } from '../../types/aiChat';
import { sendAIChatRequest } from '../../utils/aiChat';
import { validateAIComponents } from '../../utils/aiValidation';

const CLOUD_MODEL_OPTIONS = [
  { label: 'Gemini 3 Flash', value: 'google/gemini-3-flash-preview' },
  { label: 'Claude Sonnet 4.5', value: 'anthropic/claude-sonnet-4-5-20250929' },
  { label: 'GPT-4o', value: 'openai/gpt-4o' },
  { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash' },
];

type ModelOption = { label: string; value: string };
type OllamaStatus = 'loading' | 'ok' | 'unavailable';

type AIChatPanelProps = {
  components: ComponentNode[];
  selectedComponent: ComponentNode | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onApplyCreate: (nodes: ComponentNode[]) => void;
  onApplyModify: (mods: AIModification[]) => void;
};

const normalizeProps = (props?: Record<string, any>) => {
  if (!props) return props;
  if (props.children && !props.content) {
    return { ...props, content: props.children, children: undefined };
  }
  return props;
};

const normalizeResponse = (response: AIResponse) => {
  if (response.components) {
    const validation = validateAIComponents(response.components);
    return {
      response: {
        ...response,
        components: validation.normalized,
      },
      validationErrors: validation.errors,
    };
  }
  if (response.modifications) {
    const normalizedMods = response.modifications.map((mod) => ({
      ...mod,
      updates: {
        ...mod.updates,
        props: normalizeProps(mod.updates?.props),
      },
    }));
    return {
      response: { ...response, modifications: normalizedMods },
      validationErrors: [],
    };
  }
  return { response, validationErrors: [] };
};

const buildSummary = (response: AIResponse) => {
  if (response.intent === 'create' && response.components) {
    return `Generated ${response.components.length} component${response.components.length === 1 ? '' : 's'}.`;
  }
  if (response.intent === 'modify' && response.modifications) {
    return `Prepared ${response.modifications.length} modification${response.modifications.length === 1 ? '' : 's'}.`;
  }
  if (response.intent === 'delete') {
    return 'Prepared deletions.';
  }
  return response.message ?? 'Response ready.';
};

export function AIChatPanel({
  components,
  selectedComponent,
  viewMode,
  onApplyCreate,
  onApplyModify,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(CLOUD_MODEL_OPTIONS[0].value);
  const [ollamaModels, setOllamaModels] = useState<ModelOption[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('loading');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const serializedMessages = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.content })),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        const response = await fetch('/api/ollama/models');
        if (!response.ok) {
          setOllamaStatus('unavailable');
          return;
        }
        const data = (await response.json()) as { models?: ModelOption[]; error?: string };
        if (data.error || !data.models) {
          setOllamaStatus('unavailable');
          return;
        }
        setOllamaModels(data.models);
        setOllamaStatus(data.models.length > 0 ? 'ok' : 'unavailable');
      } catch {
        setOllamaStatus('unavailable');
      }
    };
    fetchOllamaModels();
  }, []);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLastPrompt(prompt);
    setIsGenerating(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const aiResponse = await sendAIChatRequest(
        {
          messages: [...serializedMessages, { role: 'user', content: prompt }],
          componentTree: components,
          selectedComponentId: selectedComponent?.id ?? null,
          viewMode,
          model: selectedModel,
        },
        abortRef.current.signal
      );

      const { response, validationErrors } = normalizeResponse(aiResponse);
      const assistantMessage: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message ?? buildSummary(response),
        response,
        error: validationErrors.length ? validationErrors.join(' ') : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'AI request failed.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (response?: AIResponse) => {
    if (!response) return;
    if (response.intent === 'create' && response.components) {
      onApplyCreate(response.components);
    }
    if (response.intent === 'modify' && response.modifications) {
      onApplyModify(response.modifications);
    }
  };

  const selectedLabel = selectedComponent
    ? `${selectedComponent.type} (${selectedComponent.id})`
    : 'None';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm text-slate-700 dark:text-slate-200">AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate or modify components with natural language.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <optgroup label="Cloud">
                {CLOUD_MODEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              {ollamaModels.length > 0 ? (
                <optgroup label="Local (Ollama)">
                  {ollamaModels.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
            <span
              title={
                ollamaStatus === 'loading'
                  ? 'Checking Ollama...'
                  : ollamaStatus === 'ok'
                    ? `Ollama connected — ${ollamaModels.length} model${ollamaModels.length === 1 ? '' : 's'}`
                    : 'Ollama not running'
              }
              className={`h-2 w-2 rounded-full ${
                ollamaStatus === 'loading'
                  ? 'bg-slate-300 dark:bg-slate-600'
                  : ollamaStatus === 'ok'
                    ? 'bg-green-500'
                    : 'bg-red-400'
              }`}
            />
            <button
              onClick={() => lastPrompt && sendMessage(lastPrompt)}
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:text-slate-300"
              disabled={!lastPrompt || isGenerating}
            >
              <RefreshCcw className="h-3 w-3" />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Try: "Create a pricing section with 3 cards" or "Make the selected card gradient".
          </div>
        ) : null}

        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const response = message.response;
            const canApply = !message.error && response && (response.components || response.modifications);
            return (
              <div key={message.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                      isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    {isUser ? <Wand2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{message.content}</p>

                    {message.error ? (
                      <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 h-3 w-3" />
                        <span>{message.error}</span>
                      </div>
                    ) : null}

                    {response?.components ? (
                      <AIComponentPreview title="Generated Components" nodes={response.components} />
                    ) : null}

                    {response?.modifications ? (
                      <AIModificationPreview modifications={response.modifications} />
                    ) : null}

                    {canApply ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleApply(response)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                        >
                          {response?.intent === 'modify' ? 'Update Canvas' : 'Add to Canvas'}
                        </button>
                        <button
                          onClick={() => lastPrompt && sendMessage(lastPrompt)}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:text-slate-300"
                        >
                          Regenerate
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
          {isGenerating ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              Generating response...
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe what you want to build..."
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGenerating}
          >
            Send
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Context: {selectedLabel}</span>
          <span>Mode: {viewMode}</span>
        </div>
      </div>
    </div>
  );
}

type AIComponentPreviewProps = {
  title: string;
  nodes: ComponentNode[];
};

function AIComponentPreview({ title, nodes }: AIComponentPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-1">
        {nodes.map((node) => (
          <ComponentTreeNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}

type AIModificationPreviewProps = {
  modifications: AIModification[];
};

function AIModificationPreview({ modifications }: AIModificationPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Modifications</p>
      <div className="space-y-2">
        {modifications.map((mod) => (
          <div key={mod.componentId} className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] text-slate-500">{mod.componentId}</p>
            <p className="text-xs text-slate-700 dark:text-slate-200">
              {Object.keys(mod.updates ?? {}).length} field update{Object.keys(mod.updates ?? {}).length === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

type ComponentTreeNodeProps = {
  node: ComponentNode;
  depth: number;
};

function ComponentTreeNode({ node, depth }: ComponentTreeNodeProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{'—'.repeat(depth)}</span>
        <span className="text-slate-700 dark:text-slate-200">{node.type}</span>
        {node.props?.content ? (
          <span className="text-slate-400">"{node.props.content}"</span>
        ) : null}
      </div>
      {node.children.length ? (
        <div className="mt-1 space-y-1 pl-3">
          {node.children.map((child) => (
            <ComponentTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
