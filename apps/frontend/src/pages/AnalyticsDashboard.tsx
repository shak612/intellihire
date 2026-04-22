import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { fetchJobs } from '../services/api';
import { Job } from '../types';

const SCORE_RANGES = [
  { range: '0-20', min: 0, max: 20, color: '#ef4444' },
  { range: '21-40', min: 21, max: 40, color: '#f97316' },
  { range: '41-60', min: 41, max: 60, color: '#eab308' },
  { range: '61-80', min: 61, max: 80, color: '#22c55e' },
  { range: '81-100', min: 81, max: 100, color: '#4f46e5' },
];

const MOCK_SCORES = [72, 85, 90, 65, 78, 88, 55, 92, 70, 83];
const MOCK_APPLICATIONS = [
  { date: 'Apr 14', count: 2 },
  { date: 'Apr 15', count: 5 },
  { date: 'Apr 16', count: 3 },
  { date: 'Apr 17', count: 8 },
  { date: 'Apr 18', count: 6 },
  { date: 'Apr 19', count: 10 },
  { date: 'Apr 20', count: 7 },
];

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  // Score distribution data
  const scoreDistribution = SCORE_RANGES.map(({ range, min, max, color }) => ({
    range,
    count: MOCK_SCORES.filter((s) => s >= min && s <= max).length,
    color,
  }));

  // Top skills from all jobs
  const skillCounts: Record<string, number> = {};
  jobs.forEach((job) =>
    job.skills.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }),
  );
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => ({ skill, count }));

  const avgScore =
    MOCK_SCORES.length > 0
      ? Math.round(
          MOCK_SCORES.reduce((a, b) => a + b, 0) / MOCK_SCORES.length,
        )
      : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">
        Platform overview — jobs, candidates, and AI match scores.
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <MetricCard label="Open jobs" value={jobs.length} sub="active listings" />
        <MetricCard
          label="Candidates"
          value={MOCK_SCORES.length}
          sub="resumes uploaded"
        />
        <MetricCard
          label="Avg match score"
          value={`${avgScore}/100`}
          sub="across all candidates"
        />
        <MetricCard
          label="Top score"
          value={`${Math.max(...MOCK_SCORES)}/100`}
          sub="best candidate match"
        />
      </div>

      {/* Applications over time */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-4">
          Applications over time
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MOCK_APPLICATIONS}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                border: '0.5px solid #e5e7eb',
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3, fill: '#4f46e5' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Score distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Match score distribution
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: '0.5px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top skills */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Top skills in demand
          </p>
          {topSkills.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No jobs posted yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSkills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    border: '0.5px solid #e5e7eb',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Score pie chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Score breakdown
          </p>
          <div className="flex items-center justify-center gap-8">
            <PieChart width={180} height={180}>
              <Pie
                data={scoreDistribution.filter((d) => d.count > 0)}
                cx={90}
                cy={90}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
              >
                {scoreDistribution
                  .filter((d) => d.count > 0)
                  .map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: '0.5px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
            </PieChart>
            <div className="space-y-2">
              {scoreDistribution
                .filter((d) => d.count > 0)
                .map((d) => (
                  <div key={d.range} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {d.range} — {d.count} candidate
                      {d.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}