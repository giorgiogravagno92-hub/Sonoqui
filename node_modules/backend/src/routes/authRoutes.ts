import { Router } from 'express';
import { register, login, me, socialLoginSimulation } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken as any, me as any);
router.post('/social-login', socialLoginSimulation);

export default router;
