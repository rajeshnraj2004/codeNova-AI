import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiCodeBracket,
  HiBugAnt,
  HiLightBulb,
  HiGlobeAlt,
  HiSparkles,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';

const features = [
  {
    icon: HiCodeBracket,
    title: 'AI Code Generation',
    description: 'Generate production-ready code from natural language prompts in seconds.',
  },
  {
    icon: HiBugAnt,
    title: 'Bug Detection & Fixing',
    description: 'Automatically detect and fix bugs with intelligent AI analysis.',
  },
  {
    icon: HiLightBulb,
    title: 'Code Explanation',
    description: 'Get line-by-line explanations to understand any codebase instantly.',
  },
  {
    icon: HiGlobeAlt,
    title: 'Multi-Language Support',
    description: 'JavaScript, Python, React, Node.js, Java, C++, and many more.',
  },
  {
    icon: HiSparkles,
    title: 'Smart AI Suggestions',
    description: 'Context-aware suggestions that improve your coding workflow.',
  },
  {
    icon: HiChatBubbleLeftRight,
    title: 'AI Chat Playground',
    description: 'Interactive coding workspace with Monaco editor and AI assistance.',
  },
];

const codePreview = `// CodeNova AI — Generated Code
async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}`;

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full glass text-xs font-medium text-indigo-300 mb-6"
            >
              Powered by Advanced AI
            </motion.span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your AI-Powered{' '}
              <span className="gradient-text">Coding Assistant</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-xl">
              Generate, Debug, and Explain Code Instantly with AI. Ship faster with
              intelligent code generation built for modern developers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/register')}>Get Started</Button>
              <Button variant="secondary" onClick={() => navigate('/playground')}>
                Try Playground
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-2xl" />
            <div className="relative glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-surface">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2">playground.js</span>
              </div>
              <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
                <code>{codePreview}</code>
              </pre>
              <motion.div
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI Generating...
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Code Smarter</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Powerful AI features designed to supercharge your development workflow.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-24 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 border border-indigo-500/20"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Code with AI?</h2>
          <p className="text-slate-400 mb-8">
            Join thousands of developers using CodeNova AI to build faster.
          </p>
          <Button onClick={() => navigate('/register')}>Start Building for Free</Button>
        </motion.div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
