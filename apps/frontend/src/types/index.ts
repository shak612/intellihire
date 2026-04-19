export interface Candidate {
  candidateId: string;
  score: number;
  reasoning: string;
  relevantExperience: string | Record<string, unknown>;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  skills: string[];
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}