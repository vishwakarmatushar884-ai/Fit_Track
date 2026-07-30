import express from 'express';
import {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit
} from '../controllers/habit.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.patch('/:id/toggle', toggleHabit);
router.delete('/:id', deleteHabit);

export default router;
