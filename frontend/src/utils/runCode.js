import { LANGUAGES } from './codeUtils';

const CLIENT_LANGUAGES = new Set(
  LANGUAGES.filter((l) => l.mode === 'client').map((l) => l.value)
);

const SERVER_LANGUAGES = new Set(
  LANGUAGES.filter((l) => l.mode === 'server').map((l) => l.value)
);

export const isClientRunnable = (language) => CLIENT_LANGUAGES.has(language);

export const isServerRunnable = (language) => SERVER_LANGUAGES.has(language);

export const canRunLanguage = (language) =>
  LANGUAGES.some((l) => l.value === language && l.runnable);

const formatValue = (value) => {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const runJavaScript = (code) => {
  const logs = [];

  const capture =
    (prefix = '') =>
    (...args) => {
      const line = args.map(formatValue).join(' ');
      logs.push(prefix ? `${prefix}${line}` : line);
    };

  const sandboxConsole = {
    log: capture(),
    info: capture('[info] '),
    warn: capture('[warn] '),
    error: capture('[error] '),
    debug: capture('[debug] '),
  };

  try {
    const runner = new Function('console', `"use strict";\n${code}`);
    const result = runner(sandboxConsole);

    if (result !== undefined) {
      logs.push(formatValue(result));
    }

    return {
      success: true,
      output: logs.join('\n') || '(no output)',
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      output: logs.join('\n'),
      error: err.message || 'Runtime error',
    };
  }
};

export const runHtml = (code) => ({
  success: true,
  output: 'HTML preview rendered below.',
  error: null,
  htmlPreview: code,
});

export const runCss = (code) => ({
  success: true,
  output: 'CSS preview rendered below.',
  error: null,
  htmlPreview: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>${code}</style></head>
<body>
  <h1>CodeNova Preview</h1>
  <p>Sample paragraph text.</p>
  <button type="button">Sample button</button>
</body>
</html>`,
});

export const runJson = (code) => {
  try {
    const parsed = JSON.parse(code);
    return {
      success: true,
      output: JSON.stringify(parsed, null, 2),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err.message || 'Invalid JSON',
    };
  }
};

export const runCodeLocally = (code, language) => {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return runJavaScript(code);
    case 'html':
      return runHtml(code);
    case 'css':
      return runCss(code);
    case 'json':
      return runJson(code);
    default:
      return {
        success: false,
        output: '',
        error: `${language} runs on the server. Click Run to execute via the API.`,
      };
  }
};
