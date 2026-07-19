"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wpController_1 = require("../controllers/wpController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes (WordPress website frontend reads these)
router.get('/pages/:pageKey', wpController_1.getPage);
router.get('/posts', wpController_1.getPosts);
router.get('/posts/:slug', wpController_1.getPostBySlug);
router.get('/faqs', wpController_1.getFAQs);
// Protected routes (Admin editing WordPress content)
router.get('/settings', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.getSettings);
router.put('/settings', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.updateSettings);
router.put('/pages/:pageKey', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.updatePageContent);
router.post('/posts', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.createPost);
router.delete('/posts/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.deletePost);
router.post('/faqs', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.createFAQ);
router.delete('/faqs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), wpController_1.deleteFAQ);
exports.default = router;
