import ChatHistory from '../models/ChatHistory.js';
import Snippet from '../models/Snippet.js';

export const getHistory = async (req, res) => {
  const history = await ChatHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, data: history });
};

export const getSnippets = async (req, res) => {
  const snippets = await Snippet.find({ user: req.user._id }).sort({ updatedAt: -1 });

  res.json({ success: true, data: snippets });
};

export const createSnippet = async (req, res) => {
  const { title, code, language } = req.body;

  if (!title || !code) {
    return res.status(400).json({ success: false, message: 'Title and code are required' });
  }

  const snippet = await Snippet.create({
    user: req.user._id,
    title,
    code,
    language: language || 'javascript',
  });

  res.status(201).json({ success: true, data: snippet });
};

export const deleteSnippet = async (req, res) => {
  const snippet = await Snippet.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!snippet) {
    return res.status(404).json({ success: false, message: 'Snippet not found' });
  }

  await snippet.deleteOne();
  res.json({ success: true, message: 'Snippet deleted' });
};

export const getStats = async (req, res) => {
  const userId = req.user._id;

  const [generateCount, fixCount, explainCount, snippetCount, aiUsageCount] =
    await Promise.all([
      ChatHistory.countDocuments({ user: userId, type: 'generate' }),
      ChatHistory.countDocuments({ user: userId, type: 'fix' }),
      ChatHistory.countDocuments({ user: userId, type: 'explain' }),
      Snippet.countDocuments({ user: userId }),
      ChatHistory.countDocuments({ user: userId }),
    ]);

  const totalChats = aiUsageCount;

  res.json({
    success: true,
    data: {
      totalChats,
      generateCount,
      fixCount,
      explainCount,
      snippetCount,
      aiUsageCount,
    },
  });
};
