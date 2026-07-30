import prisma from '../config/prisma.js';

// Helper to generate date list
const getDateRangeList = (startDate, endDate) => {
  const dates = [];
  let curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// @desc    Generate Weekly & Monthly Health & Fitness Reports
// @route   GET /api/reports
export const getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period } = req.query; // 'weekly' or 'monthly'

    const now = new Date();
    const daysBack = period === 'monthly' ? 30 : 7;

    const startDateObj = new Date();
    startDateObj.setDate(now.getDate() - daysBack);
    const startDate = startDateObj.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const dateList = getDateRangeList(startDate, endDate);

    // Fetch sessions
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } }
    });

    // Fetch meals
    const meals = await prisma.dietNote.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } }
    });

    // Fetch water intake
    const waterLogs = await prisma.waterIntake.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } }
    });

    // Fetch weight logs
    const weightLogs = await prisma.weightRecord.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    });

    // Fetch habits
    const habits = await prisma.habit.findMany({ where: { userId } });

    // Aggregate statistics
    const workoutDaysSet = new Set(sessions.map(s => s.date));
    const workoutDaysCount = workoutDaysSet.size;
    const missedDaysCount = daysBack - workoutDaysCount;

    const totalCaloriesBurned = Math.round(sessions.reduce((acc, s) => acc + s.caloriesBurned, 0));
    const totalDurationMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

    const totalWaterGlasses = waterLogs.reduce((acc, w) => acc + w.glasses, 0);
    const avgDailyWaterGlasses = waterLogs.length > 0 ? Math.round((totalWaterGlasses / daysBack) * 10) / 10 : 0;

    let startWeight = 0;
    let endWeight = 0;
    let weightDifference = 0;

    if (weightLogs.length > 0) {
      startWeight = weightLogs[0].weight;
      endWeight = weightLogs[weightLogs.length - 1].weight;
      weightDifference = Math.round((endWeight - startWeight) * 10) / 10;
    }

    const totalHabits = habits.length;
    const maxHabitStreak = totalHabits > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    // Daily breakdown for visual export tables/charts
    const dailyBreakdown = dateList.map(dateStr => {
      const daySessions = sessions.filter(s => s.date === dateStr);
      const dayMeals = meals.filter(m => m.date === dateStr);
      const dayWater = waterLogs.find(w => w.date === dateStr);
      const dayWeight = weightLogs.find(w => w.date === dateStr);

      return {
        date: dateStr,
        caloriesBurned: Math.round(daySessions.reduce((a, s) => a + s.caloriesBurned, 0)),
        workoutDurationMin: Math.round(daySessions.reduce((a, s) => a + s.durationSeconds, 0) / 60),
        caloriesConsumed: Math.round(dayMeals.reduce((a, m) => a + m.calories, 0)),
        waterGlasses: dayWater ? dayWater.glasses : 0,
        weight: dayWeight ? dayWeight.weight : null
      };
    });

    res.json({
      period: period || 'weekly',
      startDate,
      endDate,
      totalDays: daysBack,
      summary: {
        workoutDaysCount,
        missedDaysCount,
        totalCaloriesBurned,
        totalDurationMinutes,
        totalWaterGlasses,
        avgDailyWaterGlasses,
        startWeight,
        endWeight,
        weightDifference,
        maxHabitStreak
      },
      dailyBreakdown
    });
  } catch (error) {
    next(error);
  }
};
