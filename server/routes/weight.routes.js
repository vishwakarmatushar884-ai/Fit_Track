import express from 'express';
import {
  getWeightHistory,
  logWeight,
  deleteWeightRecord
} from '../controllers/weight.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWeightHistory)
  .post(logWeight);

router.delete('/:id', deleteWeightRecord);

export default router;
