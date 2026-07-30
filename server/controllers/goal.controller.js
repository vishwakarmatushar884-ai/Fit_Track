import prisma from '../config/prisma.js';

// @desc    Get user goals
// @route   GET /api/goals
export const getGoals = async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new personal goal
// @route   POST /api/goals
export const createGoal = async (req, res, next) => {
  try {
    const { title, category, targetValue, currentValue, unit, deadline } = req.body;

    if (!title || targetValue === undefined) {
      return res.status(400).json({ message: 'Title and target value are required' });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        title,
        category: category || 'Fitness',
        targetValue: parseFloat(targetValue),
        currentValue: currentValue ? parseFloat(currentValue) : 0,
        unit: unit || 'kg',
        deadline: deadline || null,
        status: 'in_progress'
      }
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress or status
// @route   PATCH /api/goals/:id
export const updateGoal = async (req, res, next) => {
  try {
    const { title, category, targetValue, currentValue, unit, deadline, status } = req.body;

    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    let newStatus = status || existing.status;
    if (currentValue !== undefined && targetValue !== undefined) {
      if (parseFloat(currentValue) >= parseFloat(targetValue)) {
        newStatus = 'completed';
      }
    }

    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        title: title || existing.title,
        category: category || existing.category,
        targetValue: targetValue !== undefined ? parseFloat(targetValue) : existing.targetValue,
        currentValue: currentValue !== undefined ? parseFloat(currentValue) : existing.currentValue,
        unit: unit || existing.unit,
        deadline: deadline !== undefined ? deadline : existing.deadline,
        status: newStatus
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
export const deleteGoal = async (req, res, next) => {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await prisma.goal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};
