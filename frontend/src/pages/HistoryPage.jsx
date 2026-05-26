import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI } from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    dashboardAPI
      .getHistory()
      .then((res) => setHistory(res.data.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Loading history..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-2">Chat <span className="gradient-text">History</span></h1>
      <p className="text-slate-400 text-sm mb-8">Your recent AI coding sessions</p>

      {history.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <p className="text-slate-400">No history yet. Use the playground to start!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              >
                <span className={`text-xs px-3 py-1 rounded-lg capitalize shrink-0 ${
                  item.type === 'generate' ? 'bg-indigo-500/20 text-indigo-300' :
                  item.type === 'fix' ? 'bg-emerald-500/20 text-emerald-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {item.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.prompt || 'Code session'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.language} · {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </button>
              {expanded === item._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-5 border-t border-white/5"
                >
                  {item.code && (
                    <pre className="mt-4 p-4 rounded-xl bg-surface text-xs text-slate-400 overflow-x-auto">
                      {item.code}
                    </pre>
                  )}
                  <pre className="mt-4 p-4 rounded-xl bg-surface text-xs text-slate-300 whitespace-pre-wrap max-h-64 overflow-auto">
                    {item.response}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default HistoryPage;
