import prisma from '../config/prisma.js';

// @desc    Get weight history & change stats
// @route   GET /api/weight
export const getWeightHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { range } = req.query; // week, month, year, all

    const logs = await prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const profile = await prisma.profile.findUnique({ where: { userId } });

    let filteredLogs = logs;
    const now = new Date();

    if (range === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredLogs = logs.filter(l => new Date(l.date) >= sevenDaysAgo);
    } else if (range === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      filteredLogs = logs.filter(l => new Date(l.date) >= thirtyDaysAgo);
    } else if (range === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filteredLogs = logs.filter(l => new Date(l.date) >= oneYearAgo);
    }

    const firstWeight = logs.length > 0 ? logs[0].weight : (profile?.weight || 70);
    const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : (profile?.weight || 70);
    const weightChange = Math.round((latestWeight - firstWeight) * 10) / 10;
    const targetWeight = profile?.targetWeight || 68;
    const remainingToTarget = Math.round(Math.abs(latestWeight - targetWeight) * 10) / 10;

    res.json({
      logs: filteredLogs,
      stats: {
        initialWeight: firstWeight,
        currentWeight: latestWeight,
        targetWeight,
        weightChange,
        remainingToTarget,
        totalLogs: logs.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log new weight
// @route   POST /api/weight
export const logWeight = async (req, res, next) => {
  try {
    const { weight, date, notes } = req.body;

    if (!weight) {
      return res.status(400).json({ message: 'Weight value is required' });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    const record = await prisma.weightRecord.create({
      data: {
        userId: req.user.id,
        weight: parseFloat(weight),
        date: logDate,
        notes
      }
    });

    // Also update Profile current weight
    await prisma.profile.update({
      where: { userId: req.user.id },
      data: { weight: parseFloat(weight) }
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete weight record
// @route   DELETE /api/weight/:id
export const deleteWeightRecord = async (req, res, next) => {
  try {
    const record = await prisma.weightRecord.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!record) {
      return res.status(404).json({ message: 'Weight record not found' });
    }

    await prisma.weightRecord.delete({ where: { id: req.params.id } });
    res.json({ message: 'Weight record deleted' });
  } catch (error) {
    next(error);
  }
};
