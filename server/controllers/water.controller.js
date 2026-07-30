import prisma from '../config/prisma.js';

// @desc    Get water intake for date
// @route   GET /api/water
export const getWaterIntake = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    let waterLog = await prisma.waterIntake.findUnique({
      where: { userId_date: { userId, date } }
    });

    if (!waterLog) {
      waterLog = await prisma.waterIntake.create({
        data: {
          userId,
          date,
          glasses: 0,
          targetGlasses: 12
        }
      });
    }

    res.json(waterLog);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a glass of water
// @route   POST /api/water/add
export const addGlass = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.body.date || new Date().toISOString().split('T')[0];

    const waterLog = await prisma.waterIntake.upsert({
      where: { userId_date: { userId, date } },
      update: { glasses: { increment: 1 } },
      create: { userId, date, glasses: 1, targetGlasses: 12 }
    });

    res.json(waterLog);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a glass of water
// @route   POST /api/water/remove
export const removeGlass = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.body.date || new Date().toISOString().split('T')[0];

    let current = await prisma.waterIntake.findUnique({
      where: { userId_date: { userId, date } }
    });

    if (current && current.glasses > 0) {
      current = await prisma.waterIntake.update({
        where: { userId_date: { userId, date } },
        data: { glasses: current.glasses - 1 }
      });
    }

    res.json(current || { glasses: 0, targetGlasses: 12, date });
  } catch (error) {
    next(error);
  }
};

// @desc    Set custom daily water goal
// @route   PUT /api/water/goal
export const setWaterGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetGlasses, date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const waterLog = await prisma.waterIntake.upsert({
      where: { userId_date: { userId, date: targetDate } },
      update: { targetGlasses: parseInt(targetGlasses) },
      create: { userId, date: targetDate, glasses: 0, targetGlasses: parseInt(targetGlasses) }
    });

    res.json(waterLog);
  } catch (error) {
    next(error);
  }
};
