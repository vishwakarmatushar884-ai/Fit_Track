import express from 'express';
import { getReports } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getReports);

export default router;
