import express from 'express';
import {
  getWaterIntake,
  addGlass,
  removeGlass,
  setWaterGoal
} from '../controllers/water.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWaterIntake);
router.post('/add', addGlass);
router.post('/remove', removeGlass);
router.put('/goal', setWaterGoal);

export default router;
