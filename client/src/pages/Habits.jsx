import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { CheckSquare, Plus, Zap, Trash2, Flame, Check } from 'lucide-react';

export default function Habits() {
  const { showToast } = useToast();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await API.get('/habits');
      setHabits(res.data || []);
    } catch (err) {
      showToast('Error loading habits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (id) => {
    try {
      const res = await API.patch(`/habits/${id}/toggle`);
      setHabits((prev) => prev.map(h => h.id === id ? res.data : h));
      if (res.data.completedToday) {
        showToast(`Habit completed! Streak: ${res.data.streak} days 🔥`, 'success');
      }
    } catch (err) {
      showToast('Failed to update habit status', 'error');
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await API.post('/habits', { title: newTitle });
      showToast('New habit created!', 'success');
      setNewTitle('');
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      showToast('Error creating habit', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/habits/${deleteId}`);
      showToast('Habit deleted', 'success');
      setDeleteId(null);
      fetchHabits();
    } catch (err) {
      showToast('Failed to delete habit', 'error');
    }
  };

  const completedCount = habits.filter(h => h.completedToday).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-emerald-400" /> Daily Habit Tracker
          </h1>
          <p className="text-sm text-slate-400">Build consistency, maintain streaks, and auto-reset habit checkboxes daily</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Add Custom Habit
        </button>
      </div>

      {/* Progress Card */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Today's Habit Progress</span>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-1">
            {completedCount} of {habits.length} Habits Completed
          </h2>
          <p className="text-xs text-slate-400 mt-1">Streaks automatically increment upon daily check-in</p>
        </div>

        <div className="w-full sm:w-48 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/60">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-16" />
          <LoadingSkeleton className="h-16" />
          <LoadingSkeleton className="h-16" />
        </div>
      ) : habits.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No habits tracked yet</p>
          <p className="text-xs text-slate-500 mt-1">Create habits to build a healthier daily routine.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                habit.completedToday
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    habit.completedToday
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 border border-slate-700 text-transparent group-hover:border-emerald-500/50'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <p className={`font-semibold text-sm transition-colors ${habit.completedToday ? 'text-slate-100 line-through opacity-80' : 'text-slate-200'}`}>
                    {habit.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-0.5 font-medium">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{habit.streak} Day Streak</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(habit.id);
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Add New Habit</h3>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 15 Mins Evening Yoga"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Habit"
        message="Are you sure you want to remove this habit?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
