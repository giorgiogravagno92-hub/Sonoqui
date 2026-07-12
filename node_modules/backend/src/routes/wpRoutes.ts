import { Router } from 'express';
import {
  getPage,
  getPosts,
  getPostBySlug,
  getFAQs,
  getSettings,
  updateSettings,
  updatePageContent,
  createPost,
  deletePost,
  createFAQ,
  deleteFAQ
} from '../controllers/wpController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public routes (WordPress website frontend reads these)
router.get('/pages/:pageKey', getPage as any);
router.get('/posts', getPosts as any);
router.get('/posts/:slug', getPostBySlug as any);
router.get('/faqs', getFAQs as any);

// Protected routes (Admin editing WordPress content)
router.get('/settings', authenticateToken as any, requireRole(['ADMIN']) as any, getSettings as any);
router.put('/settings', authenticateToken as any, requireRole(['ADMIN']) as any, updateSettings as any);
router.put('/pages/:pageKey', authenticateToken as any, requireRole(['ADMIN']) as any, updatePageContent as any);
router.post('/posts', authenticateToken as any, requireRole(['ADMIN']) as any, createPost as any);
router.delete('/posts/:id', authenticateToken as any, requireRole(['ADMIN']) as any, deletePost as any);
router.post('/faqs', authenticateToken as any, requireRole(['ADMIN']) as any, createFAQ as any);
router.delete('/faqs/:id', authenticateToken as any, requireRole(['ADMIN']) as any, deleteFAQ as any);

export default router;
