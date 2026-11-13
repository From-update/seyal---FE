'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  X, Sparkles, Calendar, BookOpen, Target,
  DollarSign, Briefcase, GraduationCap, CheckCircle2,
  ArrowRight, Loader2
} from 'lucide-react';

interface PersonalTemplatesModalProps {
  onClose: () => void;
  onPageCreated?: (pageId: string) => void;
  onDatabaseCreated?: (dbId: string) => void;
}

export function PersonalTemplatesModal({
  onClose,
  onPageCreated,
  onDatabaseCreated,
}: PersonalTemplatesModalProps) {
  const { currentWorkspace } = useAuth();
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const TEMPLATES = [
    {
      id: 'daily_planner',
      title: 'Daily Planner & Time Boxing',
      type: 'page',
      icon: '📅',
      badge: 'Productivity',
      description: "Organize your day with top 3 priorities, morning & evening time blocks, and an end-of-day gratitude reflection.",
      accent: 'border-blue-200 bg-blue-50/50 hover:border-blue-400',
    },
    {
      id: 'study_planner',
      title: 'Study & Exam Prep Tracker',
      type: 'page',
      icon: '🎓',
      badge: 'Academic',
      description: "Designed for students: subject modules, syllabus milestones, exam schedules, and revision checklists.",
      accent: 'border-purple-200 bg-purple-50/50 hover:border-purple-400',
    },
    {
      id: 'goal_tracker',
      title: 'Quarterly & Yearly Goals',
      type: 'database',
      icon: '🎯',
      badge: 'OKRs & Goals',
      description: "Break long-term goals into actionable milestones with target dates, status tracking, and progress metrics.",
      accent: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400',
    },
    {
      id: 'expense_log',
      title: 'Personal Expense & Budget Log',
      type: 'database',
      icon: '💰',
      badge: 'Finance',
      description: "Track daily expenses in INR (₹), categorized by Food, Utilities, Travel, Books, with UPI & Card payment modes.",
      accent: 'border-amber-200 bg-amber-50/50 hover:border-amber-400',
    },
    {
      id: 'reading_list',
      title: 'Reading List & Book Insights',
      type: 'database',
      icon: '📚',
      badge: 'Knowledge',
      description: "Curate your reading backlog, track reading progress, rate books, and save key takeaways & summary quotes.",
      accent: 'border-indigo-200 bg-indigo-50/50 hover:border-indigo-400',
    },
    {
      id: 'job_tracker',
      title: 'Job Search & Career Pipeline',
      type: 'database',
      icon: '💼',
      badge: 'Career',
      description: "Manage applications across companies, interview rounds, offer negotiations, and salary packages.",
      accent: 'border-rose-200 bg-rose-50/50 hover:border-rose-400',
    },
  ];

  const handleApplyTemplate = async (templateId: string) => {
    if (!currentWorkspace) return;
    setLoadingTemplate(templateId);

    try {
      if (templateId === 'daily_planner') {
        const page = await api.createPage({
          workspace_id: currentWorkspace.id,
          title: `Daily Planner - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          icon: '📅',
        });

        // Add pre-structured blocks
        await api.batchUpdateBlocks(page.id, [
          {
            type: 'heading_2',
            content: { text: '🎯 Top 3 Priorities for Today' },
            position: 1.0,
          },
          {
            type: 'todo',
            content: { text: 'Priority 1: Deliver key project task', checked: false },
            position: 2.0,
          },
          {
            type: 'todo',
            content: { text: 'Priority 2: 45-min focused study or deep work session', checked: false },
            position: 3.0,
          },
          {
            type: 'todo',
            content: { text: 'Priority 3: 30-min physical exercise or walk', checked: false },
            position: 4.0,
          },
          {
            type: 'heading_2',
            content: { text: '⏰ Time Boxing Schedule' },
            position: 5.0,
          },
          {
            type: 'bullet',
            content: { text: '09:00 AM - 12:00 PM: High-focus deep work sprint' },
            position: 6.0,
          },
          {
            type: 'bullet',
            content: { text: '01:00 PM - 03:00 PM: Team meetings & inbox zero' },
            position: 7.0,
          },
          {
            type: 'bullet',
            content: { text: '04:00 PM - 06:00 PM: Code review & task follow-ups' },
            position: 8.0,
          },
          {
            type: 'heading_2',
            content: { text: '💡 Daily Reflection & Gratitude' },
            position: 9.0,
          },
          {
            type: 'callout',
            content: { text: 'What went well today? What could be improved for tomorrow?', icon: '✨' },
            position: 10.0,
          },
        ]);

        if (onPageCreated) onPageCreated(page.id);
        onClose();
      } else if (templateId === 'study_planner') {
        const page = await api.createPage({
          workspace_id: currentWorkspace.id,
          title: 'Semester Study & Exam Master Planner',
          icon: '🎓',
        });

        await api.batchUpdateBlocks(page.id, [
          {
            type: 'heading_1',
            content: { text: '🎓 Semester Subjects & Target Grades' },
            position: 1.0,
          },
          {
            type: 'callout',
            content: { text: 'Consistent revision beats last-minute cramming. Aim for at least 1 module review daily.', icon: '💡' },
            position: 2.0,
          },
          {
            type: 'heading_2',
            content: { text: '📚 Core Subjects Checklist' },
            position: 3.0,
          },
          {
            type: 'todo',
            content: { text: 'Database Management Systems - Relational Algebra & SQL', checked: true },
            position: 4.0,
          },
          {
            type: 'todo',
            content: { text: 'Operating Systems - Process Scheduling & Memory Management', checked: false },
            position: 5.0,
          },
          {
            type: 'todo',
            content: { text: 'Computer Networks - TCP/IP & Socket Programming', checked: false },
            position: 6.0,
          },
          {
            type: 'heading_2',
            content: { text: '📝 Upcoming Exam Deadlines' },
            position: 7.0,
          },
          {
            type: 'bullet',
            content: { text: 'Unit Test 1: Oct 15 - Covers Modules 1 & 2' },
            position: 8.0,
          },
          {
            type: 'bullet',
            content: { text: 'Lab Practical Assessment: Nov 05 - Full Stack Project' },
            position: 9.0,
          },
        ]);

        if (onPageCreated) onPageCreated(page.id);
        onClose();
      } else if (templateId === 'goal_tracker') {
        const db = await api.createDatabase({
          workspace_id: currentWorkspace.id,
          name: '2026 Personal & Career Goals',
          schema: [
            { id: 'title', name: 'Goal Title', type: 'title' },
            { id: 'category', name: 'Category', type: 'select', options: ['Career', 'Health', 'Financial', 'Learning', 'Personal'] },
            { id: 'progress', name: 'Progress %', type: 'number' },
            { id: 'target_date', name: 'Target Date', type: 'date' },
            { id: 'status', name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Achieved'] },
          ],
        });

        // Add starter rows
        await api.createDatabaseRow(db.id, {
          title: 'Master Full Stack System Architecture',
          category: 'Career',
          progress: 65,
          target_date: '2026-12-31',
          status: 'In Progress',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Run a 10K Marathon',
          category: 'Health',
          progress: 40,
          target_date: '2026-09-30',
          status: 'In Progress',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Emergency Fund Savings (6 Months)',
          category: 'Financial',
          progress: 90,
          target_date: '2026-08-15',
          status: 'In Progress',
        });

        if (onDatabaseCreated) onDatabaseCreated(db.id);
        onClose();
      } else if (templateId === 'expense_log') {
        const db = await api.createDatabase({
          workspace_id: currentWorkspace.id,
          name: 'Personal Monthly Expenses (INR)',
          schema: [
            { id: 'title', name: 'Expense Item', type: 'title' },
            { id: 'category', name: 'Category', type: 'select', options: ['Food & Dining', 'Rent & Bills', 'Travel', 'Learning & Books', 'Shopping', 'Health'] },
            { id: 'amount', name: 'Amount (INR ₹)', type: 'number' },
            { id: 'payment_mode', name: 'Payment Mode', type: 'select', options: ['UPI / GPay', 'Credit Card', 'Debit Card', 'Cash'] },
            { id: 'date', name: 'Date', type: 'date' },
          ],
        });

        await api.createDatabaseRow(db.id, {
          title: 'Monthly Broadband Fiber',
          category: 'Rent & Bills',
          amount: 825,
          payment_mode: 'UPI / GPay',
          date: '2026-11-01',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Supermarket Groceries',
          category: 'Food & Dining',
          amount: 2450,
          payment_mode: 'UPI / GPay',
          date: '2026-11-04',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Cloud & Tech Book Bundle',
          category: 'Learning & Books',
          amount: 1200,
          payment_mode: 'Credit Card',
          date: '2026-11-07',
        });

        if (onDatabaseCreated) onDatabaseCreated(db.id);
        onClose();
      } else if (templateId === 'reading_list') {
        const db = await api.createDatabase({
          workspace_id: currentWorkspace.id,
          name: 'Personal Reading Backlog & Notes',
          schema: [
            { id: 'title', name: 'Book Title', type: 'title' },
            { id: 'author', name: 'Author', type: 'text' },
            { id: 'genre', name: 'Genre', type: 'select', options: ['Tech & Engineering', 'Business', 'Self-Help', 'Fiction', 'Science'] },
            { id: 'status', name: 'Status', type: 'select', options: ['Currently Reading', 'Want to Read', 'Finished'] },
            { id: 'rating', name: 'Rating', type: 'select', options: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐'] },
            { id: 'takeaways', name: 'Key Insights', type: 'text' },
          ],
        });

        await api.createDatabaseRow(db.id, {
          title: 'Atomic Habits',
          author: 'James Clear',
          genre: 'Self-Help',
          status: 'Currently Reading',
          rating: '⭐⭐⭐⭐⭐',
          takeaways: 'Small habits compound over time. Focus on systems rather than goals.',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          genre: 'Tech & Engineering',
          status: 'Want to Read',
          rating: '⭐⭐⭐⭐⭐',
          takeaways: 'Reliability, scalability, and maintainability in distributed systems.',
        });
        await api.createDatabaseRow(db.id, {
          title: 'The Psychology of Money',
          author: 'Morgan Housel',
          genre: 'Business',
          status: 'Finished',
          rating: '⭐⭐⭐⭐⭐',
          takeaways: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave.',
        });

        if (onDatabaseCreated) onDatabaseCreated(db.id);
        onClose();
      } else if (templateId === 'job_tracker') {
        const db = await api.createDatabase({
          workspace_id: currentWorkspace.id,
          name: 'Job Search & Interview Pipeline',
          schema: [
            { id: 'title', name: 'Company', type: 'title' },
            { id: 'role', name: 'Role', type: 'text' },
            { id: 'stage', name: 'Stage', type: 'select', options: ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'] },
            { id: 'location', name: 'Location', type: 'select', options: ['Remote', 'Bangalore', 'Chennai', 'Hyderabad'] },
            { id: 'ctc', name: 'Target CTC (₹)', type: 'text' },
            { id: 'date', name: 'Application Date', type: 'date' },
          ],
        });

        await api.createDatabaseRow(db.id, {
          title: 'Zerodha',
          role: 'Full Stack Engineer',
          stage: 'Interviewing',
          location: 'Bangalore',
          ctc: '₹22 - 28 LPA',
          date: '2026-11-02',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Razorpay',
          role: 'Backend Platform Engineer',
          stage: 'Applied',
          location: 'Bangalore',
          ctc: '₹20 - 26 LPA',
          date: '2026-11-05',
        });
        await api.createDatabaseRow(db.id, {
          title: 'Postman',
          role: 'Software Engineer',
          stage: 'Wishlist',
          location: 'Remote',
          ctc: '₹18 - 24 LPA',
          date: '2026-11-10',
        });

        if (onDatabaseCreated) onDatabaseCreated(db.id);
        onClose();
      }
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to apply template');
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 text-xs">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-purple-100 text-purple-600 rounded-xl text-lg">✨</span>
              <h2 className="text-xl font-bold text-gray-900">Personal Workspace Templates</h2>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Jumpstart your personal workspace with pre-built Notion-style pages and interactive databases.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(tmpl => {
            const isLoading = loadingTemplate === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={`border rounded-xl p-5 flex flex-col justify-between transition group shadow-sm ${tmpl.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{tmpl.icon}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-700 border border-gray-200">
                      {tmpl.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition">
                    {tmpl.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">
                    Creates {tmpl.type === 'page' ? '📄 Page' : '📊 Database'}
                  </span>
                  <button
                    onClick={() => handleApplyTemplate(tmpl.id)}
                    disabled={!!loadingTemplate}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Use Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

