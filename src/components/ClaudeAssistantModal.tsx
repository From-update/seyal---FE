'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  X, Sparkles, Send, Bot, Check, CheckSquare,
  FileText, ArrowRight, Loader2, Key, HelpCircle,
  Copy, RefreshCw, Zap
} from 'lucide-react';

interface ClaudeAssistantModalProps {
  onClose: () => void;
  activeContextText?: string;
  onInsertContent?: (content: string) => void;
  onTasksGenerated?: () => void;
}

export function ClaudeAssistantModal({
  onClose,
  activeContextText,
  onInsertContent,
  onTasksGenerated,
}: ClaudeAssistantModalProps) {
  const { currentWorkspace } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'chat' | 'draft' | 'summarize' | 'breakdown'>('chat');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; model?: string }>>([
    {
      role: 'assistant',
      text: "👋 Hi! I'm **Claude**, your AI Workspace Copilot. How can I assist you with your pages, tasks, or hierarchy today?",
      model: 'claude-3-5-sonnet',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Quick prompt suggestions
  const PROMPT_SUGGESTIONS = [
    { label: '🎯 Break Down Project', prompt: 'Break down NAAC Accreditation Criterion 3 preparation into departmental tasks', mode: 'breakdown' as const },
    { label: '✍️ Draft Faculty Notice', prompt: 'Draft an urgent department notice regarding semester syllabus completion', mode: 'draft' as const },
    { label: '📑 Summarize Document', prompt: 'Provide an executive summary and action items of this document', mode: 'summarize' as const },
    { label: '💡 Ask Strategy', prompt: 'How should we structure task approvals between HOD and Faculty staff?', mode: 'chat' as const },
  ];

  const handleSend = async (customPrompt?: string, customMode?: 'chat' | 'draft' | 'summarize' | 'breakdown') => {
    const textToSend = customPrompt || prompt;
    const modeToSend = customMode || mode;
    if (!textToSend.trim() && modeToSend !== 'summarize') return;

    const userMsg = { role: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.generateWithClaude({
        prompt: textToSend,
        mode: modeToSend,
        context: activeContextText || '',
        api_key: apiKey || undefined,
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          model: res.model || 'claude-3-5-sonnet',
        },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Claude Notice:** ${err?.data?.error || err.message || 'Unable to connect to Claude. Please try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full h-[85vh] flex flex-col text-xs overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-md font-serif font-bold">
              ✦
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">Claude AI Copilot</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                  Anthropic Claude 3.5 Sonnet
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                AI writing, document synthesis, and automated task decomposition.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyConfig(prev => !prev)}
              className="flex items-center space-x-1 px-2.5 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 transition"
              title="Configure Custom Anthropic API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{apiKey ? 'Key Set' : 'Custom Key'}</span>
            </button>

            <button onClick={onClose} className="p-1 hover:bg-gray-200/60 rounded-full text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key Drawer */}
        {showKeyConfig && (
          <div className="p-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-amber-900 mb-1">
                Anthropic API Key (Optional - Seyal built-in AI active by default):
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs bg-white"
              />
            </div>
            <button
              onClick={() => setShowKeyConfig(false)}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold mt-4"
            >
              Save
            </button>
          </div>
        )}

        {/* Mode Selector Bar */}
        <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {[
              { id: 'chat', label: '💬 Chat & Q&A' },
              { id: 'breakdown', label: '🎯 Task Breakdown' },
              { id: 'draft', label: '✍️ Draft Content' },
              { id: 'summarize', label: '📑 Summarize Page' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${mode === m.id ? 'bg-white shadow-sm border border-gray-200 text-orange-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {activeContextText && (
            <span className="text-[10px] text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">
              📄 Active Page Context Attached
            </span>
          )}
        </div>

        {/* Chat / Content History Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                <span className="font-bold text-[11px] text-gray-600">
                  {msg.role === 'user' ? 'You' : 'Claude'}
                </span>
                {msg.model && (
                  <span className="text-[10px] text-orange-600 font-mono">({msg.model})</span>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[85%] whitespace-pre-line leading-relaxed text-xs shadow-sm ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
              >
                {msg.text}

                {/* Assistant Action Buttons */}
                {msg.role === 'assistant' && i > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end space-x-2 text-[11px]">
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onInsertContent && (
                      <button
                        onClick={() => {
                          onInsertContent(msg.text);
                          onClose();
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded font-medium border border-orange-200 transition"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Insert into Page</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500 bg-white border border-gray-200 rounded-xl p-3.5 w-fit shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span>Claude is thinking and synthesizing...</span>
            </div>
          )}
        </div>

        {/* Prompt Suggestions Pills */}
        <div className="px-5 py-2 bg-white border-t border-gray-100 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] font-semibold text-gray-400 uppercase flex-shrink-0">
            Suggested:
          </span>
          {PROMPT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMode(s.mode);
                handleSend(s.prompt, s.mode);
              }}
              className="flex-shrink-0 px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-transparent rounded-full text-[11px] text-gray-600 transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'breakdown'
                  ? 'Enter project objective to break down into subtasks...'
                  : mode === 'draft'
                  ? 'Describe what you want Claude to draft (e.g. Exam policy notice)...'
                  : mode === 'summarize'
                  ? 'Click send to summarize active page content...'
                  : 'Ask Claude anything about this workspace or project...'
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-orange-500 focus:border-orange-500"
            />

            <button
              type="submit"
              disabled={loading || (!prompt.trim() && mode !== 'summarize')}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm transition"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

