import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiTrash, HiPlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI } from '../services/api';

const SnippetsPage = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [saving, setSaving] = useState(false);

  const fetchSnippets = () => {
    dashboardAPI
      .getSnippets()
      .then((res) => setSnippets(res.data.data))
      .catch(() => setSnippets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !code) return;
    setSaving(true);
    try {
      await dashboardAPI.createSnippet({ title, code, language });
      toast.success('Snippet saved!');
      setTitle('');
      setCode('');
      setShowForm(false);
      fetchSnippets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dashboardAPI.deleteSnippet(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      toast.success('Snippet deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Loading snippets..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Saved <span className="gradient-text">Snippets</span></h1>
          <p className="text-slate-400 text-sm">Store and manage your favorite code</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <HiPlus className="w-4 h-4" /> New Snippet
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSave}
          className="glass rounded-2xl p-6 border border-white/10 mb-6 space-y-4"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Snippet title"
            required
            className="input-field"
          />
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            required
            rows={6}
            className="input-field font-mono resize-none"
          />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Save Snippet</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.form>
      )}

      {snippets.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <p className="text-slate-400">No snippets saved yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {snippets.map((snippet, i) => (
            <motion.div
              key={snippet._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <h3 className="font-medium">{snippet.title}</h3>
                  <p className="text-xs text-slate-500">
                    {snippet.language} · {new Date(snippet.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(snippet._id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
              <pre className="p-5 text-xs font-mono text-slate-400 overflow-x-auto max-h-48">
                {snippet.code}
              </pre>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SnippetsPage;
