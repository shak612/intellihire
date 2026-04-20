import { useEffect, useState } from 'react';
import { uploadResume, askJobQuestion, fetchJobs } from '../services/api';
import { ChatMessage, Job } from '../types';

export default function CandidatePortal() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'resume' | 'chat'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [resume, setResume] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) setSelectedJob(data[0]);
      })
      .finally(() => setLoadingJobs(false));
  }, []);

  const handleUpload = async () => {
    if (!resume.trim() || !candidateId.trim()) return;
    setUploading(true);
    try {
      await uploadResume(candidateId, resume);
      setUploadSuccess(true);
    } catch {
      alert('Upload failed. Make sure candidate-service is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || chatLoading || !selectedJob) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);
    try {
      const answer = await askJobQuestion(question, selectedJob.id, resume);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to get answer. Make sure rag-service is running.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Candidate Portal</h1>
      <p className="text-sm text-gray-500 mb-6">Browse jobs, upload your resume, and chat with AI about your fit.</p>

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
        {(['jobs', 'resume', 'chat'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-4 py-2 rounded-t-lg capitalize transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab === 'jobs' ? 'Browse jobs' : tab === 'resume' ? 'My resume' : 'AI chat'}
          </button>
        ))}
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {loadingJobs && (
            <p className="text-sm text-gray-400 text-center py-8">Loading jobs...</p>
          )}
          {!loadingJobs && jobs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No jobs posted yet. Ask a recruiter to post one!
            </p>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`bg-white border rounded-xl p-5 cursor-pointer transition-all ${
                selectedJob?.id === job.id
                  ? 'border-indigo-400 ring-1 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  {job.location}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {job.skills.map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{job.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedJob(job);
                  setActiveTab('chat');
                }}
                className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Ask AI about fit →
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Your candidate ID
            </label>
            <input
              type="text"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="e.g. candidate-001"
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Resume text
            </label>
            <textarea
              rows={8}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading || !resume.trim() || !candidateId.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {uploading ? 'Uploading & embedding...' : 'Upload resume'}
          </button>
          {uploadSuccess && (
            <p className="text-green-600 text-sm mt-2 text-center">
              Resume uploaded and embedded successfully!
            </p>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          {selectedJob && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs font-medium text-indigo-700">Chatting about:</p>
              <p className="text-sm font-semibold text-indigo-900">{selectedJob.title}</p>
            </div>
          )}
          <div className="space-y-3 mb-4 min-h-32">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Ask anything about this job or your fit for it.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs text-xs px-3 py-2 rounded-xl leading-relaxed ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-xl">
                  AI is thinking... (~30s)
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Am I a good fit for this role?"
              className="flex-1 text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSend}
              disabled={chatLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm px-4 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}