import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Moon, Plus, Trash2, Clock, Star, Activity } from 'lucide-react';

export default function Sleep() {
  const { showToast } = useToast();
  const [sleepData, setSleepData] = useState({ logs: [], summary: {} });
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [qualityScore, setQualityScore] = useState(8);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchSleepLogs();
  }, []);

  const fetchSleepLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sleep');
      setSleepData(res.data || { logs: [], summary: {} });
    } catch (err) {
      showToast('Error loading sleep logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSleep = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sleep', {
        sleepTime,
        wakeTime,
        qualityScore: parseInt(qualityScore),
        date: logDate,
        notes
      });
      showToast('Sleep record logged successfully!', 'success');
      setIsModalOpen(false);
      setNotes('');
      fetchSleepLogs();
    } catch (err) {
      showToast('Error logging sleep session', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/sleep/${deleteId}`);
      showToast('Sleep log deleted', 'success');
      setDeleteId(null);
      fetchSleepLogs();
    } catch (err) {
      showToast('Failed to delete sleep record', 'error');
    }
  };

  const { logs, summary } = sleepData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Moon className="w-7 h-7 text-indigo-400" /> Sleep Tracker & Recovery
          </h1>
          <p className="text-sm text-slate-400">Monitor sleep duration, bedtime consistency, and recovery quality scores</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Log Sleep Entry
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest Sleep</span>
          <div className="text-3xl font-extrabold text-slate-100 mt-1">
            {summary?.latestLog ? `${summary.latestLog.durationHours} hrs` : 'N/A'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary?.latestLog ? `${summary.latestLog.sleepTime} - ${summary.latestLog.wakeTime}` : 'No logs yet'}
          </p>
        </div>

        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Weekly Average</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">
            {summary?.weeklyAverage || 0} <span className="text-base font-normal text-slate-400">hrs/night</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Past 7 days average</p>
        </div>

        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Average</span>
          <div className="text-3xl font-extrabold text-sky-400 mt-1">
            {summary?.monthlyAverage || 0} <span className="text-base font-normal text-slate-400">hrs/night</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Past 30 days average</p>
        </div>
      </div>

      {/* Sleep Logs List */}
      <div className="glass-panel p-6">
        <h2 className="text-base font-bold text-slate-100 mb-4">Sleep Log History</h2>
        {loading ? (
          <LoadingSkeleton className="h-48" />
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No sleep sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Bed Time</th>
                  <th className="pb-3">Wake Time</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Quality Score</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 text-slate-400 text-xs font-mono">{item.date}</td>
                    <td className="py-3.5 text-slate-200 font-semibold text-xs">{item.sleepTime}</td>
                    <td className="py-3.5 text-slate-200 font-semibold text-xs">{item.wakeTime}</td>
                    <td className="py-3.5 font-bold text-indigo-400 text-sm">{item.durationHours} hrs</td>
                    <td className="py-3.5 text-amber-400 text-xs font-bold">
                      ⭐ {item.qualityScore}/10
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Sleep Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Log Sleep Session</h3>
            <form onSubmit={handleLogSleep} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Sleep Time</label>
                  <input
                    type="time"
                    required
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Wake Time</label>
                  <input
                    type="time"
                    required
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Quality Rating (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(e.target.value)}
                  className="w-full font-bold accent-emerald-500 cursor-pointer"
                />
                <div className="text-center text-xs font-bold text-amber-400 mt-1">{qualityScore} / 10</div>
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
                  Save Sleep Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Sleep Log"
        message="Are you sure you want to remove this sleep record?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
