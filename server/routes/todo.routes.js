import express from 'express';
import {
  getTodos,
  createTodo,
  toggleTodo,
  updateTodo,
  deleteTodo,
  clearCompletedTodos
} from '../controllers/todo.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTodos);
router.post('/', createTodo);
router.delete('/completed/clear', clearCompletedTodos);
router.patch('/:id/toggle', toggleTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
