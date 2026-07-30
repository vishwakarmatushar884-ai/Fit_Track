import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, User, Moon, Sun, Bell, Lock, Volume2 } from 'lucide-react';
import { playAlarmChime } from '../components/common/AlarmNotifier';

export default function Settings() {
  const { user, updateProfileState } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  // Profile Form state
  const [name, setName] = useState(user?.profile?.name || '');
  const [age, setAge] = useState(user?.profile?.age || 25);
  const [gender, setGender] = useState(user?.profile?.gender || 'Male');
  const [height, setHeight] = useState(user?.profile?.height || 175);
  const [weight, setWeight] = useState(user?.profile?.weight || 75);
  const [fitnessGoal, setFitnessGoal] = useState(user?.profile?.fitnessGoal || 'Lose Weight');
  const [targetWeight, setTargetWeight] = useState(user?.profile?.targetWeight || 70);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(user?.profile?.dailyCalorieGoal || 2200);
  const [unitSystem, setUnitSystem] = useState(user?.profile?.unitSystem || 'metric');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification Settings state
  const [notifications, setNotifications] = useState({
    workoutTime: '08:00',
    waterInterval: 60,
    mealTime: '13:00',
    sleepTime: '22:30',
    weightCheck: '07:00',
    enabled: true
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications settings', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/auth/profile', {
        name,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        fitnessGoal,
        targetWeight: parseFloat(targetWeight),
        dailyCalorieGoal: parseInt(dailyCalorieGoal),
        unitSystem,
        theme
      });
      updateProfileState(res.data);
      showToast('Profile settings updated!', 'success');
    } catch (err) {
      showToast('Error updating profile', 'error');
    }
  };

  const handleTestAlarmSound = () => {
    playAlarmChime();
    showToast('🔔 Played test alarm chime!', 'info');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      await API.put('/auth/password', { currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error changing password', 'error');
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/notifications', notifications);
      setNotifications(res.data);
      showToast('Notification schedules & alarm system saved!', 'success');
    } catch (err) {
      showToast('Error updating notifications', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-emerald-400" /> System & Profile Settings
        </h1>
        <p className="text-sm text-slate-400">Manage account details, physical goals, alarm notification schedules, and theme</p>
      </div>

      {/* 1. Theme & Appearance */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />} Appearance Theme
        </h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div>
            <p className="font-semibold text-slate-200 text-sm">Mode Preference</p>
            <p className="text-xs text-slate-400">Current selection: <span className="capitalize font-bold text-emerald-400">{theme} Mode</span></p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      {/* 2. Profile Details & Physical Metrics Form */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" /> Profile & Fitness Metrics
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none"
              >
                <option value="Lose Weight">Lose Weight</option>
                <option value="Gain Muscle">Gain Muscle</option>
                <option value="Maintenance">Maintain Weight</option>
                <option value="Endurance">Endurance & Stamina</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
          >
            Save Profile Settings
          </button>
        </form>
      </div>

      {/* 3. Notification & Alarm Schedules */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> Embedded Alarm & Reminder System
          </h2>
          <button
            type="button"
            onClick={handleTestAlarmSound}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Test Alarm Sound
          </button>
        </div>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Workout Alarm Time</label>
              <input
                type="time"
                value={notifications.workoutTime}
                onChange={(e) => setNotifications({ ...notifications, workoutTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Water Hydration Interval (mins)</label>
              <input
                type="number"
                value={notifications.waterInterval}
                onChange={(e) => setNotifications({ ...notifications, waterInterval: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Meal Time Reminder</label>
              <input
                type="time"
                value={notifications.mealTime}
                onChange={(e) => setNotifications({ ...notifications, mealTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Bedtime Sleep Alarm</label>
              <input
                type="time"
                value={notifications.sleepTime}
                onChange={(e) => setNotifications({ ...notifications, sleepTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Weight Check Alarm</label>
              <input
                type="time"
                value={notifications.weightCheck}
                onChange={(e) => setNotifications({ ...notifications, weightCheck: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            Save Alarm Schedules
          </button>
        </form>
      </div>

      {/* 4. Password Change */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" /> Security & Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow shadow-rose-600/20 transition-all"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
