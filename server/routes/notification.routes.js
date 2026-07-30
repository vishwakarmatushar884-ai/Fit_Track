import express from 'express';
import {
  getNotificationSettings,
  updateNotificationSettings
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotificationSettings)
  .put(updateNotificationSettings);

export default router;
