import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const QUOTES = [
  "Action is the foundational key to all success.",
  "Your only limit is you.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Consistency is what transforms average into excellence.",
  "Small daily improvements over time lead to stunning results."
];

export default function Header({ onOpenSidebar, onOpenSearch }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  // Random daily quote selection
  const [quoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Today Date */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 border border-slate-700/50"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {todayStr}
          </span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="italic truncate max-w-xs md:max-w-md">"{QUOTES[quoteIndex]}"</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Search + Dark Toggle + Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 text-sm transition-all duration-200"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Search exercises, meals, goals...</span>
          <kbd className="hidden md:inline-block px-2 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Profile Link */}
        <Link
          to="/settings"
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          {user?.profile?.avatarUrl ? (
            <img
              src={user.profile.avatarUrl}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
              {user?.profile?.name?.charAt(0) || 'A'}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
