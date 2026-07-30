import prisma from '../config/prisma.js';

// Helper function to calculate duration from HH:mm to HH:mm
const calculateSleepDuration = (sleepTime, wakeTime) => {
  if (!sleepTime || !wakeTime) return 8.0;

  const [sHours, sMins] = sleepTime.split(':').map(Number);
  const [wHours, wMins] = wakeTime.split(':').map(Number);

  let sleepDate = new Date(2026, 0, 1, sHours, sMins);
  let wakeDate = new Date(2026, 0, 1, wHours, wMins);

  if (wakeDate <= sleepDate) {
    wakeDate.setDate(wakeDate.getDate() + 1);
  }

  const diffMs = wakeDate - sleepDate;
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10;
};

// @desc    Get sleep history & summary averages
// @route   GET /api/sleep
export const getSleepLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const logs = await prisma.sleepRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const weeklyLogs = logs.filter(l => new Date(l.date) >= sevenDaysAgo);
    const monthlyLogs = logs.filter(l => new Date(l.date) >= thirtyDaysAgo);

    const weeklyAvg = weeklyLogs.length > 0
      ? Math.round((weeklyLogs.reduce((acc, curr) => acc + curr.durationHours, 0) / weeklyLogs.length) * 10) / 10
      : 0;

    const monthlyAvg = monthlyLogs.length > 0
      ? Math.round((monthlyLogs.reduce((acc, curr) => acc + curr.durationHours, 0) / monthlyLogs.length) * 10) / 10
      : 0;

    res.json({
      logs,
      summary: {
        totalLogs: logs.length,
        weeklyAverage: weeklyAvg,
        monthlyAverage: monthlyAvg,
        latestLog: logs.length > 0 ? logs[0] : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log sleep session
// @route   POST /api/sleep
export const logSleep = async (req, res, next) => {
  try {
    const { sleepTime, wakeTime, qualityScore, date, notes } = req.body;

    if (!sleepTime || !wakeTime) {
      return res.status(400).json({ message: 'Sleep time and Wake time are required' });
    }

    const durationHours = calculateSleepDuration(sleepTime, wakeTime);
    const logDate = date || new Date().toISOString().split('T')[0];

    const sleepRecord = await prisma.sleepRecord.create({
      data: {
        userId: req.user.id,
        sleepTime,
        wakeTime,
        durationHours,
        qualityScore: qualityScore ? parseInt(qualityScore) : 8,
        date: logDate,
        notes
      }
    });

    res.status(201).json(sleepRecord);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sleep record
// @route   DELETE /api/sleep/:id
export const deleteSleepLog = async (req, res, next) => {
  try {
    const record = await prisma.sleepRecord.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!record) {
      return res.status(404).json({ message: 'Sleep log not found' });
    }

    await prisma.sleepRecord.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sleep log deleted' });
  } catch (error) {
    next(error);
  }
};
