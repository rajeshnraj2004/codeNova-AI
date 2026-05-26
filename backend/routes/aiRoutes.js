import express from 'express';
import { generateCode, fixCode, explainCode, pingAI, listModels } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  req.user = null;
  next();
};

router.post('/generate', optionalAuth, generateCode);
router.post('/fix', optionalAuth, fixCode);
router.post('/explain', optionalAuth, explainCode);
router.get('/ping', pingAI);
router.get('/models', listModels);

export default router;
