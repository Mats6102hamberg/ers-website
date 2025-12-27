'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { translations, Language } from '@/lib/translations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendDataPoint {
  date: string;
  high: number;
  critical: number;
  total: number;
}

interface SecurityStats {
  timeRange: string;
  totalScans: number;
  blockedCount: number;
  avgRiskScore: number;
  profileBreakdown: Array<{
    profile: string;
    count: number;
    totalRisk: number;
  }>;
  topFindings: Array<{
    id: string;
    timestamp: string;
    profileType: string;
    riskScore: number;
    findingsCount: number;
    findings: any;
  }>;
  scanRate: number;
  blockRate: number;
}

interface Alert {
  id: string;
  timestamp: string;
  profileType: string;
  contentType: string;
  riskScore: number;
  findingsCount: number;
  blocked: boolean;
  recipientEmail?: string;
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [language, setLanguage] = useState<Language>('sv');

  const t = (key: string) => translations[language][key as keyof typeof translations['sv']] || key;

  // Safe accessors with defensive defaults to prevent rendering crashes
  const safeStats = stats || {
    timeRange: 'day',
    totalScans: 0,
    blockedCount: 0,
    avgRiskScore: 0,
    scanRate: 0,
    blockRate: 0,
    profileBreakdown: [],
    topFindings: []
  };

  const safeTrendData = trendData || [];
  const safeAlerts = alerts || [];

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, trendRes] = await Promise.all([
        fetch(`/api/security/stats?timeRange=${timeRange}`),
        fetch('/api/security/alerts?limit=10'),
        fetch('/api/security/trend?days=7')
      ]);

      if (statsRes.ok && alertsRes.ok && trendRes.ok) {
        const statsData = await statsRes.json();
        const alertsData = await alertsRes.json();
        const trendDataRes = await trendRes.json();
        
        setStats(statsData.data);
        setAlerts(alertsData.data);
        setTrendData(trendDataRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  const getRiskColor = (score: number) => {
    if (score >= 200) return 'text-red-600 bg-red-50';
    if (score >= 100) return 'text-orange-600 bg-orange-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'MEDICAL': return 'bg-red-100 text-red-800';
      case 'SOCIAL': return 'bg-blue-100 text-blue-800';
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar säkerhetsdata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-3" style={{color: '#1a1a1a'}}>
                <span className="text-4xl">🛡️</span>
                {t('title')}
              </h1>
              <p className="text-gray-600 text-base">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setLanguage('sv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    language === 'sv'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Svenska"
                >
                  🇸🇪 Svenska
                </button>
                <button
                  onClick={() => setLanguage('no')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    language === 'no'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Norsk"
                >
                  🇳🇴 Norsk
                </button>
              </div>
              <button
                onClick={() => {
                  const url = `/api/security/export?timeRange=${timeRange}`;
                  window.open(url, '_blank');
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                title={t('exportButton')}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t('exportButton')}
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                {t('autoRefresh')}
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="hour">{t('lastHour')}</option>
                <option value="day">{t('lastDay')}</option>
                <option value="week">{t('lastWeek')}</option>
                <option value="month">{t('lastMonth')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('totalScans')}</div>
              <div className="text-3xl">📊</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{safeStats.totalScans}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <span className="text-blue-500">↗</span>
              {safeStats.scanRate.toFixed(1)} {t('perHour')}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-red-700 uppercase tracking-wide">{t('blocked')}</div>
              <div className="text-3xl">🚫</div>
            </div>
            <div className="text-4xl font-bold text-red-600 mb-1">{safeStats.blockedCount}</div>
            <div className="text-sm text-red-600 flex items-center gap-1 font-medium">
              {safeStats.blockRate.toFixed(1)}% {t('blockRate')}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('avgRisk')}</div>
              <div className="text-3xl">⚠️</div>
            </div>
            <div className={`text-4xl font-bold mb-1 ${getRiskColor(safeStats.avgRiskScore).split(' ')[0]}`}>
              {safeStats.avgRiskScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">{t('riskScore')}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-green-700 uppercase tracking-wide">{t('status')}</div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-2xl font-bold text-green-600">{t('active')}</span>
            </div>
            <div className="text-sm text-green-600 font-medium">{t('systemOperational')}</div>
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            {t('riskTrend')}
          </h2>
          <div className="h-64">
            <Line
              data={{
                labels: safeTrendData.map(d => {
                  const date = new Date(d.date);
                  return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
                }),
                datasets: [
                  {
                    label: 'CRITICAL (≥200)',
                    data: safeTrendData.map(d => d.critical),
                    borderColor: 'rgb(220, 38, 38)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgb(220, 38, 38)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                  },
                  {
                    label: 'HIGH (100-199)',
                    data: safeTrendData.map(d => d.high),
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgb(37, 99, 235)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 13,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 12
                    },
                    callbacks: {
                      footer: (tooltipItems: any) => {
                        const index = tooltipItems[0].dataIndex;
                        const total = safeTrendData[index]?.total || 0;
                        return `Totalt: ${total} skanningar`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      font: {
                        size: 11
                      }
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 11
                      }
                    },
                    grid: {
                      display: false
                    }
                  }
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false
                }
              }}
            />
          </div>
          <div className="mt-6 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <div className="w-4 h-4 rounded-full bg-red-600 shadow-md"></div>
              <span className="font-medium text-red-700">{t('criticalBlocked')}</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="w-4 h-4 rounded-full bg-blue-600 shadow-md"></div>
              <span className="font-medium text-blue-700">{t('highSanitized')}</span>
            </div>
          </div>
        </div>

        {/* Profile Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              {t('profiles')}
            </h2>
            <div className="space-y-3">
              {safeStats.profileBreakdown.map((profile) => (
                <div key={profile.profile} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProfileColor(profile.profile)}`}>
                      {profile.profile}
                    </span>
                    <span className="text-sm text-gray-600">{profile.count} {t('scans')}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {t('risk')}: {profile.totalRisk}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              {t('recentAlerts')}
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {safeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('noAlerts')}
                </p>
              ) : (
                safeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.blocked ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getProfileColor(alert.profileType)}`}>
                        {alert.profileType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString('sv-SE')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {alert.contentType} • Risk: {alert.riskScore} • {alert.findingsCount} fynd
                    </div>
                    {alert.recipientEmail && (
                      <div className="text-xs text-gray-500 mt-1">
                        Till: {alert.recipientEmail}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Findings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            {t('topFindings')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('time')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('profile')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('risk')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('findings')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('pattern')}</th>
                </tr>
              </thead>
              <tbody>
                {safeStats.topFindings.slice(0, 5).map((finding) => (
                  <tr key={finding.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(finding.timestamp).toLocaleString('sv-SE')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getProfileColor(finding.profileType)}`}>
                        {finding.profileType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(finding.riskScore)}`}>
                        {finding.riskScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {finding.findingsCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {finding.findings.slice(0, 2).map((f: any) => f.pattern).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analysis Section */}
        {process.env.NEXT_PUBLIC_AI_ENABLED === 'true' && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-md p-8 mb-8 border border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              AI-Säkerhetsanalys (OpenAI gpt-4o-mini)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 uppercase">SQL Injection</div>
                    <div className="text-xs text-gray-500">Pattern Detection</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  AI-driven detection av SQL injection och code execution försök
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🇳🇴</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 uppercase">PII Leakage</div>
                    <div className="text-xs text-gray-500">Deep Analysis</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Fångar norsk PII som kan ha missats av regex (fødselsnummer, helseopplysninger)
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 uppercase">Malicious Content</div>
                    <div className="text-xs text-gray-500">Intent Analysis</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Detekterar social engineering och skadligt innehåll via språkmodell
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✓</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">OpenAI gpt-4o-mini (Cloud-First + Local Fallback)</div>
                  <div className="text-sm text-gray-600">
                    OpenAI API • JSON-formaterade svar • Automatisk fallback till keyword-analys
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Cloud-First
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Local Fallback
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Real-time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">7+</div>
              <div className="text-sm text-gray-300">Länder</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">10+</div>
              <div className="text-sm text-gray-300">Produkter</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">6</div>
              <div className="text-sm text-gray-300">Språk</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              🇳🇴 {t('norwegianPatterns')}
            </p>
            <p className="text-sm text-gray-600">
              AI Analysis: {process.env.NEXT_PUBLIC_AI_ENABLED === 'true' ? `✅ ${t('enabled')}` : `⚠️ ${t('disabled')}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
