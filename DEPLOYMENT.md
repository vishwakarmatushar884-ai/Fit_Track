# FitTrack – Production Database Setup & Deployment Guide

This guide walks you through connecting a **real production PostgreSQL database** (with **zero demo/dummy data**) and deploying both the backend API and frontend React app for **100% FREE**.

---

## 🗄️ Step 1: Get a Free Cloud PostgreSQL Database

You can get a free managed PostgreSQL instance from either **Supabase** or **Neon.tech**:

### Option A: Supabase (Recommended)
1. Go to [Supabase.com](https://supabase.com) and create a free account.
2. Click **"New Project"**, enter a project name (`FitTrack`), and create a secure database password.
3. Once created, go to **Project Settings -> Database -> Connection String -> URI**.
4. Copy your PostgreSQL connection URL:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   ```

### Option B: Neon.tech
1. Go to [Neon.tech](https://neon.tech) and create a free account.
2. Create a project (`FitTrack`).
3. Copy the pooled PostgreSQL connection string provided on the dashboard:
   ```env
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
   ```

---

## 🧹 Step 2: Initialize Real PostgreSQL Schema & Clear Demo Data

1. Open `server/.env` and paste your production PostgreSQL `DATABASE_URL`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require"
   JWT_SECRET="your_production_secure_jwt_key_2026"
   NODE_ENV="production"
   ```

2. Push the schema to your cloud PostgreSQL database:
   ```bash
   cd server
   npx prisma db push
   ```

3. Run the database clean script to wipe any temporary data and ensure **0 demo records** exist:
   ```bash
   npm run db:clean
   ```

*(Your PostgreSQL database is now 100% pristine and ready for your real user registration!)*

---

## 🚀 Step 3: Deploy Backend REST API to Render (Free)

1. Push your project folder to your GitHub repository.
2. Go to [Render.com](https://render.com) and sign in.
3. Click **New -> Web Service** and connect your GitHub repo.
4. Select the `server` directory as the root folder.
5. Set the build and start commands:
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start`
6. Add Environment Variables on Render:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secret random string.
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-fittrack-app.vercel.app` (your frontend URL).
7. Click **Create Web Service**.
8. Copy your deployed backend URL (e.g. `https://fittrack-backend.onrender.com`).

---

## 🌐 Step 4: Deploy Frontend Client to Vercel (Free)

1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **Add New -> Project** and import your GitHub repository.
3. Set the **Root Directory** to `client`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://fittrack-backend.onrender.com/api` (your deployed Render backend API URL).
5. Click **Deploy**.
6. Vercel will build and provide your live production URL (e.g. `https://fittrack.vercel.app`)!

---

## 👤 Step 5: Register Your Real Account

1. Open your live application link (e.g. `https://fittrack.vercel.app` or `http://localhost:3000`).
2. Click **Create Account** / **Register**.
3. Enter your **real name**, **real email**, and **secure password**.
4. Log in and start tracking your real personal workouts, meals, water, weight, habits, sleep, goals, and journal!

---

## 🔄 Quick Commands Reference

| Action | Command (inside `/server`) |
| :--- | :--- |
| **Push Schema to PostgreSQL** | `npx prisma db push` |
| **Wipe All Demo/Test Data** | `npm run db:clean` |
| **Generate Prisma Client** | `npx prisma generate` |
