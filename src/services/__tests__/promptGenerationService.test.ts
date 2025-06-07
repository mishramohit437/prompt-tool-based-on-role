import { jest, describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { Role, WorkflowState, JiraData, ConfluenceData } from '../../types/index.js';
import PromptGenerationService from '../promptGenerationService.js';

// Mock the openai module
const mockCreate = jest.fn();

// Mock the openai module with proper typing
jest.unstable_mockModule('openai', () => ({
    default: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate
            }
        }
    }))
}));

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

// Type assertion for mock function
const asMockResponse = (response: MockResponse) => response as unknown as ReturnType<typeof mockCreate>;

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
        jiraData: mockJiraData,
        confData: mockConfluenceData
    };

    beforeAll(() => {
        // Save original environment variables
        originalEnv = { ...process.env };
        process.env.OPENAI_API_KEY = 'test-api-key';
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
        // Mock the OpenAI API response
        const mockResponseData = mockResponse('Test prompt response');
        mockCreate.mockResolvedValueOnce(asMockResponse(mockResponseData));

        const result = await service.generatePrompt(mockWorkflowState);

        expect(result).toBe('Test prompt response');
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should generate BA prompt successfully', async () => {
        // Mock the OpenAI API response
        const mockResponseData = mockResponse('BA prompt response');
        mockCreate.mockResolvedValueOnce(asMockResponse(mockResponseData));

        const baWorkflowState: WorkflowState = {
            ...mockWorkflowState,
            role: Role.BusinessAnalyst
        };

        const result = await service.generatePrompt(baWorkflowState);

        expect(result).toBe('BA prompt response');
        expect(mockCreate).toHaveBeenCalledTimes(1);
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
        // Mock an API error
        const error = new Error('API Error');
        mockCreate.mockImplementationOnce(() => Promise.reject(error));

        await expect(service.generatePrompt(mockWorkflowState))
            .rejects
            .toThrow('Failed to generate prompt using OpenAI API: API Error');
    });

    it('should handle unknown errors', async () => {
        // Mock an unknown error
        mockCreate.mockImplementationOnce(() => Promise.reject(new Error('Unknown error')));

        await expect(service.generatePrompt(mockWorkflowState))
            .rejects
            .toThrow('Failed to generate prompt using OpenAI API: Unknown error');
    });
});
