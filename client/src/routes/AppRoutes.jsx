import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Workouts from '../pages/Workouts';
import Diet from '../pages/Diet';
import Water from '../pages/Water';
import Weight from '../pages/Weight';
import Habits from '../pages/Habits';
import Sleep from '../pages/Sleep';
import Goals from '../pages/Goals';
import Photos from '../pages/Photos';
import Journal from '../pages/Journal';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* App Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/water" element={<Water />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
