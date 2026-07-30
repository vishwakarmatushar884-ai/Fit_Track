import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { BookOpen, Plus, Search, Trash2, Edit3, Sparkles } from 'lucide-react';

const MOODS = ['🔥 Highly Motivated', '😊 Energetic', '😌 Calm & Focused', '😴 Tired / Sore', '🧘 Relaxed'];

export default function Journal() {
  const { showToast } = useToast();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [mood, setMood] = useState(MOODS[0]);
  const [content, setContent] = useState('');
  const [journalDate, setJournalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchJournals();
  }, [searchQuery]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/journal?search=${encodeURIComponent(searchQuery)}`);
      setJournals(res.data || []);
    } catch (err) {
      showToast('Error loading journal entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setMood(MOODS[0]);
    setContent('');
    setJournalDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setMood(item.mood);
    setContent(item.content);
    setJournalDate(item.date);
    setIsModalOpen(true);
  };

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      if (editingItem) {
        await API.put(`/journal/${editingItem.id}`, { mood, content, date: journalDate });
        showToast('Journal entry updated!', 'success');
      } else {
        await API.post('/journal', { mood, content, date: journalDate });
        showToast('Journal entry saved!', 'success');
      }

      setIsModalOpen(false);
      fetchJournals();
    } catch (err) {
      showToast('Failed to save journal', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/journal/${deleteId}`);
      showToast('Journal entry deleted', 'success');
      setDeleteId(null);
      fetchJournals();
    } catch (err) {
      showToast('Failed to delete journal entry', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-400" /> Daily Fitness Journal
          </h1>
          <p className="text-sm text-slate-400">Reflect on workout mindset, energy levels, recovery feelings, and fitness notes</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Write Journal Entry
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search journal entries..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Journal Cards */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
      ) : journals.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No journal logs found</p>
          <p className="text-xs text-slate-500 mt-1">Start recording your thoughts and fitness milestones today!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map((item) => (
            <div key={item.id} className="glass-panel p-6 space-y-3 group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700">
                    {item.mood}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Write/Edit Journal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {editingItem ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h3>
            <form onSubmit={handleSaveJournal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Today's Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  >
                    {MOODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Journal Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="How did your workout feel today? What went well?"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none resize-none"
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
