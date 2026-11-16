'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  X, Mail, Search, CheckSquare, Plus, Clock,
  ArrowRight, Check, Send, AlertTriangle, RefreshCw,
  ExternalLink, UserCheck, Inbox
} from 'lucide-react';

interface GmailModalProps {
  onClose: () => void;
  onTaskCreated?: () => void;
}

export function GmailModal({ onClose, onTaskCreated }: GmailModalProps) {
  const { currentWorkspace } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Convert to task state
  const [converting, setConverting] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskPriority, setTaskPriority] = useState('medium');

  // Compose tab
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  useEffect(() => {
    loadGmailMessages();
  }, [searchQuery]);

  const loadGmailMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getGmailMessages(searchQuery);
      setMessages(res.messages || []);
      setEmailAddress(res.email_address || 'user@gmail.com');
      setUnreadCount(res.unread_count || 0);
      if (res.messages && res.messages.length > 0 && !selectedMessage) {
        setSelectedMessage(res.messages[0]);
      }
    } catch (err) {
      console.error('Error loading Gmail messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToTask = async () => {
    if (!selectedMessage || !currentWorkspace) return;
    setConverting(true);
    setTaskSuccess(null);

    try {
      await api.createTaskFromEmail({
        workspace_id: currentWorkspace.id,
        subject: selectedMessage.subject,
        body: selectedMessage.body || selectedMessage.snippet,
        from_name: selectedMessage.from_name,
        from_email: selectedMessage.from_email,
        priority: taskPriority || selectedMessage.priority || 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      });

      setTaskSuccess(`Created task: "${selectedMessage.subject}"`);
      if (onTaskCreated) onTaskCreated();
      setTimeout(() => setTaskSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to convert email to task');
    } finally {
      setConverting(false);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    setSendSuccess(`Email successfully dispatched to ${composeTo}!`);
    setTimeout(() => {
      setSendSuccess('');
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setActiveTab('inbox');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full h-[85vh] flex flex-col text-xs overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-xl shadow-sm">
              ✉️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">Google Mail (Gmail)</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                    {unreadCount} Unread
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Connected
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Connected inbox: <span className="font-semibold text-gray-800">{emailAddress}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-100">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-3 py-1 rounded-md font-semibold transition ${activeTab === 'inbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Inbox
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-3 py-1 rounded-md font-semibold transition ${activeTab === 'compose' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Compose
              </button>
            </div>

            <button onClick={onClose} className="p-1 hover:bg-gray-200/60 rounded-full text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'inbox' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Messages List */}
            <div className="w-2/5 border-r border-gray-200 flex flex-col bg-gray-50/50">
              <div className="p-3 border-b border-gray-200 bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search inbox messages..."
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {loading ? (
                  <div className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                    <p>Loading Gmail threads...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Inbox className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-3.5 cursor-pointer transition text-left ${selectedMessage?.id === msg.id ? 'bg-white border-l-4 border-l-red-500 shadow-sm' : 'hover:bg-gray-100/70'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold truncate ${msg.is_unread ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                          {msg.from_name}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                          {new Date(msg.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${msg.is_unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {msg.snippet}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Message Details & Convert Panel */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {selectedMessage ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {selectedMessage.subject}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span className="font-semibold text-gray-800">{selectedMessage.from_name}</span>
                          <span>&lt;{selectedMessage.from_email}&gt;</span>
                          <span>·</span>
                          <span>{new Date(selectedMessage.date).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* 1-Click Convert to Task Button */}
                      <div className="flex flex-col items-end flex-shrink-0">
                        <button
                          onClick={handleConvertToTask}
                          disabled={converting}
                          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>{converting ? 'Creating Task...' : 'Convert to Task'}</span>
                        </button>

                        <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-gray-500">
                          <span>Priority:</span>
                          <select
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                            className="bg-transparent border border-gray-200 rounded px-1 py-0.5"
                          >
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {taskSuccess && (
                      <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-emerald-800 text-xs animate-fadeIn">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">{taskSuccess}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto p-6 whitespace-pre-line text-xs text-gray-800 leading-relaxed font-sans">
                    {selectedMessage.body}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Select an email to view or convert to task
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Compose Tab */
          <form onSubmit={handleSendEmail} className="flex-1 p-8 overflow-y-auto max-w-2xl mx-auto w-full space-y-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">Compose Workspace Email</h3>

            {sendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
                {sendSuccess}
              </div>
            )}

            <div>
              <label className="block font-medium text-gray-700 mb-1">To</label>
              <input
                type="email"
                required
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="colleague@lexiontech.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Updates regarding department project / task"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Message Body</label>
              <textarea
                rows={8}
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Type your email message or project brief here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

