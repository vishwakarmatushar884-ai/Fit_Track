import React, { useEffect, useRef } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// Web Audio API Pleasant Alarm Synthesizer Sound (No external asset dependency needed)
export const playAlarmChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Play 3-tone chime sequence (C5 -> E5 -> G5)
    playNote(523.25, 0.0, 0.3); // C5
    playNote(659.25, 0.25, 0.3); // E5
    playNote(783.99, 0.5, 0.5); // G5
  } catch (err) {
    console.error('Audio playback error:', err);
  }
};

export default function AlarmNotifier() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const lastTriggered = useRef({}); // Tracks triggered alarm keys for the current minute

  useEffect(() => {
    // Request Native Browser Notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkAlarms = async () => {
      try {
        const token = localStorage.getItem('fittrack_token');
        if (!token) return;

        const res = await API.get('/notifications');
        const settings = res.data;

        if (!settings || !settings.enabled) return;

        const now = new Date();
        const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const triggerAlarm = (title, body, route, key) => {
          if (lastTriggered.current[key] === currentHHMM) return; // Prevent duplicate trigger in the same minute
          lastTriggered.current[key] = currentHHMM;

          // 1. Play Audio Alarm Sound
          playAlarmChime();

          // 2. Show In-App Toast
          showToast(`🔔 ${title}: ${body}`, 'info');

          // 3. Show Native Desktop/Browser Notification if allowed
          if ('Notification' in window && Notification.permission === 'granted') {
            const notif = new Notification(`FitTrack: ${title}`, {
              body,
              icon: '/favicon.svg'
            });
            notif.onclick = () => {
              window.focus();
              if (route) navigate(route);
            };
          }
        };

        // Alarm 1: Workout Reminder
        if (settings.workoutTime && settings.workoutTime === currentHHMM) {
          triggerAlarm('Workout Alarm', 'Time for your scheduled workout routine!', '/workouts', 'workout');
        }

        // Alarm 2: Meal Time Reminder
        if (settings.mealTime && settings.mealTime === currentHHMM) {
          triggerAlarm('Meal Reminder', 'Time to log your healthy meal & nutrients!', '/diet', 'meal');
        }

        // Alarm 3: Sleep Bedtime Reminder
        if (settings.sleepTime && settings.sleepTime === currentHHMM) {
          triggerAlarm('Bedtime Alarm', 'Time to wind down and get quality sleep!', '/sleep', 'sleep');
        }

        // Alarm 4: Weight Check Reminder
        if (settings.weightCheck && settings.weightCheck === currentHHMM) {
          triggerAlarm('Weight Check Alarm', 'Morning reminder to log your current weight!', '/weight', 'weight');
        }
      } catch (err) {
        // Silent error catch if user not logged in
      }
    };

    // Initial check
    checkAlarms();

    // Check alarm timers every 20 seconds
    const interval = setInterval(checkAlarms, 20000);
    return () => clearInterval(interval);
  }, [showToast, navigate]);

  return null;
}
