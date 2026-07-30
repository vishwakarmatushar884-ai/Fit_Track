import prisma from '../config/prisma.js';

// @desc    Get diet notes / meals for a date or date range
// @route   GET /api/diet
export const getDietNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, startDate, endDate, mealType } = req.query;

    const where = { userId };
    if (date) {
      where.date = date;
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    if (mealType && mealType !== 'All') {
      where.mealType = mealType;
    }

    const dietNotes = await prisma.dietNote.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Compute totals
    const totalCalories = dietNotes.reduce((acc, curr) => acc + curr.calories, 0);
    const totalProtein = dietNotes.reduce((acc, curr) => acc + curr.protein, 0);
    const totalCarbs = dietNotes.reduce((acc, curr) => acc + curr.carbs, 0);
    const totalFat = dietNotes.reduce((acc, curr) => acc + curr.fat, 0);

    res.json({
      date: date || 'Range',
      items: dietNotes,
      summary: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add meal / diet note
// @route   POST /api/diet
export const createDietNote = async (req, res, next) => {
  try {
    const { mealType, foodName, quantity, calories, protein, carbs, fat, notes, date } = req.body;

    if (!foodName || !mealType) {
      return res.status(400).json({ message: 'Meal type and food name are required' });
    }

    const mealDate = date || new Date().toISOString().split('T')[0];

    const dietNote = await prisma.dietNote.create({
      data: {
        userId: req.user.id,
        mealType,
        foodName,
        quantity: quantity || '1 serving',
        calories: calories ? parseFloat(calories) : 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        notes,
        date: mealDate
      }
    });

    res.status(201).json(dietNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Update diet note
// @route   PUT /api/diet/:id
export const updateDietNote = async (req, res, next) => {
  try {
    const { mealType, foodName, quantity, calories, protein, carbs, fat, notes, date } = req.body;

    const existing = await prisma.dietNote.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Diet note not found' });
    }

    const updated = await prisma.dietNote.update({
      where: { id: req.params.id },
      data: {
        mealType,
        foodName,
        quantity,
        calories: calories !== undefined ? parseFloat(calories) : undefined,
        protein: protein !== undefined ? parseFloat(protein) : undefined,
        carbs: carbs !== undefined ? parseFloat(carbs) : undefined,
        fat: fat !== undefined ? parseFloat(fat) : undefined,
        notes,
        date
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete diet note
// @route   DELETE /api/diet/:id
export const deleteDietNote = async (req, res, next) => {
  try {
    const existing = await prisma.dietNote.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Diet note not found' });
    }

    await prisma.dietNote.delete({ where: { id: req.params.id } });
    res.json({ message: 'Diet note deleted' });
  } catch (error) {
    next(error);
  }
};
