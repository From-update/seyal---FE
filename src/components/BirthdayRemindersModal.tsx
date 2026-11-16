'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  X, Cake, Calendar, Gift, Plus, Search,
  Phone, Mail, Check, MessageCircle, PartyPopper,
  Sparkles, Trash2, Heart, CheckSquare, Clock
} from 'lucide-react';

interface BirthdayRemindersModalProps {
  onClose: () => void;
  onTaskCreated?: () => void;
}

export function BirthdayRemindersModal({ onClose, onTaskCreated }: BirthdayRemindersModalProps) {
  const { currentWorkspace } = useAuth();
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);

  // New birthday form states
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRelationship, setNewRelationship] = useState('Colleague');
  const [newDepartment, setNewDepartment] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGifts, setNewGifts] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadBirthdays();
  }, [searchQuery]);

  const loadBirthdays = async () => {
    setLoading(true);
    try {
      const res = await api.getBirthdays(searchQuery);
      setBirthdays(res.birthdays || []);
      setTodayCount(res.today_count || 0);
      setThisWeekCount(res.this_week_count || 0);
    } catch (err) {
      console.error('Error loading birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDate) return;

    try {
      await api.addBirthday({
        name: newName.trim(),
        birth_date: newDate,
        relationship: newRelationship,
        department: newDepartment || 'General',
        phone: newPhone,
        email: newEmail,
        gift_ideas: newGifts,
        notes: newNotes,
      });

      setShowAddModal(false);
      setNewName('');
      setNewDate('');
      setNewPhone('');
      setNewEmail('');
      setNewGifts('');
      setNewNotes('');
      loadBirthdays();
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to add birthday reminder');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove birthday reminder for ${name}?`)) return;
    try {
      await api.deleteBirthday(id);
      loadBirthdays();
    } catch (err) {
      console.error('Error deleting birthday:', err);
    }
  };

  const handleCreateCelebrationTask = async (item: any) => {
    if (!currentWorkspace) return;
    try {
      await api.createTask({
        workspace_id: currentWorkspace.id,
        title: `🎂 Celebrate ${item.name}'s Birthday (${item.formatted_date})`,
        description: `Plan birthday celebration for ${item.name}.\n\nRelationship: ${item.relationship}\nDepartment: ${item.department}\nTurning Age: ${item.turning_age}\nGift Ideas: ${item.gift_ideas || 'Greeting card & flowers'}\nNotes: ${item.notes || 'None'}`,
        priority: item.is_today ? 'urgent' : item.is_this_week ? 'high' : 'medium',
        due_date: item.next_occurrence,
      });

      setTaskSuccess(`Created task: "Celebrate ${item.name}'s Birthday"!`);
      if (onTaskCreated) onTaskCreated();
      setTimeout(() => setTaskSuccess(null), 3500);
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to create celebration task');
    }
  };

  const filteredBirthdays = birthdays.filter(b => {
    if (selectedFilter === 'week') return b.is_this_week;
    if (selectedFilter === 'colleague') return b.relationship.toLowerCase().includes('colleague') || b.relationship.toLowerCase().includes('lead');
    if (selectedFilter === 'student') return b.relationship.toLowerCase().includes('student');
    if (selectedFilter === 'personal') return b.relationship.toLowerCase().includes('family') || b.relationship.toLowerCase().includes('friend');
    return true;
  });

  const todayItem = birthdays.find(b => b.is_today);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] flex flex-col text-xs overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl shadow-sm">
              🎂
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">Birthday & Occasion Reminders</h2>
                {todayCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 animate-pulse">
                    🎉 {todayCount} Birthday Today!
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                  {thisWeekCount} This Week
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Track birthdays of team members, faculty, students, and family with 1-click wishing & celebration tasks.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </button>

            <button onClick={onClose} className="p-1 hover:bg-gray-200/60 rounded-full text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Today's Special Celebration Banner */}
        {todayItem && (
          <div className="p-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-3">
              <span className="text-3xl animate-bounce">🎉</span>
              <div>
                <p className="font-bold text-sm tracking-wide">
                  Today is {todayItem.name}'s {todayItem.turning_age}th Birthday!
                </p>
                <p className="text-pink-100 text-xs">
                  {todayItem.relationship} · {todayItem.department} · Wish them a joyful celebration!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {todayItem.phone && (
                <a
                  href={`https://wa.me/${todayItem.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Dear ${todayItem.name}, Wishing you a very Happy Birthday! 🎉🎂 May you have a joyful and successful year ahead!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white text-emerald-700 hover:bg-pink-50 rounded-lg font-bold shadow-sm transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Wish WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => handleCreateCelebrationTask(todayItem)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Cake Task</span>
              </button>
            </div>
          </div>
        )}

        {taskSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{taskSuccess}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or department..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center space-x-1">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'week', label: 'This Week' },
              { id: 'colleague', label: 'Team & Faculty' },
              { id: 'student', label: 'Students' },
              { id: 'personal', label: 'Personal & Family' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${selectedFilter === tab.id ? 'bg-pink-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50/40">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading birthday reminders...</div>
          ) : filteredBirthdays.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Cake className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No birthdays found. Click "Add Reminder" to track someone's special day!</p>
            </div>
          ) : (
            filteredBirthdays.map(item => (
              <div
                key={item.id}
                className={`p-4 border rounded-xl bg-white shadow-xs hover:border-pink-300 transition flex items-center justify-between group ${item.is_today ? 'border-pink-300 bg-pink-50/30' : 'border-gray-200'}`}
              >
                <div className="flex items-center space-x-3.5 truncate">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${item.is_today ? 'bg-pink-100 text-pink-600' : item.is_this_week ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                    {item.is_today ? '🎉' : '🎂'}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900 text-xs truncate">{item.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {item.relationship}
                      </span>
                      {item.is_today ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white">
                          TODAY!
                        </span>
                      ) : item.is_this_week ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                          In {item.days_until} Days
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">
                          In {item.days_until} Days
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-semibold text-gray-800">{item.formatted_date}</span>
                      <span>·</span>
                      <span>Turning {item.turning_age}</span>
                      {item.department && (
                        <>
                          <span>·</span>
                          <span className="text-gray-400">{item.department}</span>
                        </>
                      )}
                    </div>

                    {item.gift_ideas && (
                      <p className="text-[10px] text-pink-700 mt-1 flex items-center space-x-1">
                        <Gift className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Gift Ideas: {item.gift_ideas}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  {item.phone && (
                    <a
                      href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Dear ${item.name}, Wishing you a very Happy Birthday! 🎉🎂 May you have a joyful and successful year ahead!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 px-2.5 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition"
                      title="Send WhatsApp Greeting"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}

                  {item.email && (
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(`Happy Birthday ${item.name}!`)}&body=${encodeURIComponent(`Dear ${item.name},\n\nWishing you a wonderful Happy Birthday! May you have an extraordinary year ahead filled with joy and success.\n\nWarm regards,\nSeyal Workspace Team`)}`}
                      className="p-1.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                      title="Send Email Greeting"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleCreateCelebrationTask(item)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition"
                    title="Create Celebration Task in Workspace"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Plan Task</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Birthday Modal Popup */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 text-xs animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <span>🎂</span>
                  <span>Add Birthday or Occasion Reminder</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddBirthday} className="space-y-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Person's Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Ramesh or Priya Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Relationship</label>
                    <select
                      value={newRelationship}
                      onChange={(e) => setNewRelationship(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Colleague">Colleague / Team</option>
                      <option value="Student">Student</option>
                      <option value="Family">Family Member</option>
                      <option value="Friend">Friend</option>
                      <option value="Leadership">Principal / Director</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Department / Group</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE or Administration"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">WhatsApp Phone (+91...)</label>
                    <input
                      type="text"
                      placeholder="+919876543210"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="colleague@lexiontech.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Gift Ideas & Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Bouquet, tech book, custom card..."
                    value={newGifts}
                    onChange={(e) => setNewGifts(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold shadow-sm transition"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

