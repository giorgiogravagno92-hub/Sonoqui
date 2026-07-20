import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  toggleAvailability,
  getNotifications,
  markNotificationRead,
  getInterviewRequests,
  respondToInterviewRequest,
  uploadCv,
  uploadPhoto,
  getProposalsForWorker,
  respondToJobProposal
} from '../controllers/workerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Apply auth token to all worker routes
router.use(authenticateToken as any);

router.get('/profile', requireRole(['WORKER']) as any, getProfile as any);
router.put('/profile', requireRole(['WORKER']) as any, updateProfile as any);
router.put('/availability', requireRole(['WORKER']) as any, toggleAvailability as any);
router.post('/upload-cv', requireRole(['WORKER']) as any, uploadCv as any);
router.post('/upload-photo', requireRole(['WORKER']) as any, uploadPhoto as any);
router.get('/notifications', getNotifications as any);
router.put('/notifications/:id/read', markNotificationRead as any);
router.get('/interviews', requireRole(['WORKER']) as any, getInterviewRequests as any);
router.put('/interviews/:id/respond', requireRole(['WORKER']) as any, respondToInterviewRequest as any);
router.get('/proposals', requireRole(['WORKER']) as any, getProposalsForWorker as any);
router.post('/proposals/:id/respond', requireRole(['WORKER']) as any, respondToJobProposal as any);

export default router;
