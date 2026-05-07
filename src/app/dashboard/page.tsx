'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Shield, BarChart3, Clock, KeyRound, Activity, TrendingUp,
  Lock, CheckCircle, XCircle, Loader2, Moon, Sun, LogOut,
  Users, MessageSquare, Timer, Zap, Cpu, Database, ArrowUp, ArrowDown
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const COLOR = '#b8d490';
const BACKEND_URL = 'http://localhost:3001';

interface Metric {
  _id: string;
  metricId: string;
  messageId: string;
  keySize: number;
  encryptionTime: number;
  decryptionTime: number;
  transmissionTime: number;
  totalTime: number;
  timestamp: string;
}

interface Message {
  messageId: string;
  fromUsername: string;
  toUsername: string;
  encryptedMessage: string;
  keySize: number;
  messageNumber: number;
  encryptionTime: number;
  timestamp: string;
}

interface User {
  userId: string;
  username: string;
  role: string;
  publicKey?: string;
  lastKeySize: number;
  loginCount: number;
  createdAt: string;
  lastLogin: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      router.push('/chat');
      return;
    }
    setCurrentUser(userData);
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadData = async () => {
    try {
      const [metricsRes, messagesRes, usersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/metrics`),
        fetch(`${BACKEND_URL}/api/messages/stats`),
        fetch(`${BACKEND_URL}/api/auth/users`)
      ]);
      
      const metricsData = await metricsRes.json();
      const messagesData = await messagesRes.json();
      const usersData = await usersRes.json();
      
      setMetrics(Array.isArray(metricsData) ? metricsData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const totalMessages = metrics.length;
  const avgEncryptionTime = metrics.reduce((sum, m) => sum + (m.encryptionTime || 0), 0) / (totalMessages || 1);
  const avgDecryptionTime = metrics.reduce((sum, m) => sum + (m.decryptionTime || 0), 0) / (totalMessages || 1);
  const avgTransmissionTime = metrics.reduce((sum, m) => sum + (m.transmissionTime || 0), 0) / (totalMessages || 1);
  const avgTotalTime = metrics.reduce((sum, m) => sum + (m.totalTime || 0), 0) / (totalMessages || 1);
  const avgKeySize = metrics.reduce((sum, m) => sum + m.keySize, 0) / (totalMessages || 1);

  const keySizeGroups: { [key: number]: { count: number; totalEncryptionTime: number; totalDecryptionTime: number } } = {};
  metrics.forEach(m => {
    if (!keySizeGroups[m.keySize]) {
      keySizeGroups[m.keySize] = { count: 0, totalEncryptionTime: 0, totalDecryptionTime: 0 };
    }
    keySizeGroups[m.keySize].count++;
    keySizeGroups[m.keySize].totalEncryptionTime += m.encryptionTime || 0;
    keySizeGroups[m.keySize].totalDecryptionTime += m.decryptionTime || 0;
  });

  const keySizes = Object.keys(keySizeGroups).sort((a, b) => Number(a) - Number(b));
  const encryptionTimes = keySizes.map(ks => (keySizeGroups[Number(ks)].totalEncryptionTime / keySizeGroups[Number(ks)].count).toFixed(1));
  const decryptionTimes = keySizes.map(ks => (keySizeGroups[Number(ks)].totalDecryptionTime / keySizeGroups[Number(ks)].count).toFixed(1));
  
  const recentMetrics = [...metrics].reverse().slice(-10);
  const messageNumbers = recentMetrics.map((_, i) => `Msg ${i + 1}`);
  const encryptionTimeline = recentMetrics.map(m => m.encryptionTime?.toFixed(1) || 0);
  const decryptionTimeline = recentMetrics.map(m => m.decryptionTime?.toFixed(1) || 0);
  
  const keySizeDistribution = keySizes.map(ks => keySizeGroups[Number(ks)].count);
  
  const usersWithKeys = users.filter(u => u.publicKey).length;
  const usersWithoutKeys = users.filter(u => !u.publicKey && u.role !== 'admin').length;

const barChartData = {
    labels: keySizes.map(ks => `${ks}-bit`),
    datasets: [
      {
        label: 'Encryption Time (ms)',
        data: encryptionTimes,
        backgroundColor: '#D0CFFB',  // Soft purple
        borderRadius: 8,
      },
      {
        label: 'Decryption Time (ms)',
        data: decryptionTimes,
        backgroundColor: '#C6DEF1',  // Soft blue
        borderRadius: 8,
      },
    ],
  };

  const lineChartData = {
    labels: messageNumbers,
    datasets: [
      {
        label: 'Encryption Time',
        data: encryptionTimeline,
        borderColor: '#D0CFFB',
        backgroundColor: 'rgba(208, 207, 251, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Decryption Time',
        data: decryptionTimeline,
        borderColor: '#C6DEF1',
        backgroundColor: 'rgba(198, 222, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: keySizes.map(ks => `${ks}-bit`),
    datasets: [
      {
        data: keySizeDistribution,
        backgroundColor: ['#ECFAD0', '#D0CFFB', '#C6DEF1', '#FAEDCB', '#b8d490', '#a8c4e0'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#f9fafb' : '#111827',
        bodyColor: isDarkMode ? '#d1d5db' : '#4b5563',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          drawBorder: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          callback: (value: any) => `${value} ms`,
        },
        title: {
          display: true,
          text: 'Time (milliseconds)',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: { size: 10 },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLOR }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 z-40 w-full transition-all duration-300 border-b ${isDarkMode ? 'bg-[#0d1117]/90 backdrop-blur-xl border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border-2 flex items-center justify-center" style={{ borderColor: COLOR }}>
              <BarChart3 className="w-4 h-4" style={{ color: COLOR }} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">CRYPT<span style={{ color: COLOR }}>CHAT</span></span>
              <p className="text-[9px] -mt-0.5 tracking-wide">ADMIN DASHBOARD</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>{currentUser?.username}</span>
              <button onClick={handleLogout} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Encryption Performance Dashboard</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Real-time RSA encryption/decryption metrics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${COLOR}15` }}>
                  <MessageSquare className="w-5 h-5" style={{ color: COLOR }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: COLOR }}>{totalMessages}</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Total Messages</p>
            </div>

            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${COLOR}15` }}>
                  <Lock className="w-5 h-5" style={{ color: COLOR }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: COLOR }}>{avgEncryptionTime.toFixed(1)}ms</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Avg Encryption</p>
            </div>

            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${COLOR}15` }}>
                  <Timer className="w-5 h-5" style={{ color: COLOR }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: COLOR }}>{avgDecryptionTime.toFixed(1)}ms</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Avg Decryption</p>
            </div>

            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${COLOR}15` }}>
                  <KeyRound className="w-5 h-5" style={{ color: COLOR }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: COLOR }}>{avgKeySize.toFixed(0)} bits</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Avg Key Size</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart - Key Size vs Time */}
            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Key Size Performance</h3>
              <div className="h-80">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>

            {/* Line Chart - Timeline */}
            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Message Timeline</h3>
              <div className="h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pie Chart - Key Size Distribution */}
            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Key Size Distribution</h3>
              <div className="h-64 flex justify-center">
                <Doughnut data={pieChartData} options={chartOptions} />
              </div>
            </div>

    {/* Timing Breakdown */}
<div className={`rounded-xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
  <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Average Timing Breakdown</h3>
  <div className="space-y-6 pt-4">
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={isDarkMode ? 'text-white/60' : 'text-gray-600'}>Encryption</span>
        <span className="font-mono" style={{ color: '#D0CFFB' }}>{avgEncryptionTime.toFixed(1)} ms</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
        <div className="h-full rounded-full" style={{ width: `${(avgEncryptionTime / avgTotalTime) * 100}%`, background: '#D0CFFB' }} />
      </div>
    </div>
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={isDarkMode ? 'text-white/60' : 'text-gray-600'}>Transmission</span>
        <span className="font-mono" style={{ color: '#FAEDCB' }}>{avgTransmissionTime.toFixed(1)} ms</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
        <div className="h-full rounded-full" style={{ width: `${(avgTransmissionTime / avgTotalTime) * 100}%`, background: '#FAEDCB' }} />
      </div>
    </div>
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={isDarkMode ? 'text-white/60' : 'text-gray-600'}>Decryption</span>
        <span className="font-mono" style={{ color: '#C6DEF1' }}>{avgDecryptionTime.toFixed(1)} ms</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
        <div className="h-full rounded-full" style={{ width: `${(avgDecryptionTime / avgTotalTime) * 100}%`, background: '#C6DEF1' }} />
      </div>
    </div>
    <div className="pt-2 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Total Time</span>
        <span className="font-mono font-bold" style={{ color: '#ECFAD0' }}>{avgTotalTime.toFixed(1)} ms</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
        <div className="h-full rounded-full" style={{ width: `100%`, background: '#ECFAD0' }} />
      </div>
    </div>
  </div>
</div>
          </div>

          {/* Users Table */}
          <div className={`rounded-xl border mb-8 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
            <div className={`p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Users & RSA Key Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'border-b border-white/10' : 'border-b border-gray-200'}>
                  <tr className="text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Key Size</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Logins</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{user.username[0]}</span>
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{user.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-200'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-sm font-mono ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                          {user.lastKeySize || 512}-bit
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>{user.loginCount || 0}</span>
                      </td>
                      <td className="px-5 py-3">
                        {user.publicKey ? (
                          <div className="flex items-center gap-1 text-green-200 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            RSA Ready
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-500 text-xs">
                            <XCircle className="w-3 h-3" />
                            admin
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Messages Table */}
          <div className={`rounded-xl border ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
            <div className={`p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Messages Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'border-b border-white/10' : 'border-b border-gray-200'}>
                  <tr className="text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">From/To</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Key Size</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Encryption</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Decryption</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Total</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 10).map((metric) => {
                    const message = messages.find(m => m.messageId === metric.messageId);
                    return (
                      <tr key={metric.metricId} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <td className="px-5 py-3">
                          <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            {message?.fromUsername} → {message?.toUsername}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-mono ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            {metric.keySize}-bit
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-green-200">{metric.encryptionTime?.toFixed(1) || 0} ms</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-blue-200">{metric.decryptionTime?.toFixed(1) || 0} ms</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium" style={{ color: COLOR }}>{metric.totalTime?.toFixed(1) || 0} ms</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}