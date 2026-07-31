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
  ListTodo,
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
            to="/todos"
            className="px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all border border-indigo-400/30"
          >
            <ListTodo className="w-4 h-4" /> To-Do List
          </Link>
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
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calories Burned
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {metrics?.caloriesBurnedToday || 0}
            </span>
            <span className="text-sm font-semibold text-slate-400">kcal</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{metrics?.sessionsCountToday || 0} session(s) completed today</span>
          </div>
        </div>

        {/* Card 2: Today's Calories Consumed */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calories Consumed
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {metrics?.caloriesConsumedToday || 0}
            </span>
            <span className="text-sm font-semibold text-slate-400">kcal</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Net balance:</span>
            <span className={`font-semibold ${calorieBalance <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {calorieBalance > 0 ? `+${calorieBalance}` : calorieBalance} kcal
            </span>
          </div>
        </div>

        {/* Card 3: Water Intake */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Water Intake
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {Math.round((metrics?.waterToday || 0) / 250)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 12 glasses</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((metrics?.waterToday || 0) / 3000) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 4: Current Weight */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Weight
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {metrics?.latestWeight ? `${metrics.latestWeight}` : (profile?.weight || 70)}
            </span>
            <span className="text-sm font-semibold text-slate-400">kg</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Target:</span>
            <span className="font-semibold text-emerald-400">{profile?.targetWeight || 68} kg</span>
          </div>
        </div>
      </div>

      {/* Action Row & Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Today's Workout Quick Tile */}
        <div className="glass-panel p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <Link to="/workouts" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Workout</h3>
            <p className="text-lg font-bold text-slate-100 mt-1">
              {metrics?.sessionsCountToday > 0 ? 'Completed 🎉' : 'Pending Today'}
            </p>
          </div>
        </div>

        {/* Widget 2: Habit Streak */}
        <div className="glass-panel p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <Link to="/habits" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              Track Habits <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Habit Streak</h3>
            <p className="text-lg font-bold text-slate-100 mt-1">
              {metrics?.habitStreak || 0} Days Consecutive
            </p>
          </div>
        </div>

        {/* Widget 3: Fitness To-Do List Quick Access */}
        <div className="glass-panel p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ListTodo className="w-5 h-5" />
            </div>
            <Link to="/todos" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
              Open List <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fitness To-Do List</h3>
            <p className="text-lg font-bold text-slate-100 mt-1">
              Manage Daily Tasks
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Energy Chart */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Weekly Energy Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comparison of Calories Burned vs. Consumed over the past 7 days</p>
          </div>
        </div>

        <div className="h-80 w-full">
          {weeklySummary && weeklySummary.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="burned" name="Burned (kcal)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="consumed" name="Consumed (kcal)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No weekly data available yet. Start logging workouts and meals!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
