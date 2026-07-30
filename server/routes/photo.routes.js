import express from 'express';
import {
  getProgressPhotos,
  uploadProgressPhoto,
  deleteProgressPhoto
} from '../controllers/photo.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProgressPhotos)
  .post(upload.single('photo'), uploadProgressPhoto);

router.delete('/:id', deleteProgressPhoto);

export default router;
