'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Flame, Check, Plus, Trash2, Calendar, Trophy,
  TrendingUp, Sparkles, X, Heart, BookOpen, Laptop, Droplets, Smile
} from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  icon: string;
  category: string;
  history: Record<string, boolean>; // 'YYYY-MM-DD': boolean
  created_at: string;
}

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit_1',
    name: 'Morning Workout / Walk 30m',
    icon: '🏃‍♂️',
    category: 'Health',
    history: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'habit_2',
    name: 'Read 20 Pages',
    icon: '📖',
    category: 'Growth',
    history: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'habit_3',
    name: 'Deep Work / Study Sprint (1hr)',
    icon: '💻',
    category: 'Productivity',
    history: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'habit_4',
    name: 'Drink 2 Litres Water',
    icon: '💧',
    category: 'Health',
    history: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'habit_5',
    name: 'Evening Journal & Reflection',
    icon: '🧘',
    category: 'Wellness',
    history: {},
    created_at: new Date().toISOString(),
  },
];

export function HabitTracker() {
  const { currentWorkspace } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('⭐');
  const [newHabitCategory, setNewHabitCategory] = useState('Productivity');

  const storageKey = `seyal_habits_${currentWorkspace?.id || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHabits(JSON.parse(saved));
      } else {
        // Initialize with default habits
        setHabits(DEFAULT_HABITS);
        localStorage.setItem(storageKey, JSON.stringify(DEFAULT_HABITS));
      }
    } catch {
      setHabits(DEFAULT_HABITS);
    }
  }, [storageKey]);

  const saveHabits = (updated: Habit[]) => {
    setHabits(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  // Generate current week dates (Mon to Sun)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getWeekDates = () => {
    const dates = [];
    const current = new Date(today);
    // Determine Monday of current week
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: d.toISOString().split('T')[0] === todayStr,
      });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const toggleHabitDay = (habitId: string, dateStr: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const current = !!h.history[dateStr];
      const newHistory = { ...h.history, [dateStr]: !current };
      return { ...h, history: newHistory };
    });
    saveHabits(updated);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: newHabitName.trim(),
      icon: newHabitIcon || '🎯',
      category: newHabitCategory,
      history: { [todayStr]: true },
      created_at: new Date().toISOString(),
    };

    saveHabits([newHabit, ...habits]);
    setNewHabitName('');
    setShowAddModal(false);
  };

  const handleDeleteHabit = (id: string) => {
    if (!confirm('Remove this habit?')) return;
    saveHabits(habits.filter(h => h.id !== id));
  };

  // Calculate stats
  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    const checkDate = new Date();
    // Check backwards from today or yesterday
    const todayChecked = habit.history[todayStr];
    if (!todayChecked) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (habit.history[dStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const todayCompletedCount = habits.filter(h => !!h.history[todayStr]).length;
  const todayPercentage = habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full text-xs">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl text-xl">🔥</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Habit Tracker</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Track your daily habits, build consistency streaks, and review your weekly progress.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Today's Progress</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {todayCompletedCount} / {habits.length}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{todayPercentage}% completed today</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-700 text-xs">
            {todayPercentage}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Habits</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{habits.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Daily routines tracked</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Best Streak</p>
            <h3 className="text-2xl font-bold text-orange-500 mt-1">
              {Math.max(0, ...habits.map(h => calculateStreak(h)))} Days
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Keep the fire burning! 🔥</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-full">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Habits Matrix Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-neutral-50/50">
          <div className="font-bold text-sm text-gray-800 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Weekly Habit Consistency</span>
          </div>
          <span className="text-[11px] text-gray-500">
            Click any circle to toggle daily completion
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-neutral-50/70 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-6">Habit Routine</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-3 text-center">Streak</th>
                {weekDates.map(w => (
                  <th
                    key={w.dateStr}
                    className={`py-3 px-2 text-center ${w.isToday ? 'bg-blue-50/80 text-blue-800 font-bold' : ''}`}
                  >
                    <div>{w.dayName}</div>
                    <div className="text-[10px] font-normal text-gray-400">{w.dayNumber}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {habits.map(habit => {
                const streak = calculateStreak(habit);
                return (
                  <tr key={habit.id} className="hover:bg-neutral-50 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{habit.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{habit.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {habit.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-orange-600">
                      {streak > 0 ? (
                        <span className="inline-flex items-center space-x-0.5 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 text-[11px]">
                          <span>🔥</span>
                          <span>{streak}d</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {weekDates.map(w => {
                      const isDone = !!habit.history[w.dateStr];
                      return (
                        <td
                          key={w.dateStr}
                          className={`py-3.5 px-2 text-center ${w.isToday ? 'bg-blue-50/30' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleHabitDay(habit.id, w.dateStr)}
                            className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition ${isDone ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600' : 'bg-gray-100 text-gray-300 hover:bg-gray-200 hover:text-gray-500'}`}
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <span>🎯</span>
                <span>Create New Daily Habit</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 mins Duolingo / Language"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newHabitIcon}
                    onChange={(e) => setNewHabitIcon(e.target.value)}
                    className="w-full text-center px-3 py-2 text-base border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Growth">Growth</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

