import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Square,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
  Clock,
  Flame,
  Download,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulder', 'Cardio', 'Core', 'Yoga', 'Stretching', 'Custom'];

export default function Workouts() {
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Timer state
  const [activeWorkout, setActiveWorkout] = useState(null); // Routine being performed
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);

  // Form Modals state
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'routine' | 'session', id: string }

  // Form Inputs
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Chest');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState([
    { name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 3, reps: 10, weight: 60, restTime: 60, metValue: 6.0 }
  ]);

  useEffect(() => {
    fetchWorkoutsAndSessions();
  }, [selectedCategory]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const fetchWorkoutsAndSessions = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        API.get(`/workouts?category=${selectedCategory}`),
        API.get('/workouts/sessions')
      ]);
      setWorkouts(wRes.data || []);
      setSessions(sRes.data || []);
    } catch (err) {
      showToast('Error loading workout data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Timer Handlers
  const handleStartTimer = (routine) => {
    setActiveWorkout(routine);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    showToast(`Started workout timer for "${routine.title}"`, 'info');
  };

  const handlePauseResumeTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsElapsed(0);
  };

  const handleStopAndSaveTimer = async () => {
    if (!activeWorkout || secondsElapsed < 5) {
      setIsTimerRunning(false);
      setActiveWorkout(null);
      setSecondsElapsed(0);
      showToast('Session too short to record', 'info');
      return;
    }

    try {
      setIsTimerRunning(false);
      const res = await API.post('/workouts/sessions', {
        workoutName: activeWorkout.title,
        category: activeWorkout.category,
        durationSeconds: secondsElapsed,
        metValue: 6.5,
        notes: `Completed ${activeWorkout.exercises?.length || 0} exercise(s)`
      });

      showToast(`Workout logged! Burned ${res.data.caloriesBurned} kcal 🔥`, 'success');
      setActiveWorkout(null);
      setSecondsElapsed(0);
      fetchWorkoutsAndSessions();
    } catch (err) {
      showToast('Failed to save workout session', 'error');
    }
  };

  // Routine Form Handlers
  const handleOpenCreateModal = () => {
    setEditingRoutine(null);
    setTitle('');
    setCategory('Chest');
    setDescription('');
    setExercises([{ name: '', muscleGroup: 'Chest', sets: 3, reps: 10, weight: 0, restTime: 60, metValue: 5.0 }]);
    setIsRoutineModalOpen(true);
  };

  const handleOpenEditModal = (routine) => {
    setEditingRoutine(routine);
    setTitle(routine.title);
    setCategory(routine.category);
    setDescription(routine.description || '');
    setExercises(routine.exercises.length > 0 ? routine.exercises : [{ name: '', muscleGroup: 'Chest', sets: 3, reps: 10, weight: 0, restTime: 60, metValue: 5.0 }]);
    setIsRoutineModalOpen(true);
  };

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', muscleGroup: 'Full Body', sets: 3, reps: 10, weight: 0, restTime: 60, metValue: 5.0 }]);
  };

  const handleRemoveExerciseRow = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Workout title is required', 'error');
      return;
    }

    try {
      if (editingRoutine) {
        await API.put(`/workouts/${editingRoutine.id}`, { title, category, description, exercises });
        showToast('Workout routine updated', 'success');
      } else {
        await API.post('/workouts', { title, category, description, exercises });
        showToast('New workout routine created', 'success');
      }
      setIsRoutineModalOpen(false);
      fetchWorkoutsAndSessions();
    } catch (err) {
      showToast('Error saving workout routine', 'error');
    }
  };

  const handleDuplicate = async (routineId) => {
    try {
      await API.post(`/workouts/${routineId}/duplicate`);
      showToast('Workout duplicated!', 'success');
      fetchWorkoutsAndSessions();
    } catch (err) {
      showToast('Failed to duplicate workout', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'routine') {
        await API.delete(`/workouts/${deleteTarget.id}`);
        showToast('Workout routine deleted', 'success');
      } else {
        await API.delete(`/workouts/sessions/${deleteTarget.id}`);
        showToast('Session record deleted', 'success');
      }
      setDeleteTarget(null);
      fetchWorkoutsAndSessions();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // CSV Export for Workout History
  const exportHistoryCSV = () => {
    if (sessions.length === 0) {
      showToast('No session history to export', 'info');
      return;
    }
    const headers = 'Date,Workout Name,Category,Duration (mins),Calories Burned (kcal),Notes\n';
    const rows = sessions.map(s => `"${s.date}","${s.workoutName}","${s.category}",${Math.round(s.durationSeconds / 60)},${s.caloriesBurned},"${s.notes || ''}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitTrack_Workout_History_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported workout history CSV!', 'success');
  };

  // Filtered workouts
  const filteredWorkouts = workouts.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format Timer SS -> MM:SS / HH:MM:SS
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-emerald-400" /> Workout Routine Manager
          </h1>
          <p className="text-sm text-slate-400">Design custom routines, track exercises, and run real-time workout timers</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Create Routine
        </button>
      </div>

      {/* Active Live Workout Timer Widget (If Active) */}
      {activeWorkout && (
        <div className="glass-panel p-6 border-emerald-500/50 glow-emerald flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Workout Session
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-1">{activeWorkout.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{activeWorkout.category} • {activeWorkout.exercises?.length || 0} Exercises</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-4xl font-mono font-extrabold text-emerald-400 tracking-wider">
              {formatTime(secondsElapsed)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResumeTimer}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
                title={isTimerRunning ? 'Pause' : 'Resume'}
              >
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-emerald-400" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </button>
              <button
                onClick={handleStopAndSaveTimer}
                className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all"
              >
                <Square className="w-4 h-4 fill-white" /> Finish & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routines..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Routines Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <LoadingSkeleton className="h-48" />
          <LoadingSkeleton className="h-48" />
          <LoadingSkeleton className="h-48" />
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No workout routines found</p>
          <p className="text-xs text-slate-500 mt-1">Create your first custom workout routine to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkouts.map((workout) => (
            <div key={workout.id} className="glass-panel p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                    {workout.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicate(workout.id)}
                      title="Duplicate Routine"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(workout)}
                      title="Edit Routine"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'routine', id: workout.id })}
                      title="Delete Routine"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-100">{workout.title}</h3>
                {workout.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{workout.description}</p>
                )}

                {/* Exercises list summary */}
                <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Exercises ({workout.exercises.length})
                  </p>
                  {workout.exercises.slice(0, 3).map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between text-xs text-slate-300">
                      <span>{ex.name}</span>
                      <span className="text-slate-500 font-mono">
                        {ex.sets} × {ex.reps} {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                      </span>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <p className="text-[11px] text-slate-500 italic">+{workout.exercises.length - 3} more exercise(s)</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleStartTimer(workout)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 hover:border-emerald-500 transition-all duration-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Timer Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise & Session History Log */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Workout History Log
            </h2>
            <p className="text-xs text-slate-400">Complete records of all workouts performed</p>
          </div>
          <button
            onClick={exportHistoryCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No workouts logged yet. Start a session above to record history!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Workout Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Calories Burned</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 text-slate-400 text-xs font-mono">{session.date}</td>
                    <td className="py-3.5 font-semibold text-slate-200">{session.workoutName}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                        {session.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs">
                      {Math.round(session.durationSeconds / 60)} mins
                    </td>
                    <td className="py-3.5 font-semibold text-emerald-400 text-xs">
                      🔥 {session.caloriesBurned} kcal
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setDeleteTarget({ type: 'session', id: session.id })}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
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

      {/* Routine Creation/Edit Modal */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingRoutine ? 'Edit Workout Routine' : 'Create New Workout Routine'}
              </h3>
              <button
                onClick={() => setIsRoutineModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chest & Triceps Shred"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about this workout plan..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Exercises List Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Exercises</label>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                {exercises.map((ex, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Exercise Name (e.g. Incline Bench Press)"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500"
                      />
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Sets</span>
                        <input
                          type="number"
                          min={1}
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Reps</span>
                        <input
                          type="number"
                          min={1}
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Weight (kg)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={ex.weight}
                          onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Rest (sec)</span>
                        <input
                          type="number"
                          value={ex.restTime}
                          onChange={(e) => handleExerciseChange(idx, 'restTime', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRoutineModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  {editingRoutine ? 'Update Routine' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${deleteTarget?.type === 'routine' ? 'workout routine' : 'history record'}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
