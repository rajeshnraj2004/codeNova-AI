import express from 'express';
import {
  getHistory,
  getSnippets,
  createSnippet,
  deleteSnippet,
  getStats,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/history', getHistory);
router.get('/snippets', getSnippets);
router.post('/snippets', createSnippet);
router.delete('/snippets/:id', deleteSnippet);
router.get('/stats', getStats);

export default router;
