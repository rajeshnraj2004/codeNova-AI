import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { executeViaPiston, PISTON_RUNNABLE_LANGUAGES } from './pistonRunner.js';

const MAX_CODE_LENGTH = 50000;
const MAX_OUTPUT_LENGTH = 32000;
const TIMEOUT_MS = 10000;

const isWindows = process.platform === 'win32';

const runProcess = (command, args, timeoutMs = TIMEOUT_MS, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, cwd });
    let stdout = '';
    let stderr = '';
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill();
      reject(new Error(`Execution timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_OUTPUT_LENGTH) {
        killed = true;
        child.kill();
        reject(new Error('Output exceeded maximum size'));
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > MAX_OUTPUT_LENGTH) {
        killed = true;
        child.kill();
        reject(new Error('Output exceeded maximum size'));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      if (!killed) {
        err.isENOENT = err.code === 'ENOENT';
        reject(err);
      }
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (killed) return;
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 1,
      });
    });
  });

const tryCommands = async (commands, args, options = {}) => {
  let lastError;
  for (const cmd of commands) {
    try {
      return await runProcess(cmd[0], [...cmd.slice(1), ...args], options.timeout, options.cwd);
    } catch (err) {
      if (err.isENOENT || err.code === 'ENOENT') {
        lastError = new Error(`${cmd[0]} is not installed on the server`);
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('No runtime available');
};

const formatResult = (result, runtime = 'local') => {
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  const success = result.exitCode === 0;
  return {
    success,
    output: output || (success ? '(no output)' : ''),
    error: success ? null : output || `Process exited with code ${result.exitCode}`,
    exitCode: result.exitCode,
    runtime,
  };
};

const runSimpleFile = async (tempDir, ext, commands, code) => {
  const filePath = path.join(tempDir, `main${ext}`);
  await fs.writeFile(filePath, code, 'utf8');
  const result = await tryCommands(commands, [filePath]);
  return formatResult(result);
};

const getJavaClassName = (code) => {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : 'Main';
};

const prepareJavaCode = (code) => {
  if (/public\s+class\s+\w+/m.test(code)) return code;
  const indented = code
    .split('\n')
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join('\n');
  return `public class Main {\n  public static void main(String[] args) {\n${indented}\n  }\n}\n`;
};

const LOCAL_RUNNERS = {
  javascript: async (tempDir, code) =>
    runSimpleFile(tempDir, '.js', [['node']], code),

  typescript: async (tempDir, code) =>
    runSimpleFile(tempDir, '.js', [['node']], code),

  python: async (tempDir, code) =>
    runSimpleFile(tempDir, '.py', [['python'], ['python3']], code),

  ruby: async (tempDir, code) =>
    runSimpleFile(tempDir, '.rb', [['ruby']], code),

  php: async (tempDir, code) =>
    runSimpleFile(tempDir, '.php', [['php']], code),

  bash: async (tempDir, code) =>
    runSimpleFile(
      tempDir,
      isWindows ? '.bat' : '.sh',
      isWindows ? [['bash']] : [['bash'], ['sh']],
      code
    ),

  java: async (tempDir, code) => {
    const prepared = prepareJavaCode(code);
    const className = getJavaClassName(prepared);
    const filePath = path.join(tempDir, `${className}.java`);
    await fs.writeFile(filePath, prepared, 'utf8');
    await tryCommands([['javac']], [filePath], { timeout: 15000 });
    const result = await tryCommands([['java']], ['-cp', tempDir, className]);
    return formatResult(result);
  },

  cpp: async (tempDir, code) => {
    const sourcePath = path.join(tempDir, 'main.cpp');
    const outPath = path.join(tempDir, isWindows ? 'main.exe' : 'main');
    await fs.writeFile(sourcePath, code, 'utf8');
    await tryCommands(
      [['g++'], ['c++']],
      ['-std=c++17', sourcePath, '-o', outPath],
      { timeout: 15000 }
    );
    const result = await tryCommands([[outPath]], []);
    return formatResult(result);
  },

  c: async (tempDir, code) => {
    const sourcePath = path.join(tempDir, 'main.c');
    const outPath = path.join(tempDir, isWindows ? 'main.exe' : 'main');
    await fs.writeFile(sourcePath, code, 'utf8');
    await tryCommands([['gcc']], [sourcePath, '-o', outPath], { timeout: 15000 });
    const result = await tryCommands([[outPath]], []);
    return formatResult(result);
  },

  go: async (tempDir, code) => {
    const filePath = path.join(tempDir, 'main.go');
    await fs.writeFile(filePath, code, 'utf8');
    const result = await tryCommands([['go']], ['run', filePath], { timeout: 15000 });
    return formatResult(result);
  },

  rust: async (tempDir, code) => {
    const sourcePath = path.join(tempDir, 'main.rs');
    const outPath = path.join(tempDir, isWindows ? 'main.exe' : 'main');
    await fs.writeFile(sourcePath, code, 'utf8');
    await tryCommands([['rustc']], [sourcePath, '-o', outPath], { timeout: 20000 });
    const result = await tryCommands([[outPath]], []);
    return formatResult(result);
  },

  csharp: async (tempDir, code) => {
    await fs.writeFile(path.join(tempDir, 'Program.cs'), code, 'utf8');
    await fs.writeFile(
      path.join(tempDir, 'App.csproj'),
      `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>`,
      'utf8'
    );
    const result = await tryCommands([['dotnet']], ['run', '--project', tempDir], {
      timeout: 20000,
      cwd: tempDir,
    });
    return formatResult(result);
  },

  kotlin: async (tempDir, code) => {
    const filePath = path.join(tempDir, 'Main.kt');
    await fs.writeFile(filePath, code, 'utf8');
    const jarPath = path.join(tempDir, 'main.jar');
    await tryCommands([['kotlinc']], [filePath, '-include-runtime', '-d', jarPath], { timeout: 20000 });
    const result = await tryCommands([['java']], ['-jar', jarPath]);
    return formatResult(result);
  },
};

/** Languages that run in-browser only */
export const CLIENT_ONLY_LANGUAGES = ['html', 'css', 'json'];

const RUNTIME_HINTS = {
  javascript: 'Install Node.js',
  typescript: 'Install Node.js',
  python: 'Install Python 3',
  java: 'Install JDK (javac + java)',
  cpp: 'Install MinGW or MSVC (g++)',
  c: 'Install GCC (gcc)',
  go: 'Install Go',
  rust: 'Install Rust (rustc)',
  ruby: 'Install Ruby',
  php: 'Install PHP',
  bash: 'Install Git Bash or WSL',
  csharp: 'Install .NET SDK',
  kotlin: 'Install Kotlin compiler',
  swift: 'Set PISTON_ENABLED=true with self-hosted Piston',
  scala: 'Set PISTON_ENABLED=true with self-hosted Piston',
  r: 'Set PISTON_ENABLED=true with self-hosted Piston',
  perl: 'Set PISTON_ENABLED=true with self-hosted Piston',
  lua: 'Set PISTON_ENABLED=true with self-hosted Piston',
  haskell: 'Set PISTON_ENABLED=true with self-hosted Piston',
};

/** All languages executable via API (server) */
export const SERVER_RUNNABLE_LANGUAGES = [
  ...new Set([...Object.keys(LOCAL_RUNNERS), ...PISTON_RUNNABLE_LANGUAGES]),
].filter((lang) => !CLIENT_ONLY_LANGUAGES.includes(lang));

/** Prefer local Node/Python when available; use Piston for compiled / exotic langs */
const LOCAL_FIRST_LANGUAGES = new Set(['javascript', 'typescript', 'python', 'ruby', 'php']);

export const getSupportedLanguages = () =>
  SERVER_RUNNABLE_LANGUAGES.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    modes: ['server'],
  })).concat(
    CLIENT_ONLY_LANGUAGES.map((id) => ({
      id,
      label: id.toUpperCase(),
      modes: ['client'],
    }))
  );

export const executeCode = async (code, language) => {
  if (!code?.trim()) throw new Error('No code to run');
  if (code.length > MAX_CODE_LENGTH) throw new Error('Code exceeds maximum length');

  if (CLIENT_ONLY_LANGUAGES.includes(language)) {
    throw new Error(`${language} runs in the browser only`);
  }

  if (!SERVER_RUNNABLE_LANGUAGES.includes(language)) {
    throw new Error(`Execution is not supported for ${language}`);
  }

  const tempDir = path.join(os.tmpdir(), 'codenova-run', randomUUID());

  const tryLocal = async () => {
    const runner = LOCAL_RUNNERS[language];
    if (!runner) return null;
    await fs.mkdir(tempDir, { recursive: true });
    try {
      return await runner(tempDir, code);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  };

  const tryPiston = async () => executeViaPiston(code, language);

  const attempts = LOCAL_FIRST_LANGUAGES.has(language)
    ? [tryLocal, tryPiston]
    : [tryPiston, tryLocal];

  let lastError;
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) return result;
    } catch (err) {
      lastError = err;
    }
  }

  const hint = RUNTIME_HINTS[language] || 'Install the language runtime';
  throw new Error(
    `Could not run ${language}. ${hint}.` +
      (lastError ? ` (${lastError.message})` : '')
  );
};
