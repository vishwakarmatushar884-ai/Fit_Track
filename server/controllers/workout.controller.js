import prisma from '../config/prisma.js';
import { calculateCaloriesBurned, MET_TABLE } from '../utils/metCalculator.js';

// @desc    Get all workouts of user with optional search & filter
// @route   GET /api/workouts
export const getWorkouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, category } = req.query;

    const where = { userId };
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { exercises: { some: { name: { contains: search } } } }
      ];
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: { exercises: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(workouts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
export const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { exercises: true }
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout routine not found' });
    }

    res.json(workout);
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout routine
// @route   POST /api/workouts
export const createWorkout = async (req, res, next) => {
  try {
    const { title, category, description, exercises } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const workout = await prisma.workout.create({
      data: {
        userId: req.user.id,
        title,
        category: category || 'Custom',
        description,
        exercises: {
          create: (exercises || []).map(ex => ({
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'Full Body',
            sets: ex.sets ? parseInt(ex.sets) : 3,
            reps: ex.reps ? parseInt(ex.reps) : 10,
            weight: ex.weight ? parseFloat(ex.weight) : 0,
            duration: ex.duration ? parseInt(ex.duration) : 0,
            restTime: ex.restTime ? parseInt(ex.restTime) : 60,
            notes: ex.notes,
            metValue: ex.metValue || MET_TABLE[ex.name] || MET_TABLE[category] || 5.0
          }))
        }
      },
      include: { exercises: true }
    });

    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout routine
// @route   PUT /api/workouts/:id
export const updateWorkout = async (req, res, next) => {
  try {
    const { title, category, description, exercises } = req.body;

    const existing = await prisma.workout.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Delete existing exercises and recreate
    await prisma.exercise.deleteMany({ where: { workoutId: req.params.id } });

    const updated = await prisma.workout.update({
      where: { id: req.params.id },
      data: {
        title,
        category,
        description,
        exercises: {
          create: (exercises || []).map(ex => ({
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'Full Body',
            sets: ex.sets ? parseInt(ex.sets) : 3,
            reps: ex.reps ? parseInt(ex.reps) : 10,
            weight: ex.weight ? parseFloat(ex.weight) : 0,
            duration: ex.duration ? parseInt(ex.duration) : 0,
            restTime: ex.restTime ? parseInt(ex.restTime) : 60,
            notes: ex.notes,
            metValue: ex.metValue || MET_TABLE[ex.name] || 5.0
          }))
        }
      },
      include: { exercises: true }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
export const deleteWorkout = async (req, res, next) => {
  try {
    const existing = await prisma.workout.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await prisma.workout.delete({ where: { id: req.params.id } });
    res.json({ message: 'Workout routine deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate workout
// @route   POST /api/workouts/:id/duplicate
export const duplicateWorkout = async (req, res, next) => {
  try {
    const existing = await prisma.workout.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { exercises: true }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const duplicated = await prisma.workout.create({
      data: {
        userId: req.user.id,
        title: `${existing.title} (Copy)`,
        category: existing.category,
        description: existing.description,
        exercises: {
          create: existing.exercises.map(ex => ({
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            duration: ex.duration,
            restTime: ex.restTime,
            notes: ex.notes,
            metValue: ex.metValue
          }))
        }
      },
      include: { exercises: true }
    });

    res.status(201).json(duplicated);
  } catch (error) {
    next(error);
  }
};

// @desc    Record completed workout session (from Timer or Manual Log)
// @route   POST /api/workouts/sessions
export const completeWorkoutSession = async (req, res, next) => {
  try {
    const { workoutName, category, durationSeconds, metValue, date, notes } = req.body;

    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });

    const userWeight = userProfile?.weight || 70;
    const durationMinutes = (durationSeconds || 60) / 60;
    const met = metValue || MET_TABLE[category] || 6.0;

    const caloriesBurned = calculateCaloriesBurned(userWeight, met, durationMinutes);
    const sessionDate = date || new Date().toISOString().split('T')[0];

    const session = await prisma.workoutSession.create({
      data: {
        userId: req.user.id,
        workoutName: workoutName || 'Quick Session',
        category: category || 'General',
        durationSeconds: durationSeconds || 0,
        caloriesBurned,
        date: sessionDate,
        notes
      }
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get exercise & session history with search/filter
// @route   GET /api/workouts/sessions
export const getWorkoutSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, category, startDate, endDate } = req.query;

    const where = { userId };
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { workoutName: { contains: search } },
        { notes: { contains: search } }
      ];
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const sessions = await prisma.workoutSession.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout session history record
// @route   DELETE /api/workouts/sessions/:id
export const deleteWorkoutSession = async (req, res, next) => {
  try {
    const session = await prisma.workoutSession.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session history not found' });
    }

    await prisma.workoutSession.delete({ where: { id: req.params.id } });
    res.json({ message: 'Session history deleted' });
  } catch (error) {
    next(error);
  }
};
