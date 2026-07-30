import prisma from '../config/prisma.js';

// @desc    Get user fitness journal entries
// @route   GET /api/journal
export const getJournals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, date } = req.query;

    const where = { userId };
    if (date) {
      where.date = date;
    }
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { mood: { contains: search } }
      ];
    }

    const journals = await prisma.journal.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(journals);
  } catch (error) {
    next(error);
  }
};

// @desc    Create journal entry
// @route   POST /api/journal
export const createJournal = async (req, res, next) => {
  try {
    const { mood, content, date } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Journal content is required' });
    }

    const journalDate = date || new Date().toISOString().split('T')[0];

    const journal = await prisma.journal.create({
      data: {
        userId: req.user.id,
        mood: mood || '😊 Energetic',
        content,
        date: journalDate
      }
    });

    res.status(201).json(journal);
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
export const updateJournal = async (req, res, next) => {
  try {
    const { mood, content, date } = req.body;

    const existing = await prisma.journal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const updated = await prisma.journal.update({
      where: { id: req.params.id },
      data: {
        mood: mood || existing.mood,
        content: content || existing.content,
        date: date || existing.date
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
export const deleteJournal = async (req, res, next) => {
  try {
    const existing = await prisma.journal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await prisma.journal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    next(error);
  }
};
