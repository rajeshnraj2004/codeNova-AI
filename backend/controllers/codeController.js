import {
  executeCode,
  SERVER_RUNNABLE_LANGUAGES,
  CLIENT_ONLY_LANGUAGES,
  getSupportedLanguages,
} from '../services/codeRunner.js';

export const runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ success: false, message: 'Language is required' });
    }

    const runnable = [...SERVER_RUNNABLE_LANGUAGES, ...CLIENT_ONLY_LANGUAGES];
    if (!runnable.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}`,
        supported: runnable,
      });
    }

    if (CLIENT_ONLY_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `${language} runs in the browser. Use the playground Run button.`,
      });
    }

    const result = await executeCode(code, language);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to run code',
    });
  }
};

export const getLanguages = (_req, res) => {
  res.json({
    success: true,
    data: {
      server: SERVER_RUNNABLE_LANGUAGES,
      client: CLIENT_ONLY_LANGUAGES,
      all: getSupportedLanguages(),
    },
  });
};
