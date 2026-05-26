import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles,
  HiLightBulb,
  HiBugAnt,
  HiClipboard,
  HiArrowDownTray,
  HiPlay,
  HiCommandLine,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { aiAPI, codeAPI } from '../services/api';
import {
  LANGUAGES,
  LANGUAGE_TEMPLATES,
  extractCodeFromResponse,
  copyToClipboard,
  downloadCode,
} from '../utils/codeUtils';
import { useTypingEffect } from '../hooks/useTypingEffect';
import {
  canRunLanguage,
  isClientRunnable,
  isServerRunnable,
  runCodeLocally,
} from '../utils/runCode';

const DEFAULT_CODE = LANGUAGE_TEMPLATES.javascript;

const PlaygroundPage = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [runSuccess, setRunSuccess] = useState(null);
  const [running, setRunning] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [runRuntime, setRunRuntime] = useState('');
  const [activePanel, setActivePanel] = useState('output');
  const displayedResponse = useTypingEffect(response, 8, !loading && !!response);

  const handleAI = async (type) => {
    setLoading(true);
    setAction(type);
    setResponse('');
    setActivePanel('ai');

    try {
      let result;
      if (type === 'generate') {
        if (!prompt.trim()) {
          toast.error('Enter a prompt first');
          setLoading(false);
          return;
        }
        result = await aiAPI.generate({ prompt, language });
        const generated = extractCodeFromResponse(result.data.data.response);
        setCode(generated);
        setResponse(result.data.data.response);
      } else if (type === 'fix') {
        result = await aiAPI.fix({ code, language });
        const fixed = extractCodeFromResponse(result.data.data.response);
        setCode(fixed);
        setResponse(result.data.data.response);
      } else if (type === 'explain') {
        result = await aiAPI.explain({ code, language });
        setResponse(result.data.data.response);
      }
      toast.success('AI response ready!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'AI request failed';
      toast.error(msg);
      setResponse(`Error: ${msg}\n\nMake sure your API key is configured in the backend .env file.`);
    } finally {
      setLoading(false);
      setAction('');
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Write some code first');
      return;
    }

    if (!canRunLanguage(language)) {
      toast.error(`Run is not supported for ${language} yet`);
      return;
    }

    setRunning(true);
    setRunOutput('');
    setRunError('');
    setRunSuccess(null);
    setHtmlPreview('');
    setRunRuntime('');
    setActivePanel('output');

    try {
      let result;

      if (isClientRunnable(language)) {
        result = runCodeLocally(code, language);
      } else if (isServerRunnable(language)) {
        const res = await codeAPI.run({ code, language });
        result = res.data.data;
      } else {
        toast.error(`Run is not supported for ${language}`);
        return;
      }

      setRunSuccess(result.success);
      setRunOutput(result.output || '');
      setRunError(result.error || '');
      setHtmlPreview(result.htmlPreview || '');
      setRunRuntime(result.runtime || (isClientRunnable(language) ? 'browser' : ''));

      if (result.success) {
        toast.success('Code executed successfully');
      } else {
        toast.error(result.error || 'Execution failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to run code';
      setRunSuccess(false);
      setRunError(msg);
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(code);
    toast.success('Code copied!');
  };

  const handleDownload = () => {
    downloadCode(code, `codenova.${language === 'javascript' ? 'js' : language}`);
    toast.success('Download started!');
  };

  const runnable = canRunLanguage(language);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (LANGUAGE_TEMPLATES[newLang]) {
      setCode(LANGUAGE_TEMPLATES[newLang]);
      toast.success(`Loaded ${LANGUAGES.find((l) => l.value === newLang)?.label} sample`);
    }
  };

  const clientLangs = LANGUAGES.filter((l) => l.mode === 'client');
  const serverLangs = LANGUAGES.filter((l) => l.mode === 'server');

  return (
    <MainLayout showFooter={false}>
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            AI <span className="gradient-text">Playground</span>
          </h1>
          <p className="text-slate-400 text-sm">Write, run, generate, fix, and explain code with AI</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="glass rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 gap-3">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-surface text-sm text-slate-300 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[180px]"
                >
                  <optgroup label="Browser">
                    {clientLangs.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-card">
                        {lang.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Server">
                    {serverLangs.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-card">
                        {lang.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={running || !runnable}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title={runnable ? 'Run code' : 'Run not available for this language'}
                  >
                    <HiPlay className="w-4 h-4" />
                    {running ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Copy code"
                  >
                    <HiClipboard className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Download code"
                  >
                    <HiArrowDownTray className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="monaco-shell">
                <Editor
                  height="400px"
                  language={language}
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    renderLineHighlight: 'line',
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  }}
                />
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-white/10">
              <label className="text-sm text-slate-400 mb-2 block">AI Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create a React hook for fetching data with loading state..."
                className="w-full h-24 input-field resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                <Button loading={loading && action === 'generate'} onClick={() => handleAI('generate')}>
                  <HiSparkles className="w-4 h-4" /> Generate
                </Button>
                <Button variant="secondary" loading={loading && action === 'fix'} onClick={() => handleAI('fix')}>
                  <HiBugAnt className="w-4 h-4" /> Fix Bugs
                </Button>
                <Button variant="outline" loading={loading && action === 'explain'} onClick={() => handleAI('explain')}>
                  <HiLightBulb className="w-4 h-4" /> Explain
                </Button>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 flex flex-col min-h-[500px]">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <button
                onClick={() => setActivePanel('output')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activePanel === 'output'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HiCommandLine className="w-4 h-4" />
                Output
              </button>
              <button
                onClick={() => setActivePanel('ai')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activePanel === 'ai'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HiSparkles className="w-4 h-4" />
                AI Response
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <AnimatePresence mode="wait">
                {activePanel === 'output' ? (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    {running ? (
                      <LoadingSpinner text="Running code..." />
                    ) : runSuccess !== null || htmlPreview ? (
                      <div className="space-y-4">
                        {runError && (
                          <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono leading-relaxed p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            {runError}
                          </pre>
                        )}
                        {runOutput && (
                          <div>
                            {runRuntime && (
                              <p className="text-xs text-slate-500 mb-2">
                                Runtime: <span className="text-slate-400">{runRuntime}</span>
                              </p>
                            )}
                            <pre
                              className={`text-sm whitespace-pre-wrap font-mono leading-relaxed p-4 rounded-xl border ${
                                runSuccess
                                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                  : 'text-slate-300 bg-surface border-white/10'
                              }`}
                            >
                              {runOutput}
                            </pre>
                          </div>
                        )}
                        {htmlPreview && (
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-white">
                            <iframe
                              title="HTML preview"
                              srcDoc={htmlPreview}
                              sandbox="allow-scripts"
                              className="w-full h-64 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-16">
                        Click <span className="text-emerald-400 font-medium">Run</span> to execute your code.
                        <span className="block mt-2 text-xs text-slate-600">
                          {isClientRunnable(language)
                            ? 'Runs instantly in your browser.'
                            : 'Runs on the server (local runtime or Piston API).'}
                        </span>
                      </p>
                    )}
                  </motion.div>
                ) : loading ? (
                  <LoadingSpinner key="loading" text="AI is thinking..." />
                ) : response ? (
                  <motion.pre
                    key="response"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed"
                  >
                    {displayedResponse}
                    <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5" />
                  </motion.pre>
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-500 text-sm text-center py-16"
                  >
                    AI responses will appear here. Try generating, fixing, or explaining code.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlaygroundPage;
