'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Heading1, Heading2, Heading3, Type, CheckSquare, List,
  ListOrdered, Quote, Code, AlertCircle, Minus, Trash2,
  ArrowUp, ArrowDown, Plus, Sparkles, Smile
} from 'lucide-react';

interface BlockEditorProps {
  pageId: string;
}

export function BlockEditor({ pageId }: BlockEditorProps) {
  const [page, setPage] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlashIndex, setActiveSlashIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('Saved');

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const pageData = await api.getPage(pageId);
      setPage(pageData);
      setBlocks(pageData.blocks || []);
    } catch (err) {
      console.error('Error loading page:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePageTitle = async (newTitle: string) => {
    setPage((prev: any) => ({ ...prev, title: newTitle }));
    setSaveStatus('Saving...');
    try {
      await api.updatePage(pageId, { title: newTitle });
      setSaveStatus('Saved');
    } catch {
      setSaveStatus('Error saving');
    }
  };

  const updatePageIcon = async (newIcon: string) => {
    setPage((prev: any) => ({ ...prev, icon: newIcon }));
    try {
      await api.updatePage(pageId, { icon: newIcon });
    } catch {}
  };

  const handleBlockChange = (index: number, newContent: any) => {
    const updated = [...blocks];
    updated[index].content = { ...updated[index].content, ...newContent };
    setBlocks(updated);

    // Debounced or direct batch save
    saveBlocks(updated);
  };

  const saveBlocks = async (blocksToSave: any[]) => {
    setSaveStatus('Saving...');
    try {
      await api.batchUpdateBlocks(pageId, blocksToSave);
      setSaveStatus('Saved');
    } catch {
      setSaveStatus('Error saving');
    }
  };

  const addBlock = (index: number, type: string = 'paragraph') => {
    const newBlock = {
      id: undefined,
      type,
      content: { text: '' },
      position: (blocks[index]?.position || 1.0) + 0.5,
    };
    const updated = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    setBlocks(updated);
    saveBlocks(updated);
    setActiveSlashIndex(null);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) return;
    const blockToDelete = blocks[index];
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    if (blockToDelete.id) {
      api.deleteBlock(blockToDelete.id).catch(() => {});
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-normalize positions
    updated.forEach((b, i) => { b.position = i + 1.0; });
    setBlocks(updated);
    saveBlocks(updated);
  };

  const changeBlockType = (index: number, newType: string) => {
    const updated = [...blocks];
    updated[index].type = newType;
    setBlocks(updated);
    saveBlocks(updated);
    setActiveSlashIndex(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
        Loading document...
      </div>
    );
  }

  const slashCommands = [
    { type: 'paragraph', label: 'Text', desc: 'Plain text', icon: Type },
    { type: 'heading1', label: 'Heading 1', desc: 'Large title', icon: Heading1 },
    { type: 'heading2', label: 'Heading 2', desc: 'Medium section', icon: Heading2 },
    { type: 'heading3', label: 'Heading 3', desc: 'Small subsection', icon: Heading3 },
    { type: 'checklist', label: 'To-do List', desc: 'Track tasks with checkboxes', icon: CheckSquare },
    { type: 'bullet_list', label: 'Bulleted List', desc: 'Simple bullet list', icon: List },
    { type: 'numbered_list', label: 'Numbered List', desc: 'Numbered list with order', icon: ListOrdered },
    { type: 'quote', label: 'Quote', desc: 'Capture a quote', icon: Quote },
    { type: 'code', label: 'Code Block', desc: 'Code snippet with syntax', icon: Code },
    { type: 'callout', label: 'Callout', desc: 'Highlighted info box', icon: AlertCircle },
    { type: 'divider', label: 'Divider', desc: 'Visual horizontal line', icon: Minus },
  ];

  const quickIcons = ['📄', '✨', '🚀', '📌', '📘', '🎯', '💡', '🔥', '⚙️', '🏛️'];

  return (
    <div className="flex-1 overflow-y-auto bg-white py-10 px-8 max-w-4xl mx-auto w-full">
      {/* Top Save status */}
      <div className="flex justify-end text-[11px] text-gray-400 mb-4 select-none">
        <span>{saveStatus}</span>
      </div>

      {/* Page Icon Picker */}
      <div className="mb-2 group relative inline-block">
        <button className="text-4xl p-1 rounded-lg hover:bg-gray-100 transition">
          {page?.icon || '📄'}
        </button>
        <div className="hidden group-hover:flex absolute left-0 top-12 bg-white border border-gray-200 shadow-lg p-1.5 rounded-lg space-x-1 z-30">
          {quickIcons.map(icon => (
            <button
              key={icon}
              onClick={() => updatePageIcon(icon)}
              className="p-1 hover:bg-gray-100 rounded text-lg"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Page Title */}
      <input
        type="text"
        value={page?.title || ''}
        onChange={(e) => updatePageTitle(e.target.value)}
        placeholder="Untitled"
        className="w-full text-3xl font-bold text-gray-900 border-none outline-none focus:ring-0 placeholder-gray-300 mb-8"
      />

      {/* Blocks List */}
      <div className="space-y-2">
        {blocks.map((block, index) => {
          return (
            <div key={block.id || index} className="group relative flex items-start space-x-2 py-0.5">
              {/* Block action controls on hover */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 pt-1 text-gray-400 select-none">
                <button
                  onClick={() => moveBlock(index, 'up')}
                  className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Move up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveBlock(index, 'down')}
                  className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Move down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => addBlock(index)}
                  className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Add block below"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeBlock(index)}
                  className="p-1 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete block"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Block Content by Type */}
              <div className="flex-1 min-w-0">
                {block.type === 'heading1' && (
                  <input
                    type="text"
                    value={block.content?.text || ''}
                    onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                    placeholder="Heading 1"
                    className="w-full text-2xl font-bold text-gray-900 border-none outline-none focus:ring-0 placeholder-gray-300"
                  />
                )}

                {block.type === 'heading2' && (
                  <input
                    type="text"
                    value={block.content?.text || ''}
                    onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                    placeholder="Heading 2"
                    className="w-full text-xl font-semibold text-gray-900 border-none outline-none focus:ring-0 placeholder-gray-300 mt-2"
                  />
                )}

                {block.type === 'heading3' && (
                  <input
                    type="text"
                    value={block.content?.text || ''}
                    onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                    placeholder="Heading 3"
                    className="w-full text-lg font-semibold text-gray-800 border-none outline-none focus:ring-0 placeholder-gray-300"
                  />
                )}

                {block.type === 'paragraph' && (
                  <input
                    type="text"
                    value={block.content?.text || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleBlockChange(index, { text: val });
                      if (val === '/') {
                        setActiveSlashIndex(index);
                      }
                    }}
                    placeholder="Type '/' for commands..."
                    className="w-full text-sm text-gray-800 border-none outline-none focus:ring-0 placeholder-gray-300 leading-relaxed"
                  />
                )}

                {block.type === 'checklist' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={Boolean(block.content?.checked)}
                      onChange={(e) => handleBlockChange(index, { checked: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={block.content?.text || ''}
                      onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                      placeholder="To-do item"
                      className={`w-full text-sm border-none outline-none focus:ring-0 ${block.content?.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}
                    />
                  </div>
                )}

                {block.type === 'bullet_list' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 font-bold">•</span>
                    <input
                      type="text"
                      value={block.content?.text || ''}
                      onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                      placeholder="List item"
                      className="w-full text-sm text-gray-800 border-none outline-none focus:ring-0"
                    />
                  </div>
                )}

                {block.type === 'numbered_list' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs font-mono">{index + 1}.</span>
                    <input
                      type="text"
                      value={block.content?.text || ''}
                      onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                      placeholder="Numbered item"
                      className="w-full text-sm text-gray-800 border-none outline-none focus:ring-0"
                    />
                  </div>
                )}

                {block.type === 'quote' && (
                  <div className="border-l-4 border-gray-900 pl-3 py-1 my-1 italic text-gray-700">
                    <input
                      type="text"
                      value={block.content?.text || ''}
                      onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                      placeholder="Empty quote"
                      className="w-full text-sm italic border-none outline-none focus:ring-0"
                    />
                  </div>
                )}

                {block.type === 'code' && (
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs my-2">
                    <textarea
                      rows={3}
                      value={block.content?.text || ''}
                      onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                      placeholder="// Type code here..."
                      className="w-full bg-transparent border-none outline-none focus:ring-0 font-mono resize-y"
                    />
                  </div>
                )}

                {block.type === 'callout' && (
                  <div className="notion-callout flex items-start space-x-3 my-2">
                    <span className="text-lg">💡</span>
                    <input
                      type="text"
                      value={block.content?.text || ''}
                      onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                      placeholder="Callout info box..."
                      className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 text-gray-800"
                    />
                  </div>
                )}

                {block.type === 'divider' && (
                  <div className="py-2">
                    <hr className="border-gray-200" />
                  </div>
                )}
              </div>

              {/* Slash Command Dropdown */}
              {activeSlashIndex === index && (
                <div className="absolute top-8 left-16 bg-white border border-gray-200 shadow-xl rounded-xl w-64 p-1.5 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Basic Blocks
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {slashCommands.map(cmd => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.type}
                          onClick={() => changeBlockType(index, cmd.type)}
                          className="w-full text-left px-2 py-1.5 flex items-center space-x-2.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          <div className="p-1 rounded bg-gray-100 text-gray-700">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{cmd.label}</div>
                            <div className="text-[10px] text-gray-400">{cmd.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new block button at end */}
      <button
        onClick={() => addBlock(blocks.length - 1)}
        className="mt-6 flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-700 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Click to add a block</span>
      </button>
    </div>
  );
}

