import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';
import { IngestionService } from './ingestion.service';

export interface AgentResult {
  candidateId: string;
  score: number;
  reasoning: string;
  relevantExperience: string;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly ollama: Ollama;
  private readonly MAX_RETRIES = 2;

  constructor(private readonly ingestionService: IngestionService) {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
  }

  async findBestCandidates(jobDescription: string): Promise<AgentResult[]> {
    let attempt = 0;
    let results: AgentResult[] = [];
    let query = jobDescription;

    // Agentic loop — reformulates if results are weak
    while (attempt <= this.MAX_RETRIES) {
      this.logger.log(`Agent search attempt ${attempt + 1}`);

      const similarChunks = await this.ingestionService.searchSimilarResumes(
        query,
        10,
      );

      if (similarChunks.length === 0) {
        this.logger.warn('No candidates found in vector store');
        break;
      }

      // Group chunks by candidate
      const candidateMap = new Map<string, string[]>();
      for (const chunk of similarChunks) {
        if (!candidateMap.has(chunk.candidateId)) {
          candidateMap.set(chunk.candidateId, []);
        }
        candidateMap.get(chunk.candidateId)!.push(chunk.chunkText);
      }

      results = await this.scoreCandidates(jobDescription, candidateMap);

      const strongResults = results.filter((r) => r.score >= 60);
      if (strongResults.length >= 1) {
        this.logger.log(`Found ${strongResults.length} strong candidates`);
        return results.sort((a, b) => b.score - a.score);
      }

      // Agentic behaviour: reformulate and retry
      this.logger.log('Weak results — reformulating query...');
      query = await this.reformulateQuery(jobDescription);
      attempt++;
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private async scoreCandidates(
    jobDescription: string,
    candidateMap: Map<string, string[]>,
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    for (const [candidateId, chunks] of candidateMap) {
      const resumeContext = chunks.join('\n\n');

      const prompt = `You are an expert recruiter. Score this candidate 0-100 for the job below.
Return ONLY valid JSON, no extra text:
{
  "score": <number 0-100>,
  "reasoning": "<one sentence>",
  "relevantExperience": "<key matching skills>"
}

Job Description:
${jobDescription}

Candidate Resume:
${resumeContext}`;

      try {
        const response = await this.ollama.generate({
          model: 'llama3.2',
          prompt,
          stream: false,
          options: { temperature: 0.1 },
        });

        // Extract JSON from response
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        const parsed = JSON.parse(jsonMatch[0]);
        results.push({
          candidateId,
          score: parsed.score || 0,
          reasoning: parsed.reasoning || '',
          relevantExperience: parsed.relevantExperience || '',
        });
      } catch (err) {
        this.logger.error(`Failed to score candidate ${candidateId}: ${err}`);
        results.push({
          candidateId,
          score: 50,
          reasoning: 'Could not parse LLM response',
          relevantExperience: 'Unknown',
        });
      }
    }

    return results;
  }

  private async reformulateQuery(originalQuery: string): Promise<string> {
    const response = await this.ollama.generate({
      model: 'llama3.2',
      prompt: `Rewrite this job description into simpler search keywords to find matching candidates. Return only the rewritten text, nothing else:\n\n${originalQuery}`,
      stream: false,
    });

    return response.response.trim() || originalQuery;
  }

  async answerCandidateQuestion(
    question: string,
    jobId: string,
    candidateResume: string,
  ): Promise<string> {
    const jdChunks = await this.ingestionService.searchSimilarResumes(
      question,
      3,
    );
    const jdContext = jdChunks.map((c) => c.chunkText).join('\n\n');

    const response = await this.ollama.generate({
      model: 'llama3.2',
      prompt: `You are a helpful assistant helping a candidate understand if they are a good fit for a job.
Be honest, specific and encouraging. Base your answer only on the provided context.

Job Context:
${jdContext}

Candidate Resume:
${candidateResume}

Question: ${question}

Answer:`,
      stream: false,
      options: { temperature: 0.5 },
    });

    return response.response.trim();
  }
}