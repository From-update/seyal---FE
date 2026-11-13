'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  X, Search, ExternalLink, HardDrive, RefreshCw,
  FileText, Check, Plus, Folder, Filter, FileSpreadsheet,
  Presentation, AlertCircle, Link2
} from 'lucide-react';

interface GoogleDriveModalProps {
  onClose: () => void;
  onSelectFile?: (file: any) => void;
}

export function GoogleDriveModal({ onClose, onSelectFile }: GoogleDriveModalProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [connectedEmail, setConnectedEmail] = useState('');
  const [storageUsed, setStorageUsed] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadDriveFiles();
  }, [searchQuery]);

  const loadDriveFiles = async () => {
    setLoading(true);
    try {
      const res = await api.getGoogleDriveFiles(searchQuery);
      setFiles(res.files || []);
      setConnectedEmail(res.connected_email || 'user@google.com');
      setStorageUsed(res.storage_used || '1.8 GB of 15 GB');
    } catch (err) {
      console.error('Error loading Google Drive files:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string, fallbackIcon: string) => {
    if (mimeType.includes('spreadsheet')) return <span className="text-emerald-600 text-lg">📊</span>;
    if (mimeType.includes('presentation')) return <span className="text-amber-500 text-lg">📽️</span>;
    if (mimeType.includes('document')) return <span className="text-blue-600 text-lg">📄</span>;
    if (mimeType.includes('pdf')) return <span className="text-red-500 text-lg">📕</span>;
    if (mimeType.includes('folder')) return <span className="text-gray-500 text-lg">📁</span>;
    return <span className="text-lg">{fallbackIcon || '📄'}</span>;
  };

  const filteredFiles = files.filter(f => {
    if (selectedFilter === 'docs') return f.mimeType.includes('document');
    if (selectedFilter === 'sheets') return f.mimeType.includes('spreadsheet');
    if (selectedFilter === 'slides') return f.mimeType.includes('presentation');
    if (selectedFilter === 'pdf') return f.mimeType.includes('pdf');
    return true;
  });

  const handleCopyLink = (file: any) => {
    navigator.clipboard.writeText(file.webViewLink);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] flex flex-col text-xs overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shadow-sm">
              📁
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">Google Drive Integration</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Connected</span>
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Connected to <span className="font-semibold text-gray-800">{connectedEmail}</span> · {storageUsed}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-gray-200/60 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files and folders in Google Drive..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1 text-xs">
            {['all', 'docs', 'sheets', 'slides', 'pdf'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${selectedFilter === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tab === 'all' ? 'All Files' : tab}
              </button>
            ))}

            <button
              onClick={loadDriveFiles}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              title="Refresh Google Drive"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p>Fetching files from Google Drive...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No matching files found in your Google Drive.</p>
            </div>
          ) : (
            filteredFiles.map(file => (
              <div
                key={file.id}
                className="p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition bg-white flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file.mimeType, file.icon)}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-gray-900 text-xs truncate group-hover:text-blue-600 transition">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                      <span className="font-medium text-gray-600">{file.type}</span>
                      <span>·</span>
                      <span>{file.size}</span>
                      <span>·</span>
                      <span>Modified {new Date(file.modified).toLocaleDateString()}</span>
                      {file.sharedWith && (
                        <>
                          <span>·</span>
                          <span className="text-blue-600 font-medium">{file.sharedWith}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleCopyLink(file)}
                    className="p-1.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                    title="Copy Google Drive Link"
                  >
                    {copiedId === file.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-2.5 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>

                  {onSelectFile && (
                    <button
                      onClick={() => {
                        onSelectFile(file);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Attach
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-neutral-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <span>Files opened directly with Google Docs & Sheets authentication.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

