import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25',
  secondary:
    'glass text-slate-200 hover:bg-white/10 border border-white/10',
  outline:
    'border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
};

const Button = ({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  ...props
}) => (
  <motion.button
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    className={`relative z-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-btn ${variants[variant]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    )}
    {children}
  </motion.button>
);

export default Button;
