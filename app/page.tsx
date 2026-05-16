'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Activity, 
  Database, 
  Clock,
  AlertTriangle,
  History,
  LayoutDashboard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: string;
  date?: string;
  detectedAt: string;
}

interface Stats {
  total: number;
  lastChecked: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, lastChecked: 'Never' });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.latest) setItems(data.latest);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch('/api/check');
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        setError(data.error || 'Check failed');
      }
    } catch (err) {
      setError('Connection error while checking');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-20 md:w-64 border-r border-white/10 bg-[#0a0a0a] z-50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">Arc Alert</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: History, label: 'History', active: false },
            { icon: ShieldCheck, label: 'Logs', active: false },
          ].map((item, i) => (
            <button 
              key={i}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                item.active ? "bg-white/5 text-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Overview</h1>
            <p className="text-gray-400 text-sm">Monitoring Arc House for new content</p>
          </div>
          
          <button 
            onClick={handleManualCheck}
            disabled={checking}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4", checking && "animate-spin")} />
            {checking ? 'Checking...' : 'Check Now'}
          </button>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Detected" 
              value={stats.total.toString()} 
              icon={Activity} 
              color="text-blue-400" 
              bg="bg-blue-400/10"
            />
            <StatCard 
              label="Last Checked" 
              value={stats.lastChecked === 'Never' ? 'Never' : new Date(stats.lastChecked).toLocaleTimeString()} 
              icon={Clock} 
              color="text-purple-400" 
              bg="bg-purple-400/10"
            />
            <StatCard 
              label="Status" 
              value="Online" 
              icon={CheckCircle2} 
              color="text-emerald-400" 
              bg="bg-emerald-400/10"
            />
            <StatCard 
              label="Telegram" 
              value="Connected" 
              icon={Bell} 
              color="text-orange-400" 
              bg="bg-orange-400/10"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
            >
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          {/* Latest Content */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Latest Detections
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-[#111] hover:bg-[#161616] border border-white/5 rounded-2xl p-5 flex items-center justify-between transition-all hover:border-blue-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs uppercase",
                          getTypeStyles(item.type)
                        )}>
                          {item.type.substring(0, 3)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.detectedAt).toLocaleString()}
                            </span>
                            {item.date && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                                Published: {item.date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                    <Database className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No content detected yet. Click "Check Now" to start.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", bg)}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getTypeStyles(type: string) {
  switch (type.toLowerCase()) {
    case 'blog': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'video': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'event': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'resource': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
}
