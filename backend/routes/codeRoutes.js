import express from 'express';
import { runCode, getLanguages } from '../controllers/codeController.js';

const router = express.Router();

router.get('/languages', getLanguages);
router.post('/run', runCode);

export default router;
