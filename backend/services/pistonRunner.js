const PISTON_API = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
const PISTON_TIMEOUT_MS = 15000;

/** Public emkc.org API is whitelist-only; enable only for self-hosted Piston */
export const isPistonEnabled = () => process.env.PISTON_ENABLED === 'true';

/** Piston language + version mapping (emkc.org public API) */
export const PISTON_LANGUAGES = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  csharp: { language: 'csharp', version: '6.12.0' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  bash: { language: 'bash', version: '5.2.0' },
  r: { language: 'r', version: '4.2.0' },
  swift: { language: 'swift', version: '5.3.3' },
  scala: { language: 'scala', version: '3.2.2' },
  perl: { language: 'perl', version: '5.36.0' },
  lua: { language: 'lua', version: '5.4.4' },
  haskell: { language: 'haskell', version: '9.0.1' },
};

const prepareJavaCode = (code) => {
  if (/public\s+class\s+\w+/m.test(code)) return code;
  const indented = code
    .split('\n')
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join('\n');
  return `public class Main {\n  public static void main(String[] args) {\n${indented}\n  }\n}\n`;
};

const prepareCode = (code, language) => {
  if (language === 'java') return prepareJavaCode(code);
  return code;
};

export const executeViaPiston = async (code, language) => {
  if (!isPistonEnabled()) return null;

  const config = PISTON_LANGUAGES[language];
  if (!config) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PISTON_TIMEOUT_MS);

  try {
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: prepareCode(code, language) }],
        run_timeout: 10000,
        compile_timeout: 10000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (errText.includes('whitelist')) {
        return null;
      }
      throw new Error(errText || `Piston API error (${response.status})`);
    }

    const data = await response.json();
    const compileOut = [data.compile?.stdout, data.compile?.stderr].filter(Boolean).join('\n').trim();
    const runOut = [data.run?.stdout, data.run?.stderr].filter(Boolean).join('\n').trim();
    const output = [compileOut, runOut].filter(Boolean).join('\n').trim();
    const compileCode = data.compile?.code ?? 0;
    const runCode = data.run?.code ?? 1;
    const success = compileCode === 0 && runCode === 0;

    return {
      success,
      output: output || (success ? '(no output)' : ''),
      error: success ? null : output || `Process exited with code ${runCode}`,
      exitCode: runCode,
      runtime: 'piston',
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Execution timed out');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

export const PISTON_RUNNABLE_LANGUAGES = Object.keys(PISTON_LANGUAGES);
