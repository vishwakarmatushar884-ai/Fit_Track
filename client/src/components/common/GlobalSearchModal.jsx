import React, { useState, useEffect } from 'react';
import { Search, X, Dumbbell, Utensils, Target, BookOpen, Clock } from 'lucide-react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    workouts: [],
    meals: [],
    goals: [],
    journals: [],
    sessions: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
          window.dispatchEvent(new CustomEvent('open-search'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults({ workouts: [], meals: [], goals: [], journals: [], sessions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [wRes, dRes, gRes, jRes, sRes] = await Promise.all([
          API.get(`/workouts?search=${encodeURIComponent(query)}`),
          API.get(`/diet?mealType=All`),
          API.get('/goals'),
          API.get(`/journal?search=${encodeURIComponent(query)}`),
          API.get(`/workouts/sessions?search=${encodeURIComponent(query)}`)
        ]);

        const filteredMeals = (dRes.data.items || []).filter(m =>
          m.foodName.toLowerCase().includes(query.toLowerCase()) ||
          m.mealType.toLowerCase().includes(query.toLowerCase())
        );

        const filteredGoals = (gRes.data || []).filter(g =>
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.category.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          workouts: wRes.data || [],
          meals: filteredMeals,
          goals: filteredGoals,
          journals: jRes.data || [],
          sessions: sRes.data || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const totalResults =
    results.workouts.length +
    results.meals.length +
    results.goals.length +
    results.journals.length +
    results.sessions.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises, meals, goals, workout logs, journals..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Box */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {loading && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Searching your fitness database...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Type anything to search across workouts, meals, goals, and journal logs.
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              No results found for "<span className="text-slate-200">{query}</span>"
            </div>
          )}

          {/* Workouts */}
          {results.workouts.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Workouts ({results.workouts.length})
              </h3>
              <div className="space-y-1.5">
                {results.workouts.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleNavigate('/workouts')}
                    className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">{w.title}</p>
                      <p className="text-xs text-slate-400">{w.category} • {w.exercises.length} exercises</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meals */}
          {results.meals.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Diet & Meals ({results.meals.length})
              </h3>
              <div className="space-y-1.5">
                {results.meals.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleNavigate('/diet')}
                    className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">{m.foodName}</p>
                      <p className="text-xs text-slate-400">{m.mealType} • {m.calories} kcal</p>
                    </div>
                    <span className="text-xs text-slate-500">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {results.goals.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Goals ({results.goals.length})
              </h3>
              <div className="space-y-1.5">
                {results.goals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => handleNavigate('/goals')}
                    className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">{g.title}</p>
                      <p className="text-xs text-slate-400">Target: {g.targetValue} {g.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journals */}
          {results.journals.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Journal Logs ({results.journals.length})
              </h3>
              <div className="space-y-1.5">
                {results.journals.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => handleNavigate('/journal')}
                    className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>{j.mood}</span>
                      <span>{j.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{j.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
