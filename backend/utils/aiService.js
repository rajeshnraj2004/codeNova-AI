const SYSTEM_PROMPT = `You are CodeNova AI, an expert coding assistant. You help developers write, debug, and understand code.
Always respond with clean, production-ready code when generating or fixing.
Support languages: JavaScript, Python, React, Node.js, Java, C++, TypeScript, HTML, CSS, and more.
Format code responses in markdown code blocks with the correct language tag.`;

const buildMessages = (userContent) => [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: userContent },
];

async function callOpenAI(messages) {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    });

    return completion.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    const statusCode = error?.status || error?.response?.status || 500;
    const message =
      error?.error?.message ||
      error?.message ||
      'OpenAI request failed. Please check your API settings.';

    const wrappedError = new Error(message);
    wrappedError.statusCode = statusCode;
    wrappedError.code = error?.code || error?.error?.code;
    throw wrappedError;
  }
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'text-bison-001';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generate?key=${apiKey}`;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: {
        text: `${SYSTEM_PROMPT}\n\n${prompt}`,
      },
      temperature: 0.3,
      maxOutputTokens: 1024,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Gemini API error: ${res.status} ${errText}`);
    err.statusCode = res.status;
    throw err;
  }

  const data = await res.json();
  return (
    data.output?.[0]?.content?.[0]?.text ||
    data.candidates?.[0]?.output?.[0]?.content?.[0]?.text ||
    'No response generated.'
  );
}

async function callOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const res = await fetch('https://openrouter.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`OpenRouter API error: ${res.status} ${errText}`);
    err.statusCode = res.status;
    throw err;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

export async function generateAIResponse(prompt) {
  const provider = process.env.AI_PROVIDER || 'openai';

  if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    return callGemini(prompt);
  }

  const messages = buildMessages(prompt);

  if (provider === 'openrouter') {
    try {
      return await callOpenRouter(messages);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const isQuotaError = statusCode === 429;

      if (isQuotaError && process.env.OPENAI_API_KEY) {
        console.warn('OpenRouter quota hit, falling back to OpenAI:', error.message);
        return callOpenAI(messages);
      }

      if (process.env.OPENAI_API_KEY) {
        console.warn('OpenRouter failed, falling back to OpenAI:', error.message);
        return callOpenAI(messages);
      }

      throw error;
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return callOpenAI(messages);
}

export async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Gemini Models error: ${res.status} ${errText}`);
    err.statusCode = res.status;
    throw err;
  }

  const data = await res.json();
  return data.models || data;
}

export const buildGeneratePrompt = (prompt, language) =>
  `Generate ${language} code for the following request. Only output the code with brief comments where helpful.\n\nRequest: ${prompt}`;

export const buildFixPrompt = (code, language) =>
  `Fix all bugs in this ${language} code. Return the corrected full code and briefly list what was fixed.\n\n\`\`\`${language}\n${code}\n\`\`\``;

export const buildExplainPrompt = (code, language) =>
  `Explain this ${language} code line-by-line in clear, educational language. Use markdown formatting.\n\n\`\`\`${language}\n${code}\n\`\`\``;
