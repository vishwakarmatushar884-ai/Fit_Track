import express from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  duplicateWorkout,
  completeWorkoutSession,
  getWorkoutSessions,
  deleteWorkoutSession
} from '../controllers/workout.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/sessions')
  .get(getWorkoutSessions)
  .post(completeWorkoutSession);

router.delete('/sessions/:id', deleteWorkoutSession);

router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

router.post('/:id/duplicate', duplicateWorkout);

export default router;
