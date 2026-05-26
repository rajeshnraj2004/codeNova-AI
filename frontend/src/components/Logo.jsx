import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';

const Logo = ({ className = '' }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`}>
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
      <HiSparkles className="w-5 h-5 text-white" />
    </div>
    <span className="font-bold text-lg">
      Code<span className="gradient-text">Nova</span> AI
    </span>
  </Link>
);

export default Logo;
