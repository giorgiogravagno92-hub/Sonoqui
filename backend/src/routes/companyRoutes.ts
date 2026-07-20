import { Router } from 'express';
import {
  searchWorkers,
  getProfile,
  updateProfile,
  updateCompanyProfile,
  getWorkerDetails,
  toggleFavorite,
  getFavorites,
  requestInterview,
  createProposal,
  getProposals,
  updateProposal,
  deleteProposal
} from '../controllers/companyController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.get('/search', requireRole(['COMPANY', 'ADMIN']) as any, searchWorkers as any);
router.get('/profile', requireRole(['COMPANY']) as any, getProfile as any);
router.put('/profile', requireRole(['COMPANY']) as any, updateCompanyProfile as any);
router.get('/workers/:id', requireRole(['COMPANY']) as any, getWorkerDetails as any);
router.post('/favorites', requireRole(['COMPANY']) as any, toggleFavorite as any);
router.get('/favorites', requireRole(['COMPANY']) as any, getFavorites as any);
router.post('/interviews', requireRole(['COMPANY']) as any, requestInterview as any);

router.post('/proposals', requireRole(['COMPANY']) as any, createProposal as any);
router.get('/proposals', requireRole(['COMPANY']) as any, getProposals as any);
router.put('/proposals/:id', requireRole(['COMPANY']) as any, updateProposal as any);
router.delete('/proposals/:id', requireRole(['COMPANY']) as any, deleteProposal as any);

export default router;
