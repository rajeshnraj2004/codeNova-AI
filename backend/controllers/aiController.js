import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import {
  generateAIResponse,
  buildGeneratePrompt,
  buildFixPrompt,
  buildExplainPrompt,
  listGeminiModels,
} from '../utils/aiService.js';

const saveHistory = async (userId, data) => {
  await ChatHistory.create({ user: userId, ...data });
  await User.findByIdAndUpdate(userId, { $inc: { aiUsageCount: 1 } });
};

export const generateCode = async (req, res) => {
  const { prompt, language = 'javascript' } = req.body;

  if (!prompt?.trim()) {
    return res.status(400).json({ success: false, message: 'Prompt is required' });
  }

  try {
    const aiPrompt = buildGeneratePrompt(prompt, language);
    const response = await generateAIResponse(aiPrompt);

    if (req.user) {
      await saveHistory(req.user._id, {
        type: 'generate',
        prompt,
        language,
        response,
      });
    }

    res.json({ success: true, data: { response, language } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isQuotaError = statusCode === 429 || error.code === 'insufficient_quota';
    const message = isQuotaError
      ? 'AI quota exceeded. Please check your plan or retry later.'
      : error.message || 'AI generation failed.';

    res.status(statusCode).json({ success: false, message });
  }
};

export const fixCode = async (req, res) => {
  const { code, language = 'javascript' } = req.body;

  if (!code?.trim()) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  try {
    const aiPrompt = buildFixPrompt(code, language);
    const response = await generateAIResponse(aiPrompt);

    if (req.user) {
      await saveHistory(req.user._id, {
        type: 'fix',
        code,
        language,
        response,
      });
    }

    res.json({ success: true, data: { response, language } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isQuotaError = statusCode === 429 || error.code === 'insufficient_quota';
    const message = isQuotaError
      ? 'AI quota exceeded. Please check your plan or retry later.'
      : error.message || 'AI fix request failed.';

    res.status(statusCode).json({ success: false, message });
  }
};

export const explainCode = async (req, res) => {
  const { code, language = 'javascript' } = req.body;

  if (!code?.trim()) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  try {
    const aiPrompt = buildExplainPrompt(code, language);
    const response = await generateAIResponse(aiPrompt);

    if (req.user) {
      await saveHistory(req.user._id, {
        type: 'explain',
        code,
        language,
        response,
      });
    }

    res.json({ success: true, data: { response, language } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isQuotaError = statusCode === 429 || error.code === 'insufficient_quota';
    const message = isQuotaError
      ? 'AI quota exceeded. Please check your plan or retry later.'
      : error.message || 'AI explain request failed.';

    res.status(statusCode).json({ success: false, message });
  }
};

export const pingAI = (req, res) => {
  res.json({
    success: true,
    provider: process.env.AI_PROVIDER || 'openai',
    keys: {
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
    },
  });
};

export const listModels = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ success: false, message: 'GEMINI_API_KEY not configured' });
    }

    const models = await listGeminiModels();
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
