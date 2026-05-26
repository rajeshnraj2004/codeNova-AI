import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiSparkles,
  HiBugAnt,
  HiLightBulb,
  HiBookmark,
  HiCodeBracket,
  HiChartBar,
} from 'react-icons/hi2';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const statCards = [
  { key: 'totalChats', label: 'Total AI Chats', icon: HiChartBar, color: 'from-indigo-500 to-purple-500' },
  { key: 'generateCount', label: 'Code Generated', icon: HiSparkles, color: 'from-cyan-500 to-blue-500' },
  { key: 'fixCount', label: 'Bugs Fixed', icon: HiBugAnt, color: 'from-emerald-500 to-teal-500' },
  { key: 'explainCount', label: 'Explanations', icon: HiLightBulb, color: 'from-amber-500 to-orange-500' },
  { key: 'snippetCount', label: 'Saved Snippets', icon: HiBookmark, color: 'from-fuchsia-500 to-pink-500' },
  { key: 'aiUsageCount', label: 'AI Requests', icon: HiCodeBracket, color: 'from-sky-500 to-cyan-500' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getHistory(),
        ]);
        setStats(statsRes.data.data);
        setHistory(historyRes.data.data.slice(0, 5));
      } catch {
        setStats({
          totalChats: 0,
          generateCount: 0,
          fixCount: 0,
          explainCount: 0,
          snippetCount: 0,
          aiUsageCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Your AI coding workspace overview</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 border border-white/10"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 opacity-80`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stats?.[card.key] ?? 0}</p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent AI Chats</h2>
              <Link to="/dashboard/history" className="text-xs text-indigo-400 hover:text-indigo-300">
                View all
              </Link>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No chat history yet.{' '}
                <Link to="/playground" className="text-indigo-400">Try the playground</Link>
              </p>
            ) : (
              <ul className="space-y-3">
                {history.map((item) => (
                  <li key={item._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className={`text-xs px-2 py-1 rounded-lg capitalize ${
                      item.type === 'generate' ? 'bg-indigo-500/20 text-indigo-300' :
                      item.type === 'fix' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.prompt || item.code?.slice(0, 50) || 'Code session'}</p>
                      <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/playground"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                <HiCodeBracket className="w-8 h-8 text-indigo-400" />
                <span className="text-sm font-medium">Open Playground</span>
              </Link>
              <Link
                to="/dashboard/snippets"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                <HiBookmark className="w-8 h-8 text-purple-400" />
                <span className="text-sm font-medium">Saved Snippets ({stats?.snippetCount ?? 0})</span>
              </Link>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <p className="text-sm text-slate-300 mb-1">AI Usage</p>
              <p className="text-3xl font-bold gradient-text">{stats?.aiUsageCount ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Total AI requests</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
