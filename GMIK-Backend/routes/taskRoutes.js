import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  acceptTask, 
  updateTaskStatus,
  updateTask,
  deleteTask,
  getUserTasks
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createTask);
router.get('/user-tasks', authenticateToken, getUserTasks);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/:id/accept', authenticateToken, acceptTask);
router.put('/:id/status', authenticateToken, updateTaskStatus);
router.put('/:id', authenticateToken, updateTask);
router.delete('/:id', authenticateToken, deleteTask);

export default router;
