import express from 'express';
import {
  getDietNotes,
  createDietNote,
  updateDietNote,
  deleteDietNote
} from '../controllers/diet.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDietNotes)
  .post(createDietNote);

router.route('/:id')
  .put(updateDietNote)
  .delete(deleteDietNote);

export default router;
