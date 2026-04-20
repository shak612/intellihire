import axios from 'axios';
import { Candidate, Job } from '../types';

const ragApi = axios.create({ baseURL: 'http://localhost:3003' });
const candidateApi = axios.create({ baseURL: 'http://localhost:3002' });
const jobApi = axios.create({ baseURL: 'http://localhost:3001' });

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