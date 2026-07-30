import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Activity,
  Calculator
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Weight() {
  const { showToast } = useToast();
  const [range, setRange] = useState('month'); // week, month, year, all
  const [weightData, setWeightData] = useState({ logs: [], stats: {} });
  const [loading, setLoading] = useState(true);

  // Form input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchWeightHistory();
  }, [range]);

  const fetchWeightHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/weight?range=${range}`);
      setWeightData(res.data || { logs: [], stats: {} });
    } catch (err) {
      showToast('Error loading weight logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || parseFloat(newWeight) <= 0) {
      showToast('Please enter a valid weight', 'error');
      return;
    }

    try {
      await API.post('/weight', {
        weight: parseFloat(newWeight),
        date: logDate,
        notes
      });
      showToast('Weight logged successfully', 'success');
      setIsModalOpen(false);
      setNewWeight('');
      setNotes('');
      fetchWeightHistory();
    } catch (err) {
      showToast('Failed to log weight', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/weight/${deleteId}`);
      showToast('Weight entry deleted', 'success');
      setDeleteId(null);
      fetchWeightHistory();
    } catch (err) {
      showToast('Error deleting weight entry', 'error');
    }
  };

  const { logs, stats } = weightData;

  // BMI & BMR calculations based on stats current weight and height 180cm / age 26
  const currentWeight = stats?.currentWeight || 76.5;
  const heightCm = 180;
  const heightM = heightCm / 100;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);

  let bmiCategory = 'Normal Weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 29.9) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  // BMR (Mifflin-St Jeor formula for males: 10*weight + 6.25*height - 5*age + 5)
  const bmr = Math.round(10 * currentWeight + 6.25 * heightCm - 5 * 26 + 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-emerald-400" /> Weight & Body Metrics
          </h1>
          <p className="text-sm text-slate-400">Track weight progression, BMI, BMR, and body composition changes</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Log Weight Entry
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Weight</span>
          <div className="text-3xl font-extrabold text-slate-100 mt-1">
            {stats?.currentWeight || 0} <span className="text-base font-normal text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Target: {stats?.targetWeight || 68} kg</p>
        </div>

        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Change</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 flex items-center gap-1">
            {(stats?.weightChange || 0) <= 0 ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6 text-rose-400" />}
            {stats?.weightChange || 0} kg
          </div>
          <p className="text-xs text-slate-400 mt-1">From initial log</p>
        </div>

        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">BMI Indicator</span>
          <div className="text-3xl font-extrabold text-sky-400 mt-1">
            {bmi} <span className="text-xs font-normal text-slate-400">({bmiCategory})</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Body Mass Index</p>
        </div>

        <div className="glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Est. BMR</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">
            {bmr} <span className="text-base font-normal text-slate-400">kcal/day</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Basal Metabolic Rate</p>
        </div>
      </div>

      {/* Weight Progression Area Chart */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Weight Progression Chart</h2>
            <p className="text-xs text-slate-400">Visual trend of logged weight entries over time</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            {['week', 'month', 'year', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                  range === r
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logs || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc'
                }}
              />
              <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight History Table */}
      <div className="glass-panel p-6">
        <h2 className="text-base font-bold text-slate-100 mb-4">Weight Log Records</h2>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No weight entries logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Weight</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400 text-xs font-mono">{item.date}</td>
                    <td className="py-3 font-bold text-emerald-400 text-sm">{item.weight} kg</td>
                    <td className="py-3 text-xs text-slate-300">{item.notes || '-'}</td>
                    <td className="py-3 text-right">
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

      {/* Log Weight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Log New Weight</h3>
            <form onSubmit={handleLogWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="e.g. 76.5"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Measured empty stomach in morning"
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
        title="Delete Weight Entry"
        message="Are you sure you want to delete this weight log record?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
