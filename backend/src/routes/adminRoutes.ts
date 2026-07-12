import { Router } from 'express';
import {
  getStats,
  getUsers,
  getCompanies,
  deleteUser,
  sendSystemNotification
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);
router.use(requireRole(['ADMIN']) as any);

router.get('/stats', getStats as any);
router.get('/users', getUsers as any);
router.get('/companies', getCompanies as any);
router.delete('/users/:id', deleteUser as any);
router.post('/notifications', sendSystemNotification as any);

export default router;
