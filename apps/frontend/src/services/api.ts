import axios from 'axios';
import { AuthResponse, Candidate, Job } from '../types';

const authApi = axios.create({ baseURL: 'http://localhost:3000' });
const jobApi = axios.create({ baseURL: 'http://localhost:3001' });
const candidateApi = axios.create({ baseURL: 'http://localhost:3002' });
const ragApi = axios.create({ baseURL: 'http://localhost:3003' });


export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await authApi.post('/auth/login', { email, password });
  return data;
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role: 'recruiter' | 'candidate',
): Promise<AuthResponse> => {
  const { data } = await authApi.post('/auth/register', { email, password, name, role });
  return data;
};

export const searchCandidates = async (jobDescription: string): Promise<Candidate[]> => {
  const { data } = await ragApi.post('/search', { jobDescription });
  return data;
};

export const uploadResume = async (candidateId: string, resumeText: string) => {
  const { data } = await candidateApi.post('/resume/upload', { candidateId, resumeText });
  return data;
};

export const askJobQuestion = async (
  question: string,
  jobId: string,
  resume: string,
): Promise<string> => {
  const { data } = await ragApi.post('/ask', { question, jobId, resume });
  return data;
};

export const fetchJobs = async (): Promise<Job[]> => {
  const { data } = await jobApi.get('/jobs');
  return data;
};

export const createJob = async (job: Omit<Job, 'id' | 'createdAt' | 'status'>): Promise<Job> => {
  const { data } = await jobApi.post('/jobs', job);
  return data;
};

export const deleteJob = async (id: string, recruiterId: string): Promise<void> => {
  await jobApi.delete(`/jobs/${id}?recruiterId=${recruiterId}`);
};

export const fetchAnalytics = async () => {
  const [jobsRes, resumesRes] = await Promise.all([
    jobApi.get('/jobs'),
    ragApi.get('/analytics'),
  ]);
  return {
    jobs: jobsRes.data,
    analytics: resumesRes.data,
  };
};