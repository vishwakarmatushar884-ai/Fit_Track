import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Target, Plus, Trash2, CheckCircle, Clock, Award, X } from 'lucide-react';

export default function Goals() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fitness');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [unit, setUnit] = useState('kg');
  const [deadline, setDeadline] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  // Update progress inline state
  const [progressUpdateGoalId, setProgressUpdateGoalId] = useState(null);
  const [progressInput, setProgressInput] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await API.get('/goals');
      setGoals(res.data || []);
    } catch (err) {
      showToast('Error loading goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetValue) return;

    try {
      await API.post('/goals', {
        title,
        category,
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(currentValue || 0),
        unit,
        deadline
      });
      showToast('New personal goal created!', 'success');
      setIsModalOpen(false);
      setTitle('');
      setTargetValue('');
      fetchGoals();
    } catch (err) {
      showToast('Error creating goal', 'error');
    }
  };

  const handleUpdateProgress = async (goal) => {
    if (progressInput === '') return;
    try {
      const updatedVal = parseFloat(progressInput);
      const res = await API.patch(`/goals/${goal.id}`, {
        currentValue: updatedVal,
        targetValue: goal.targetValue
      });
      showToast(res.data.status === 'completed' ? 'Goal Achieved! Outstanding Job 🎉' : 'Goal progress updated!', 'success');
      setProgressUpdateGoalId(null);
      setProgressInput('');
      fetchGoals();
    } catch (err) {
      showToast('Error updating progress', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/goals/${deleteId}`);
      showToast('Goal deleted', 'success');
      setDeleteId(null);
      fetchGoals();
    } catch (err) {
      showToast('Failed to delete goal', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Target className="w-7 h-7 text-emerald-400" /> Personal Goal Manager
          </h1>
          <p className="text-sm text-slate-400">Set target milestones, monitor live progress bars, and accomplish your targets</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <LoadingSkeleton className="h-44" />
          <LoadingSkeleton className="h-44" />
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No active goals</p>
          <p className="text-xs text-slate-500 mt-1">Set your first fitness milestone above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

            return (
              <div key={goal.id} className="glass-panel p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                      {goal.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {goal.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {goal.deadline || 'No deadline'}
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteId(goal.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100">{goal.title}</h3>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-emerald-400 font-mono">
                        {goal.currentValue} / {goal.targetValue} {goal.unit} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/60">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Progress Update input */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {progressUpdateGoalId === goal.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="number"
                        step="any"
                        placeholder="Current value"
                        value={progressInput}
                        onChange={(e) => setProgressInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdateProgress(goal)}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setProgressUpdateGoalId(null)}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setProgressUpdateGoalId(goal.id);
                        setProgressInput(goal.currentValue);
                      }}
                      className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Update Progress Value →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Create Personal Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Run 100 km Total Distance"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="Fitness">Fitness</option>
                    <option value="Weight">Weight</option>
                    <option value="Water">Water</option>
                    <option value="Steps">Steps</option>
                    <option value="Habit">Habit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kg / km / days"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Target Value</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Current Progress</label>
                  <input
                    type="number"
                    step="any"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Personal Goal"
        message="Are you sure you want to delete this goal?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
