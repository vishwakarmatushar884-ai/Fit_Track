import prisma from '../config/prisma.js';

// @desc    Get user to-do list items
// @route   GET /api/todos
export const getTodos = async (req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(todos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new to-do task
// @route   POST /api/todos
export const createTodo = async (req, res, next) => {
  try {
    const { title, category, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const todo = await prisma.todo.create({
      data: {
        userId: req.user.id,
        title,
        category: category || 'General',
        priority: priority || 'Medium',
        dueDate: dueDate || null
      }
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle completion status of a task
// @route   PATCH /api/todos/:id/toggle
export const toggleTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: { completed: !existing.completed }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a to-do task
// @route   PUT /api/todos/:id
export const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, priority, dueDate, completed } = req.body;

    const existing = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        category: category !== undefined ? category : existing.category,
        priority: priority !== undefined ? priority : existing.priority,
        dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
        completed: completed !== undefined ? completed : existing.completed
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a to-do task
// @route   DELETE /api/todos/:id
export const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.todo.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all completed tasks
// @route   DELETE /api/todos/completed/clear
export const clearCompletedTodos = async (req, res, next) => {
  try {
    await prisma.todo.deleteMany({
      where: {
        userId: req.user.id,
        completed: true
      }
    });

    res.json({ message: 'Completed tasks cleared successfully' });
  } catch (error) {
    next(error);
  }
};
