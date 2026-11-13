'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  X, CheckCircle, AlertCircle, Send, MessageSquare,
  FileUp, Paperclip, Clock, UserCheck, ShieldAlert
} from 'lucide-react';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailModal({ taskId, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const { user, currentWorkspace, t } = useAuth();
  const [task, setTask] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Staff submission form
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [showSubmitBox, setShowSubmitBox] = useState(false);

  // Manager review form
  const [reviewNote, setReviewNote] = useState('');
  const [showReviewBox, setShowReviewBox] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const [taskRes, commentsRes] = await Promise.all([
        api.getTask(taskId),
        api.getTaskComments(taskId),
      ]);
      setTask(taskRes);
      setComments(commentsRes);
    } catch (err) {
      console.error('Error loading task details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const created = await api.addTaskComment(taskId, newComment);
      setComments([...comments, created]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleStaffSubmit = async () => {
    try {
      const attachments = submissionUrl ? [{ name: 'Submission Document', url: submissionUrl }] : [];
      await api.submitTask(taskId, {
        note: submissionNote,
        attachments,
      });
      setShowSubmitBox(false);
      setSubmissionNote('');
      setSubmissionUrl('');
      await loadTask();
      onTaskUpdated?.();
    } catch (err) {
      console.error('Error submitting task:', err);
    }
  };

  const handleManagerReview = async (decision: 'approve' | 'reject') => {
    try {
      await api.reviewTask(taskId, {
        decision,
        review_note: reviewNote,
      });
      setShowReviewBox(false);
      setReviewNote('');
      await loadTask();
      onTaskUpdated?.();
    } catch (err) {
      console.error('Error reviewing task:', err);
    }
  };

  if (loading || !task) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 text-xs text-gray-500">Loading details...</div>
      </div>
    );
  }

  const isAssignee = task.assignee?.id === user?.id;
  const isManagerOrOwner =
    currentWorkspace?.my_role === 'owner' ||
    currentWorkspace?.my_role === 'admin' ||
    currentWorkspace?.my_role === 'manager' ||
    task.department?.manager?.id === user?.id;

  const latestSub = task.latest_submission;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] flex flex-col text-xs overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Task Hierarchy & Approval</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Properties Meta Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Assignee</span>
              <p className="font-semibold text-gray-800 mt-0.5 truncate">{task.assignee?.name || 'Unassigned'}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Assigned By</span>
              <p className="font-semibold text-gray-800 mt-0.5 truncate">{task.assigned_by?.name || 'System'}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Department</span>
              <p className="font-semibold text-purple-700 mt-0.5 truncate">{task.department?.name || 'General'}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Due Date</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
              </p>
            </div>
          </div>

          {/* Latest Submission Card (if any) */}
          {latestSub && (
            <div className={`p-4 rounded-xl border ${latestSub.status === 'approved' ? 'bg-emerald-50/60 border-emerald-200' : latestSub.status === 'rejected' ? 'bg-amber-50/60 border-amber-200' : 'bg-purple-50/60 border-purple-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">
                  Submission from {latestSub.submitted_by?.name || 'Staff'}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${latestSub.status === 'approved' ? 'bg-emerald-200 text-emerald-900' : latestSub.status === 'rejected' ? 'bg-amber-200 text-amber-900' : 'bg-purple-200 text-purple-900'}`}>
                  {latestSub.status}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap mb-2">{latestSub.note || 'No notes added.'}</p>
              {latestSub.attachments?.length > 0 && (
                <div className="space-y-1 mt-2">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">Attached Files:</span>
                  {latestSub.attachments.map((att: any, idx: number) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 text-blue-600 hover:underline"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{att.name}</span>
                    </a>
                  ))}
                </div>
              )}

              {latestSub.review_note && (
                <div className="mt-3 pt-3 border-t border-gray-200/60">
                  <span className="font-bold text-gray-800">Review Feedback:</span>
                  <p className="text-gray-700 mt-0.5">{latestSub.review_note}</p>
                </div>
              )}
            </div>
          )}

          {/* Hierarchy Action Buttons */}
          <div className="p-4 bg-neutral-100 rounded-xl space-y-3">
            <h4 className="font-bold text-gray-800">Hierarchy Approval Actions</h4>

            {/* Staff: Submit for approval button */}
            {task.status !== 'completed' && (
              <div>
                {!showSubmitBox ? (
                  <button
                    onClick={() => setShowSubmitBox(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-1.5"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Submit Work to Department Manager</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white border border-gray-300 rounded-lg space-y-2.5">
                    <h5 className="font-semibold text-gray-900">Submission Note & Evidence</h5>
                    <textarea
                      rows={2}
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      placeholder="Add completion notes, summary, findings..."
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="url"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      placeholder="Attachment URL or Drive Link (optional)"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowSubmitBox(false)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStaffSubmit}
                        className="px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                      >
                        Submit to Manager
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manager / GM: Review & Approval */}
            {isManagerOrOwner && (
              <div className="pt-2 border-t border-gray-200">
                {!showReviewBox ? (
                  <button
                    onClick={() => setShowReviewBox(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Manager Review (Approve / Request Changes)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white border border-purple-200 rounded-lg space-y-2.5">
                    <h5 className="font-semibold text-gray-900">Manager Evaluation & Feedback</h5>
                    <textarea
                      rows={2}
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Provide feedback or approval note..."
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowReviewBox(false)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleManagerReview('reject')}
                        className="px-3 py-1 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleManagerReview('approve')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
                      >
                        Approve Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-900 flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments & Discussion ({comments.length})</span>
            </h4>

            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="p-2.5 bg-gray-50 border border-gray-200/80 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{c.user?.name || 'Teammate'}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-700">{c.body}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex space-x-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

