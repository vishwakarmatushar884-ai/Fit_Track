import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Filter,
  Search,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = ['Workout', 'Nutrition', 'Hydration', 'Sleep', 'General'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter & Search state
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { showToast } = useToast();

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await API.get('/todos');
      setTodos(res.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      showToast('Failed to load to-do list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return showToast('Please enter a task title', 'error');
    }

    try {
      setSubmitting(true);
      const res = await API.post('/todos', {
        title: title.trim(),
        category,
        priority,
        dueDate
      });
      setTodos((prev) => [res.data, ...prev]);
      setTitle('');
      showToast('Task added successfully! 🎯', 'success');
    } catch (error) {
      console.error('Error adding todo:', error);
      showToast('Failed to add task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await API.patch(`/todos/${id}/toggle`);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? res.data : t))
      );
      showToast(res.data.completed ? 'Task completed! 🎉' : 'Task marked active', 'info');
    } catch (error) {
      console.error('Error toggling todo:', error);
      showToast('Failed to update task status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      showToast('Task deleted', 'info');
    } catch (error) {
      console.error('Error deleting todo:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleClearCompleted = async () => {
    try {
      await API.delete('/todos/completed/clear');
      setTodos((prev) => prev.filter((t) => !t.completed));
      showToast('Cleared all completed tasks', 'success');
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      showToast('Failed to clear completed tasks', 'error');
    }
  };

  // Filtered & Searched Tasks
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);

    const matchesCategory =
      selectedCategory === 'all' || todo.category === selectedCategory;

    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            🔴 High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            🟡 Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🟢 Low
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (c) => {
    const colors = {
      Workout: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      Nutrition: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Hydration: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      Sleep: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      General: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          colors[c] || colors.General
        }`}
      >
        {c}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Fitness To-Do List
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Organize, track, and complete your daily workouts, nutrition goals & habits.
          </p>
        </div>
        <button
          onClick={fetchTodos}
          className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Tasks
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-100">{totalTasks}</p>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-slate-100">{activeTasks}</p>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-slate-100">{completedTasks}</p>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</p>
            <p className="text-2xl font-bold text-slate-100">{completionPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Add New Task Form */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Add New Task
        </h2>
        <form onSubmit={handleAddTodo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Title Input */}
            <div className="md:col-span-6">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning 5km Run, Drink 3L Water, Take Creatine..."
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Category Selector */}
            <div className="md:col-span-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="md:col-span-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="md:col-span-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalTasks})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({activeTasks})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completedTasks})
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {completedTasks > 0 && (
            <button
              onClick={handleClearCompleted}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
            >
              Clear Done
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-panel p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
            Loading your tasks...
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400">
            <CheckSquare className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">No tasks found</p>
            <p className="text-xs text-slate-500 mt-1">
              {todos.length === 0
                ? 'Your to-do list is empty. Add your first fitness task above!'
                : 'No tasks match your current filter or search criteria.'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`glass-panel p-4 flex items-center justify-between gap-4 transition-all duration-200 ${
                todo.completed
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                  : 'hover:border-slate-700/80'
              }`}
            >
              {/* Checkbox & Title */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      todo.completed
                        ? 'line-through text-slate-500'
                        : 'text-slate-100'
                    }`}
                  >
                    {todo.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getCategoryBadge(todo.category)}
                    {getPriorityBadge(todo.priority)}

                    {todo.dueDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {todo.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
