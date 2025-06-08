import { jest, describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { Role, WorkflowState, JiraData, ConfluenceData } from '../../types/index.js';
import PromptGenerationService from '../promptGenerationService.js';

// Mock fetch
const mockFetch = jest.fn();


// Helper for mock responses
const mockResponse = (content: string) => ({
    choices: [{
        message: {
            content,
            role: 'assistant'
        }
    }]
});

// Type assertion for mock responses
type MockResponse = {
    choices: Array<{
        message: {
            content: string;
            role: string;
        };
    }>;
};

describe('PromptGenerationService', () => {
    let service: PromptGenerationService;
    let originalEnv: NodeJS.ProcessEnv;

    // Sample test data
    const mockJiraData: JiraData = {
        summary: 'Test JIRA Issue',
        description: 'This is a test JIRA issue',
        acceptanceCriteria: ['AC1', 'AC2']
    };

    const mockConfluenceData: ConfluenceData = {
        title: 'Test Confluence Page',
        body: 'This is a test Confluence page'
    };

    const mockWorkflowState: WorkflowState = {
        role: Role.Tester,
        jiraId: 'DEMO1',
        confId: 'DOC1',
        jiraData: mockJiraData,
        confData: mockConfluenceData
    };

    beforeAll(() => {
        // Save original environment variables
        originalEnv = { ...process.env };
        process.env.OPENAI_API_KEY = 'test-api-key';
        // @ts-ignore
        global.fetch = mockFetch;
    });

    afterAll(() => {
        // Restore original environment variables
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        service = new PromptGenerationService();
    });

    it('should generate tester prompt successfully', async () => {
        const mockResponseData = mockResponse('Test prompt response');
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponseData
        } as any);

        const result = await service.generatePrompt(mockWorkflowState);

        expect(result).toBe('Test prompt response');
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should generate BA prompt successfully', async () => {
        // Mock the OpenAI API response
        const mockResponseData = mockResponse('BA prompt response');
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponseData
        } as any);

        const baWorkflowState: WorkflowState = {
            ...mockWorkflowState,
            role: Role.BusinessAnalyst
        };

        const result = await service.generatePrompt(baWorkflowState);

        expect(result).toBe('BA prompt response');
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when data is missing', async () => {
        const invalidState = {
            role: Role.Tester,
            // Missing jiraData and confData
        };

        await expect(service.generatePrompt(invalidState as any))
            .rejects
            .toThrow('Missing required data: JIRA or Confluence data is missing');
    });

    it('should handle OpenAI API errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'API Error'
        } as any);

        await expect(service.generatePrompt(mockWorkflowState))
            .rejects
            .toThrow('Failed to generate prompt using OpenAI API: OpenAI request failed: 500 API Error');
    });

    it('should handle unknown errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Unknown error'));

        await expect(service.generatePrompt(mockWorkflowState))
            .rejects
            .toThrow('Failed to generate prompt using OpenAI API: Unknown error');
    });
});
