import { motion } from 'framer-motion';

const GradientBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      className="blob w-96 h-96 bg-indigo-600 top-[-10%] left-[-5%]"
      animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="blob w-80 h-80 bg-purple-600 top-[40%] right-[-10%]"
      animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="blob w-72 h-72 bg-cyan-500 bottom-[-5%] left-[30%]"
      animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

export default GradientBlobs;
