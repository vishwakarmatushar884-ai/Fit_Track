import express from 'express';
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal
} from '../controllers/journal.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getJournals)
  .post(createJournal);

router.route('/:id')
  .put(updateJournal)
  .delete(deleteJournal);

export default router;
