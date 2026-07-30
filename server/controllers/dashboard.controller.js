import prisma from '../config/prisma.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Calculate dates for past 7 days
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    // User profile
    const profile = await prisma.profile.findUnique({ where: { userId } });

    // Today's Workouts & Calories Burned
    const todaySessions = await prisma.workoutSession.findMany({
      where: { userId, date: today }
    });
    const todayCaloriesBurned = todaySessions.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
    const todayWorkoutCount = todaySessions.length;

    // Today's Meals & Calories Consumed
    const todayMeals = await prisma.dietNote.findMany({
      where: { userId, date: today }
    });
    const todayCaloriesConsumed = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);

    // Today's Water
    const todayWater = await prisma.waterIntake.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    // Latest Weight Log
    const latestWeightRecord = await prisma.weightRecord.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    // Today's Sleep
    const todaySleep = await prisma.sleepRecord.findFirst({
      where: { userId, date: today }
    });

    // Habits & Streaks
    const habits = await prisma.habit.findMany({ where: { userId } });
    const completedHabitsToday = habits.filter(h => h.lastCompletedDate === today).length;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    // Past 7 Days Aggregation for Weekly Charts
    const weeklySessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        date: { in: past7Days }
      }
    });

    const weeklyMeals = await prisma.dietNote.findMany({
      where: {
        userId,
        date: { in: past7Days }
      }
    });

    const weeklyWeight = await prisma.weightRecord.findMany({
      where: {
        userId,
        date: { in: past7Days }
      },
      orderBy: { date: 'asc' }
    });

    const weeklySummary = past7Days.map(dateStr => {
      const daySessions = weeklySessions.filter(s => s.date === dateStr);
      const dayMeals = weeklyMeals.filter(m => m.date === dateStr);
      const dayWeight = weeklyWeight.find(w => w.date === dateStr);

      const burned = daySessions.reduce((acc, s) => acc + s.caloriesBurned, 0);
      const consumed = dayMeals.reduce((acc, m) => acc + m.calories, 0);

      // Short day name (Mon, Tue, etc.)
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        date: dateStr,
        day: dayName,
        caloriesBurned: Math.round(burned),
        caloriesConsumed: Math.round(consumed),
        weight: dayWeight ? dayWeight.weight : null
      };
    });

    res.json({
      today,
      profile,
      metrics: {
        caloriesBurnedToday: Math.round(todayCaloriesBurned),
        caloriesConsumedToday: Math.round(todayCaloriesConsumed),
        waterGlasses: todayWater ? todayWater.glasses : 0,
        waterTargetGlasses: todayWater ? todayWater.targetGlasses : (profile?.dailyCalorieGoal ? 12 : 12),
        workoutCompletedToday: todayWorkoutCount > 0,
        todayWorkoutCount,
        currentWeight: latestWeightRecord ? latestWeightRecord.weight : (profile?.weight || 70),
        targetWeight: profile?.targetWeight || 68,
        sleepHoursToday: todaySleep ? todaySleep.durationHours : 0,
        currentStreak: maxStreak,
        completedHabitsCount: completedHabitsToday,
        totalHabitsCount: habits.length
      },
      weeklySummary
    });
  } catch (error) {
    next(error);
  }
};
