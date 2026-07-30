import prisma from '../config/prisma.js';

// @desc    Get all progress photos by view type or date
// @route   GET /api/photos
export const getProgressPhotos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { viewType } = req.query;

    const where = { userId };
    if (viewType && viewType !== 'All') {
      where.viewType = viewType;
    }

    const photos = await prisma.progressPhoto.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(photos);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload progress photo (Front, Side, Back)
// @route   POST /api/photos
export const uploadProgressPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const { viewType, date, notes } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const photoDate = date || new Date().toISOString().split('T')[0];

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: req.user.id,
        viewType: viewType || 'Front',
        imageUrl,
        date: photoDate,
        notes
      }
    });

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete progress photo
// @route   DELETE /api/photos/:id
export const deleteProgressPhoto = async (req, res, next) => {
  try {
    const photo = await prisma.progressPhoto.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!photo) {
      return res.status(404).json({ message: 'Progress photo not found' });
    }

    await prisma.progressPhoto.delete({ where: { id: req.params.id } });
    res.json({ message: 'Progress photo deleted' });
  } catch (error) {
    next(error);
  }
};
