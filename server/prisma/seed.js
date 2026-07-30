import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FitTrack database...');

  const email = 'demo@fittrack.com';
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  // Clean up existing demo user
  await prisma.user.deleteMany({ where: { email } });

  const today = new Date().toISOString().split('T')[0];

  // Helper for dates relative to today
  const getRelativeDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const user = await prisma.user.create({
    data: {
      email,
      password,
      profile: {
        create: {
          name: 'Alex Mercer',
          age: 26,
          gender: 'Male',
          height: 180,
          weight: 76.5,
          fitnessGoal: 'Lose Weight',
          targetWeight: 72.0,
          dailyCalorieGoal: 2300,
          unitSystem: 'metric',
          theme: 'dark'
        }
      },
      settings: {
        create: {
          workoutTime: '07:30',
          waterInterval: 60,
          mealTime: '12:30',
          sleepTime: '23:00',
          weightCheck: '07:00',
          enabled: true
        }
      }
    }
  });

  console.log(`Created demo user: ${user.email}`);

  // 1. Workouts & Exercises
  const workout1 = await prisma.workout.create({
    data: {
      userId: user.id,
      title: 'Upper Body Hypertrophy',
      category: 'Chest',
      description: 'Focus on chest, shoulders, and triceps explosion.',
      exercises: {
        create: [
          { name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: 10, weight: 80, restTime: 90, metValue: 6.0 },
          { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: 12, weight: 26, restTime: 60, metValue: 5.5 },
          { name: 'Overhead Shoulder Press', muscleGroup: 'Shoulder', sets: 3, reps: 10, weight: 20, restTime: 60, metValue: 5.5 },
          { name: 'Triceps Dips', muscleGroup: 'Arms', sets: 3, reps: 15, weight: 0, restTime: 45, metValue: 5.0 }
        ]
      }
    }
  });

  const workout2 = await prisma.workout.create({
    data: {
      userId: user.id,
      title: 'Leg Day & Core Blast',
      category: 'Legs',
      description: 'Quads, hamstrings, calves and heavy core stability.',
      exercises: {
        create: [
          { name: 'Barbell Squats', muscleGroup: 'Legs', sets: 4, reps: 8, weight: 100, restTime: 120, metValue: 7.5 },
          { name: 'Romanian Deadlifts', muscleGroup: 'Legs', sets: 3, reps: 10, weight: 90, restTime: 90, metValue: 7.0 },
          { name: 'Hanging Leg Raises', muscleGroup: 'Core', sets: 3, reps: 15, weight: 0, restTime: 45, metValue: 4.5 }
        ]
      }
    }
  });

  const workout3 = await prisma.workout.create({
    data: {
      userId: user.id,
      title: 'Morning HIIT & Cardio Burn',
      category: 'Cardio',
      description: 'Fast-paced metabolic conditioning to maximize calorie burn.',
      exercises: {
        create: [
          { name: 'Jump Rope', muscleGroup: 'Cardio', sets: 5, reps: 100, duration: 15, restTime: 30, metValue: 12.0 },
          { name: 'Burpees', muscleGroup: 'Full Body', sets: 4, reps: 15, duration: 10, restTime: 45, metValue: 9.5 }
        ]
      }
    }
  });

  // 2. Past Workout Sessions (Past 7 Days)
  const sessionData = [
    { workoutName: 'Upper Body Hypertrophy', category: 'Chest', durationSeconds: 3300, caloriesBurned: 420, daysAgo: 6, notes: 'Felt strong on bench press!' },
    { workoutName: 'Leg Day & Core Blast', category: 'Legs', durationSeconds: 3600, caloriesBurned: 510, daysAgo: 5, notes: 'Heavy squats felt deep.' },
    { workoutName: 'Morning HIIT & Cardio Burn', category: 'Cardio', durationSeconds: 2400, caloriesBurned: 380, daysAgo: 4, notes: 'Sweat session complete.' },
    { workoutName: 'Upper Body Hypertrophy', category: 'Chest', durationSeconds: 3000, caloriesBurned: 390, daysAgo: 2, notes: 'Pushed reps on incline press.' },
    { workoutName: 'Morning HIIT & Cardio Burn', category: 'Cardio', durationSeconds: 2700, caloriesBurned: 440, daysAgo: 0, notes: 'Today morning workout finished!' }
  ];

  for (const s of sessionData) {
    await prisma.workoutSession.create({
      data: {
        userId: user.id,
        workoutName: s.workoutName,
        category: s.category,
        durationSeconds: s.durationSeconds,
        caloriesBurned: s.caloriesBurned,
        date: getRelativeDate(s.daysAgo),
        notes: s.notes
      }
    });
  }

  // 3. Diet Notes (Today & Recent)
  const mealsData = [
    { mealType: 'Breakfast', foodName: 'Oatmeal with Blueberries & Whey Protein', quantity: '1 bowl', calories: 450, protein: 35, carbs: 55, fat: 8, daysAgo: 0 },
    { mealType: 'Lunch', foodName: 'Grilled Chicken Breast with Quinoa & Broccoli', quantity: '350g', calories: 620, protein: 52, carbs: 65, fat: 12, daysAgo: 0 },
    { mealType: 'Snacks', foodName: 'Greek Yogurt & Almonds', quantity: '200g', calories: 240, protein: 20, carbs: 12, fat: 10, daysAgo: 0 },
    { mealType: 'Dinner', foodName: 'Baked Salmon with Sweet Potato', quantity: '300g', calories: 550, protein: 42, carbs: 45, fat: 18, daysAgo: 0 },
    // Yesterday meals
    { mealType: 'Breakfast', foodName: 'Scrambled Eggs with Avocado Toast', quantity: '2 eggs', calories: 480, protein: 24, carbs: 38, fat: 22, daysAgo: 1 },
    { mealType: 'Lunch', foodName: 'Turkey Wrap with Salad', quantity: '1 wrap', calories: 540, protein: 40, carbs: 48, fat: 14, daysAgo: 1 }
  ];

  for (const m of mealsData) {
    await prisma.dietNote.create({
      data: {
        userId: user.id,
        mealType: m.mealType,
        foodName: m.foodName,
        quantity: m.quantity,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        date: getRelativeDate(m.daysAgo)
      }
    });
  }

  // 4. Water Intake (Past 7 Days)
  for (let i = 0; i < 7; i++) {
    await prisma.waterIntake.create({
      data: {
        userId: user.id,
        glasses: i === 0 ? 9 : Math.floor(Math.random() * 4) + 9, // 9 to 12 glasses
        targetGlasses: 12,
        date: getRelativeDate(i)
      }
    });
  }

  // 5. Weight Records (Past 30 Days Trend)
  const weightData = [
    { weight: 78.5, daysAgo: 30 },
    { weight: 78.0, daysAgo: 24 },
    { weight: 77.6, daysAgo: 18 },
    { weight: 77.2, daysAgo: 12 },
    { weight: 76.8, daysAgo: 6 },
    { weight: 76.5, daysAgo: 0 }
  ];

  for (const w of weightData) {
    await prisma.weightRecord.create({
      data: {
        userId: user.id,
        weight: w.weight,
        date: getRelativeDate(w.daysAgo),
        notes: w.daysAgo === 0 ? 'Morning weight after hydration' : null
      }
    });
  }

  // 6. Habits & Streaks
  const habitsData = [
    { title: 'Morning Exercise Workout', completed: true, streak: 5, lastCompletedDate: today },
    { title: 'Drink 3+ Liters Water', completed: true, streak: 7, lastCompletedDate: today },
    { title: '15 Mins Meditation', completed: false, streak: 3, lastCompletedDate: getRelativeDate(1) },
    { title: 'Stretching & Mobility', completed: true, streak: 4, lastCompletedDate: today },
    { title: 'Sleep Before 11 PM', completed: true, streak: 6, lastCompletedDate: today },
    { title: 'Protein Goal (140g+)', completed: true, streak: 5, lastCompletedDate: today },
    { title: 'Daily Vitamins & Fish Oil', completed: true, streak: 12, lastCompletedDate: today },
    { title: '10,000 Daily Steps', completed: false, streak: 4, lastCompletedDate: getRelativeDate(1) }
  ];

  for (const h of habitsData) {
    await prisma.habit.create({
      data: {
        userId: user.id,
        title: h.title,
        completed: h.completed,
        streak: h.streak,
        lastCompletedDate: h.lastCompletedDate
      }
    });
  }

  // 7. Sleep Records (Past 7 Days)
  const sleepData = [
    { sleepTime: '23:00', wakeTime: '07:30', durationHours: 8.5, qualityScore: 9, daysAgo: 0, notes: 'Woke up feeling deeply refreshed!' },
    { sleepTime: '23:15', wakeTime: '07:15', durationHours: 8.0, qualityScore: 8, daysAgo: 1 },
    { sleepTime: '22:45', wakeTime: '06:45', durationHours: 8.0, qualityScore: 9, daysAgo: 2 },
    { sleepTime: '23:30', wakeTime: '07:00', durationHours: 7.5, qualityScore: 7, daysAgo: 3 },
    { sleepTime: '22:30', wakeTime: '07:00', durationHours: 8.5, qualityScore: 9, daysAgo: 4 }
  ];

  for (const s of sleepData) {
    await prisma.sleepRecord.create({
      data: {
        userId: user.id,
        sleepTime: s.sleepTime,
        wakeTime: s.wakeTime,
        durationHours: s.durationHours,
        qualityScore: s.qualityScore,
        date: getRelativeDate(s.daysAgo),
        notes: s.notes
      }
    });
  }

  // 8. Personal Goals
  const goalsData = [
    { title: 'Drop Weight to 72.0 kg', category: 'Weight', targetValue: 72.0, currentValue: 76.5, unit: 'kg', status: 'in_progress', deadline: getRelativeDate(-45) },
    { title: 'Run 100 km Total Distance', category: 'Fitness', targetValue: 100, currentValue: 64.5, unit: 'km', status: 'in_progress', deadline: getRelativeDate(-30) },
    { title: 'Bench Press 100 kg 1RM', category: 'Fitness', targetValue: 100, currentValue: 85, unit: 'kg', status: 'in_progress', deadline: getRelativeDate(-60) },
    { title: 'Maintain 7-Day Water Streak', category: 'Water', targetValue: 7, currentValue: 7, unit: 'days', status: 'completed', deadline: getRelativeDate(0) }
  ];

  for (const g of goalsData) {
    await prisma.goal.create({
      data: {
        userId: user.id,
        title: g.title,
        category: g.category,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        status: g.status,
        deadline: g.deadline
      }
    });
  }

  // 9. Fitness Journal Entries
  await prisma.journal.create({
    data: {
      userId: user.id,
      mood: '🔥 Highly Motivated',
      content: 'Hit personal best on squats today! Energy levels were off the charts after getting 8.5 hours of quality sleep last night.',
      date: getRelativeDate(0)
    }
  });

  await prisma.journal.create({
    data: {
      userId: user.id,
      mood: '😌 Calm & Focused',
      content: 'Great recovery day. Kept diet super clean and reached 12 glasses of water before 8 PM.',
      date: getRelativeDate(1)
    }
  });

  console.log('FitTrack database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
