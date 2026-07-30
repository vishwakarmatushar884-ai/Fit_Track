import prisma from '../config/prisma.js';

// @desc    Get user habits with computed daily status
// @route   GET /api/habits
export const getHabits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    // Map habits with today's completion status
    const formatted = habits.map(h => ({
      ...h,
      completedToday: h.lastCompletedDate === today
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new habit
// @route   POST /api/habits
export const createHabit = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Habit title is required' });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: req.user.id,
        title,
        completed: false,
        streak: 0
      }
    });

    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle habit completion status
// @route   PATCH /api/habits/:id/toggle
export const toggleHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId }
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const isCompletedToday = habit.lastCompletedDate === today;

    let updatedStreak = habit.streak;
    let newLastCompletedDate = habit.lastCompletedDate;
    let newCompletedState = !isCompletedToday;

    if (newCompletedState) {
      // Habit completed today
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      if (habit.lastCompletedDate === yesterday) {
        updatedStreak += 1;
      } else if (habit.lastCompletedDate !== today) {
        updatedStreak = 1; // Streak reset or started
      }
      newLastCompletedDate = today;
    } else {
      // Unchecked today
      updatedStreak = Math.max(0, updatedStreak - 1);
      newLastCompletedDate = null;
    }

    const updated = await prisma.habit.update({
      where: { id: req.params.id },
      data: {
        completed: newCompletedState,
        streak: updatedStreak,
        lastCompletedDate: newLastCompletedDate
      }
    });

    res.json({
      ...updated,
      completedToday: updated.lastCompletedDate === today
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await prisma.habit.delete({ where: { id: req.params.id } });
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    next(error);
  }
};
