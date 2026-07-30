import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  Flame,
  Utensils,
  Droplets,
  Dumbbell,
  Scale,
  Zap,
  Moon,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  const { metrics, profile, weeklySummary } = data || {};

  // Time based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const calorieBalance = (metrics?.caloriesConsumedToday || 0) - (metrics?.caloriesBurnedToday || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Greeting */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Fitness Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            {greeting}, {profile?.name || 'Athlete'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Goal: <span className="text-slate-200 font-medium">{profile?.fitnessGoal || 'Lose Weight'}</span> • Target Calorie Intake: <span className="text-emerald-400 font-semibold">{profile?.dailyCalorieGoal || 2200} kcal/day</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/workouts"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Dumbbell className="w-4 h-4" /> Start Workout
          </Link>
          <Link
            to="/diet"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Log Meal
          </Link>
        </div>

        {/* Ambient glow behind banner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Modern Dashboard Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Calories Burned */}
        <div className="glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calories Burned
            </span>
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100">
              {metrics?.caloriesBurnedToday || 0} <span className="text-base font-normal text-slate-400">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              {metrics?.todayWorkoutCount || 0} session(s) completed today
            </p>
          </div>
        </div>

        {/* Card 2: Today's Calories Consumed */}
        <div className="glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calories Consumed
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100">
              {metrics?.caloriesConsumedToday || 0} <span className="text-base font-normal text-slate-400">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Net balance: <span className={calorieBalance > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {calorieBalance > 0 ? `+${calorieBalance}` : calorieBalance} kcal
              </span>
            </p>
          </div>
        </div>

        {/* Card 3: Water Intake */}
        <div className="glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Water Intake
            </span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100">
              {metrics?.waterGlasses || 0} / {metrics?.waterTargetGlasses || 12} <span className="text-base font-normal text-slate-400">glasses</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((metrics?.waterGlasses || 0) / (metrics?.waterTargetGlasses || 12)) * 100))}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Current Weight & Target */}
        <div className="glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Weight
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100">
              {metrics?.currentWeight || 70} <span className="text-base font-normal text-slate-400">kg</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Target: <span className="text-emerald-400 font-semibold">{metrics?.targetWeight || 68} kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row: Workout Status, Streak, Sleep */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Workout Status */}
        <div className="glass-card flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${metrics?.workoutCompletedToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Workout</p>
            <p className="text-base font-bold text-slate-100 mt-0.5">
              {metrics?.workoutCompletedToday ? 'Completed 🎉' : 'Pending Today'}
            </p>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="glass-card flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Habit Streak</p>
            <p className="text-base font-bold text-slate-100 mt-0.5">
              {metrics?.currentStreak || 0} Days Consecutive
            </p>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="glass-card flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sleep Duration</p>
            <p className="text-base font-bold text-slate-100 mt-0.5">
              {metrics?.sleepHoursToday || 0} Hours Logged
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Summary Interactive Chart */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Weekly Energy Overview</h2>
            <p className="text-xs text-slate-400">Comparison of Calories Burned vs. Consumed over the past 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Burned
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Consumed
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySummary || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc'
                }}
              />
              <Bar dataKey="caloriesBurned" name="Burned (kcal)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="caloriesConsumed" name="Consumed (kcal)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
