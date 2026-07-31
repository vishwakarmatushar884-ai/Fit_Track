import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Scale,
  CheckSquare,
  ListTodo,
  Moon,
  Target,
  Camera,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Flame,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'To-Do List', path: '/todos', icon: ListTodo },
  { name: 'Workouts', path: '/workouts', icon: Dumbbell },
  { name: 'Diet Notes', path: '/diet', icon: UtensilsCrossed },
  { name: 'Water Tracker', path: '/water', icon: Droplets },
  { name: 'Weight & Body', path: '/weight', icon: Scale },
  { name: 'Habit Tracker', path: '/habits', icon: CheckSquare },
  { name: 'Sleep Tracker', path: '/sleep', icon: Moon },
  { name: 'Goal Manager', path: '/goals', icon: Target },
  { name: 'Progress Photos', path: '/photos', icon: Camera },
  { name: 'Fitness Journal', path: '/journal', icon: BookOpen },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Close Button */}
        <div>
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Flame className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  FitTrack
                </h1>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                  Personal Fitness
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-md shadow-emerald-950/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile Summary & Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-3 overflow-hidden">
              {user?.profile?.avatarUrl ? (
                <img
                  src={user.profile.avatarUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border border-emerald-500/40 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.profile?.name?.charAt(0) || 'A'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.profile?.name || 'Alex Mercer'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'demo@fittrack.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
