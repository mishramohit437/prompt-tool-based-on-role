import JiraService from '../services/jiraService.js';
import ConfluenceService from '../services/confluenceService.js';
import PromptGenerationService from '../services/promptGenerationService.js';
import { Role, WorkflowState } from '../types/index.js';
import { AppError } from '../middleware/error.js';

const jiraService = new JiraService();
const confluenceService = new ConfluenceService();
const promptService = new PromptGenerationService();

interface PromptWorkflowInput {
    role: Role;
    jiraId: string;
    confId: string;
}

export async function executePromptWorkflow(input: PromptWorkflowInput): Promise<WorkflowState> {
    const state: WorkflowState = {
        role: input.role,
        jiraId: input.jiraId,
        confId: input.confId
    };

    // Fetch data from services
    state.jiraData = await jiraService.fetchJiraData(state.jiraId);
    state.confData = await confluenceService.fetchConfluenceData(state.confId);

    // Determine which prompt to generate based on the role
    if (state.role === Role.Tester || state.role === Role.BusinessAnalyst) {
        state.output = await promptService.generatePrompt(state);
    } else {
        throw new AppError(400, `Invalid role: must be '${Role.Tester}' or '${Role.BusinessAnalyst}'`);
    }

    return state;
}

