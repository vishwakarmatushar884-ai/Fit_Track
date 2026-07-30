import express from 'express';
import {
  getSleepLogs,
  logSleep,
  deleteSleepLog
} from '../controllers/sleep.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSleepLogs)
  .post(logSleep);

router.delete('/:id', deleteSleepLog);

export default router;
