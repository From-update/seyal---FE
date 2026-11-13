'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Plus, Table as TableIcon, LayoutGrid, Trash2, Edit3, Check
} from 'lucide-react';

interface DatabaseViewProps {
  databaseId: string;
}

export function DatabaseView({ databaseId }: DatabaseViewProps) {
  const [database, setDatabase] = useState<any | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

  // New row form
  const [newRowProps, setNewRowProps] = useState<Record<string, any>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  useEffect(() => {
    loadDatabase();
  }, [databaseId]);

  const loadDatabase = async () => {
    setLoading(true);
    try {
      const [dbData, rowsData] = await Promise.all([
        api.getDatabase(databaseId),
        api.getDatabaseRows(databaseId),
      ]);
      setDatabase(dbData);
      setRows(rowsData);
    } catch (err) {
      console.error('Error loading database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = async () => {
    try {
      const created = await api.createDatabaseRow(databaseId, newRowProps);
      setRows([created, ...rows]);
      setNewRowProps({});
    } catch (err) {
      console.error('Error adding row:', err);
    }
  };

  const handleUpdateRowCell = async (rowId: string, colId: string, value: any) => {
    const targetRow = rows.find(r => r.id === rowId);
    if (!targetRow) return;
    const updatedProps = { ...targetRow.properties, [colId]: value };

    // Optimistic update
    setRows(rows.map(r => r.id === rowId ? { ...r, properties: updatedProps } : r));

    try {
      await api.updateDatabaseRow(rowId, updatedProps);
    } catch (err) {
      console.error('Error updating row cell:', err);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    try {
      await api.deleteDatabaseRow(rowId);
      setRows(rows.filter(r => r.id !== rowId));
    } catch (err) {
      console.error('Error deleting row:', err);
    }
  };

  if (loading || !database) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
        Loading database...
      </div>
    );
  }

  const columns = database.schema || [
    { id: 'title', name: 'Name', type: 'title' },
    { id: 'status', name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Done'] },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden text-xs">
      {/* Database Title Bar */}
      <div className="p-6 pb-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🗄️</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{database.name}</h2>
            <p className="text-gray-400 text-[11px]">{rows.length} rows</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition ${viewMode === 'table' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'}`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition ${viewMode === 'board' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* Main Database Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'table' ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                <tr>
                  {columns.map((col: any) => (
                    <th key={col.id} className="px-4 py-3">
                      {col.name}
                    </th>
                  ))}
                  <th className="px-3 py-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/70 group">
                    {columns.map((col: any) => {
                      const val = row.properties?.[col.id] || '';
                      return (
                        <td key={col.id} className="px-4 py-2.5">
                          {col.type === 'select' && col.options ? (
                            <select
                              value={val}
                              onChange={(e) => handleUpdateRowCell(row.id, col.id, e.target.value)}
                              className="px-2 py-1 rounded border border-gray-200 bg-white font-medium text-gray-700"
                            >
                              <option value="">Select...</option>
                              {col.options.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleUpdateRowCell(row.id, col.id, e.target.value)}
                              placeholder="Empty"
                              className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 text-gray-800"
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add new row prompt line */}
                <tr className="bg-gray-50/50">
                  <td colSpan={columns.length + 1} className="px-4 py-2">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New row</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban Board View of Database */
          <div className="flex space-x-4 min-w-[800px] items-start">
            {['Not Started', 'In Progress', 'In Review', 'Approved'].map((statusOption) => {
              const matchedRows = rows.filter(r => (r.properties?.status || 'Not Started') === statusOption);
              return (
                <div key={statusOption} className="w-72 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-800">{statusOption}</span>
                    <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded-full font-mono text-gray-500">
                      {matchedRows.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedRows.map(r => (
                      <div key={r.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {r.properties?.title || r.properties?.name || 'Untitled item'}
                        </h4>
                        {r.properties?.priority && (
                          <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                            {r.properties.priority}
                          </span>
                        )}
                        {r.properties?.lead && (
                          <p className="text-[10px] text-gray-500 mt-2">
                            Lead: {r.properties.lead}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

