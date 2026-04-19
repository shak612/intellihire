import axios from 'axios';
import { Candidate, Job } from '../types';

const ragApi = axios.create({ baseURL: 'http://localhost:3003' });
const candidateApi = axios.create({ baseURL: 'http://localhost:3002' });

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