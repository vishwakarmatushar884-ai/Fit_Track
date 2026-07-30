# FitTrack – Personal Fitness & Health Tracker

**FitTrack** is a production-quality, modular, full-stack personal fitness and health tracking web application. Built with React (Vite), Tailwind CSS, Node.js, Express.js, and Prisma ORM, it empowers users to track workouts, live exercise sessions, MET calories burned, diet notes, macronutrients, daily water intake, weight progression with BMI/BMR metrics, habit streaks, sleep quality, personal goals, progress photos, daily fitness journals, and automated weekly/monthly reports.

---

## Features Overview

### 🔐 Authentication & Profile
- **Full JWT Auth**: Register, Login, Logout with encrypted passwords using bcrypt.
- **Profile Customization**: Name, Age, Gender, Height, Weight, Fitness Goal, Target Weight, Daily Calorie Goal, Avatar upload.
- **Security & Preferences**: Password change, Dark/Light mode theme toggle, Metric/Imperial unit systems.

### 📊 Interactive Dashboard
- Greeting with dynamic fitness quotes.
- Real-time summary cards: Calories Burned Today, Calories Consumed Today, Water Intake, Workout Completion, Current Weight & Target Delta, Habit Streaks, Sleep Hours.
- Interactive **Recharts** chart showing 7-day energy balance (Calories Burned vs Consumed).

### 🏋️ Workout Management & Live Timer
- **Routine Creator**: Full CRUD for workout routines categorized by muscle group (Chest, Back, Legs, Arms, Shoulder, Cardio, Core, Yoga, Stretching, Custom).
- **Interactive Live Timer**: Start, Pause, Resume, Stop, and Reset live timers with real-time MET calorie burn calculations.
- **Exercise History**: Comprehensive log with search, category filtering, deletion, and CSV export.

### 🥗 Diet Notes & Macro Tracker
- Categorized food logging for **Breakfast**, **Lunch**, **Dinner**, **Snacks**, **Pre Workout**, **Post Workout**, and **Supplements**.
- Detailed macro tracking: Calories (kcal), Protein (g), Carbohydrates (g), and Fat (g).

### 💧 Water Intake Tracker
- Interactive glass tracker (+250ml per glass).
- Customizable daily target goal with progress bar and daily auto-reset.

### ⚖️ Weight & Body Metrics
- Weight progression history chart (Weekly, Monthly, Yearly).
- Automated **BMI (Body Mass Index)** and **BMR (Basal Metabolic Rate)** calculators.

### ✅ Habit Tracker
- Habit checkoff system with automatic daily status reset and streak tracking.
- Create custom daily habits with live progress bar.

### 😴 Sleep & Recovery Tracker
- Log bedtime, wake time, sleep duration, and 1-10 quality ratings.
- Computes weekly and monthly sleep averages.

### 🎯 Goal Manager
- Target milestone tracker with progress bars and instant progress value updates.

### 📸 Progress Photos Timeline
- Upload body transformation photos (Front, Side, Back views).
- Side-by-side photo comparison viewer.

### 📓 Daily Fitness Journal
- Mindset and workout reflection logging with mood indicators.

### 📄 Automated Reports & Exports
- Automated **Weekly** and **Monthly** summary reports.
- Export reports to **PDF** (using `jspdf` & `html2canvas`) and **CSV** data spreadsheets.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React Icons, Axios, React Router v6, jsPDF, html2canvas
- **Backend**: Node.js, Express.js (ES Modules), JWT Authentication, bcryptjs, Multer, Express Validator, CORS, dotenv
- **Database & ORM**: SQLite (default for zero-setup local execution) / PostgreSQL with Prisma ORM

---

## Project Structure

```text
FitTrack/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/ (Sidebar, Header, GlobalSearchModal, ConfirmationModal, LoadingSkeleton)
│   │   ├── context/ (AuthContext, ThemeContext, ToastContext)
│   │   ├── layouts/ (MainLayout, AuthLayout)
│   │   ├── pages/ (Dashboard, Workouts, Diet, Water, Weight, Habits, Sleep, Goals, Photos, Journal, Reports, Settings, Login, Register)
│   │   ├── routes/ (AppRoutes, ProtectedRoute)
│   │   ├── services/ (api.js)
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/
    ├── config/ (prisma.js)
    ├── controllers/ (auth, dashboard, workout, diet, water, weight, habit, sleep, goal, photo, journal, notification, report)
    ├── middleware/ (auth, upload, error)
    ├── prisma/ (schema.prisma, seed.js)
    ├── routes/ (auth, dashboard, workout, diet, water, weight, habit, sleep, goal, photo, journal, notification, report)
    ├── utils/ (metCalculator.js)
    ├── uploads/
    ├── server.js
    └── package.json
```

---

## Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Backend Setup
```bash
cd server
npm install

# Initialize Prisma Database & Seed Demo Data
npx prisma db push
node prisma/seed.js

# Start Backend Server (Runs on port 5000)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install

# Start Frontend Dev Server (Runs on port 3000)
npm run dev
```

### 4. Demo Login Credentials
- **Email**: `demo@fittrack.com`
- **Password**: `password123`

---

## Environment Variables

Server `.env`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="fittrack_super_secret_jwt_key_2026_fitness"
NODE_ENV="development"
```

---

## Future Improvements
- Apple HealthKit / Google Fit API synchronization.
- AI Personal Trainer workout recommendation engine.
- Social sharing & fitness leaderboard for friends.
