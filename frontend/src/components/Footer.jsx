import { Link } from 'react-router-dom';
import Logo from './Logo';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 text-slate-400 text-sm max-w-md">
            Your AI-powered coding assistant. Generate, debug, and explain code instantly with
            cutting-edge AI technology.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/playground" className="hover:text-white transition-colors">Playground</Link></li>
            <li><Link to="/#features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Account</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} CodeNova AI. All rights reserved.</p>
        <div className="flex gap-4 text-slate-400">
          <a href="#" className="hover:text-white transition-colors" aria-label="GitHub"><FaGithub size={18} /></a>
          <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><FaTwitter size={18} /></a>
          <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn"><FaLinkedin size={18} /></a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
