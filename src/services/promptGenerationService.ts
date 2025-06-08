import { Role, WorkflowState } from '../types/index.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config({ path: process.cwd() + '/.env' });

class PromptGenerationService {
    private apiKey: string;
    
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }

        logger.info('Initializing OpenAI client with API key');
        this.apiKey = apiKey;
    }

    private getTesterPrompt(state: WorkflowState): string {
        return `You are a QA engineer. Given the following JIRA issue and Confluence page, generate a list of test cases 
        (with title, preconditions, steps, and expected results). Include edge cases and negative tests.
        
        JIRA Summary: ${state.jiraData.summary}
        JIRA Description: ${state.jiraData.description}
        JIRA Acceptance Criteria: ${state.jiraData.acceptanceCriteria.join('\n')}
        
        Confluence Page Title: ${state.confData.title}
        Confluence Content: ${state.confData.body}
        
        Generate a comprehensive set of test cases:`;
    }

    private getBAPrompt(state: WorkflowState): string {
        return `You are a Business Analyst. Given the following JIRA issue and Confluence page, generate detailed user stories
        and acceptance criteria. Include any additional requirements or questions that need clarification.
        
        JIRA Summary: ${state.jiraData.summary}
        JIRA Description: ${state.jiraData.description}
        
        Confluence Page Title: ${state.confData.title}
        Confluence Content: ${state.confData.body}
        
        Generate detailed user stories and acceptance criteria:`;
    }

    private getPromptBasedOnRole(state: WorkflowState): string {
        switch (state.role) {
            case Role.Tester:
                return this.getTesterPrompt(state);
            case Role.BusinessAnalyst:
                return this.getBAPrompt(state);
            default:
                throw new Error(`Unsupported role: ${state.role}`);
        }
    }

    async generatePrompt(state: WorkflowState): Promise<string> {
        try {
            if (!state.jiraData || !state.confData) {
                throw new Error('Missing required data: JIRA or Confluence data is missing');
            }

            const prompt = this.getPromptBasedOnRole(state);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`OpenAI request failed: ${response.status} ${text}`);
            }

            const data = await response.json() as {
                choices: Array<{ message: { content: string } }>;
            };

            const result = data.choices[0]?.message?.content;
            if (!result) {
                throw new Error('No response from AI');
            }

            logger.info('Successfully generated prompt');
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error generating prompt:', { error: errorMessage });
            throw new Error(`Failed to generate prompt using OpenAI API: ${errorMessage}`);
        }
    }
}

export default PromptGenerationService;
