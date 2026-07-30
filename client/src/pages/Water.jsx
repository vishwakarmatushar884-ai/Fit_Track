import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Droplets, Plus, Minus, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Water() {
  const { showToast } = useToast();
  const [waterData, setWaterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetInput, setTargetInput] = useState(12);

  useEffect(() => {
    fetchWaterIntake();
  }, []);

  const fetchWaterIntake = async () => {
    try {
      const res = await API.get('/water');
      setWaterData(res.data);
      setTargetInput(res.data.targetGlasses || 12);
    } catch (err) {
      showToast('Error loading water intake', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGlass = async () => {
    try {
      const res = await API.post('/water/add');
      setWaterData(res.data);
      showToast('Added +1 glass of water 💧', 'success');
    } catch (err) {
      showToast('Error adding water', 'error');
    }
  };

  const handleRemoveGlass = async () => {
    if (!waterData || waterData.glasses <= 0) return;
    try {
      const res = await API.post('/water/remove');
      setWaterData(res.data);
    } catch (err) {
      showToast('Error removing water', 'error');
    }
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/water/goal', { targetGlasses: targetInput });
      setWaterData(res.data);
      showToast(`Daily water target updated to ${targetInput} glasses!`, 'success');
    } catch (err) {
      showToast('Error updating goal', 'error');
    }
  };

  if (loading) return <LoadingSkeleton className="h-96" />;

  const glasses = waterData?.glasses || 0;
  const targetGlasses = waterData?.targetGlasses || 12;
  const percentage = Math.min(100, Math.round((glasses / targetGlasses) * 100));
  const liters = (glasses * 0.25).toFixed(2); // 250ml per glass
  const targetLiters = (targetGlasses * 0.25).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center justify-center gap-2.5">
          <Droplets className="w-8 h-8 text-sky-400 fill-sky-400" /> Water Hydration Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Stay properly hydrated throughout your workout and daily routine
        </p>
      </div>

      {/* Main Hydration Card */}
      <div className="glass-panel p-8 sm:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Animated Background Water Wave Indicator */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-slate-800/80 border-4 border-sky-500/30 p-2 flex flex-col items-center justify-center shadow-2xl mb-8">
          <div
            className="absolute bottom-0 left-0 right-0 bg-sky-500/20 rounded-b-full transition-all duration-700"
            style={{ height: `${percentage}%` }}
          />

          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-extrabold text-sky-400 font-mono tracking-tight">
              {liters} <span className="text-base text-slate-400 font-normal">L</span>
            </div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-1">
              {glasses} of {targetGlasses} Glasses
            </p>
            <p className="text-[11px] text-sky-400 font-bold mt-1">{percentage}% Achieved</p>
          </div>
        </div>

        {/* Add / Remove Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleRemoveGlass}
            disabled={glasses <= 0}
            className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all"
          >
            <Minus className="w-6 h-6" />
          </button>

          <button
            onClick={handleAddGlass}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 font-extrabold text-base shadow-xl shadow-sky-500/30 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5 stroke-[3]" /> Add Glass (+250ml)
          </button>
        </div>

        {percentage >= 100 && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" /> Daily Hydration Goal Completed! Excellent Job 🎉
          </div>
        )}
      </div>

      {/* Target Setting Form */}
      <div className="glass-panel p-6">
        <form onSubmit={handleSaveTarget} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Set Daily Water Goal</h3>
              <p className="text-xs text-slate-400">Default standard target is 12 glasses (3.0 Liters)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={4}
              max={30}
              value={targetInput}
              onChange={(e) => setTargetInput(parseInt(e.target.value) || 12)}
              className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-center text-slate-100 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
            >
              Update Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
