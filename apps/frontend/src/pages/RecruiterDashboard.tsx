import { useState } from 'react';
import { searchCandidates } from '../services/api';
import { Candidate } from '../types';

export default function RecruiterDashboard() {
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError('');
    try {
      const results = await searchCandidates(jobDescription);
      setCandidates(results);
    } catch {
      setError('Search failed. Make sure all services are running.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { badge: 'bg-green-100 text-green-800', bar: 'bg-green-500' };
    if (score >= 60) return { badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' };
    return { badge: 'bg-red-100 text-red-800', bar: 'bg-red-400' };
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">AI Candidate Shortlist</h1>
      <p className="text-sm text-gray-500 mb-6">
        Describe the role and the AI agent will find and score the best candidates.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Job description
        </label>
        <textarea
          rows={4}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="e.g. Looking for a senior React developer with NestJS and microservices experience..."
          className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !jobDescription.trim()}
          className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'AI agent searching... (may take ~2 min)' : 'Find candidates'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {candidates.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {candidates.map((c) => {
              const colors = getScoreColor(c.score);
              return (
                <div key={c.candidateId} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.candidateId}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {typeof c.relevantExperience === 'object'
                            ? Object.keys(c.relevantExperience).join(', ')
                            : c.relevantExperience}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                      {c.score} / 100
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full ${colors.bar}`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {typeof c.reasoning === 'object'
                        ? JSON.stringify(c.reasoning)
                        : c.reasoning}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && candidates.length === 0 && jobDescription && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No candidates found. Try uploading some resumes first.
        </div>
      )}
    </div>
  );
}