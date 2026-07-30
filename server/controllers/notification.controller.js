import prisma from '../config/prisma.js';

// @desc    Get notification settings
// @route   GET /api/notifications
export const getNotificationSettings = async (req, res, next) => {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: req.user.id,
          workoutTime: '08:00',
          waterInterval: 60,
          mealTime: '13:00',
          sleepTime: '22:30',
          weightCheck: '07:00',
          enabled: true
        }
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PUT /api/notifications
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const { workoutTime, waterInterval, mealTime, sleepTime, weightCheck, enabled } = req.body;

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: req.user.id },
      update: {
        workoutTime,
        waterInterval: waterInterval ? parseInt(waterInterval) : undefined,
        mealTime,
        sleepTime,
        weightCheck,
        enabled: enabled !== undefined ? Boolean(enabled) : undefined
      },
      create: {
        userId: req.user.id,
        workoutTime: workoutTime || '08:00',
        waterInterval: waterInterval ? parseInt(waterInterval) : 60,
        mealTime: mealTime || '13:00',
        sleepTime: sleepTime || '22:30',
        weightCheck: weightCheck || '07:00',
        enabled: enabled !== undefined ? Boolean(enabled) : true
      }
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
};
