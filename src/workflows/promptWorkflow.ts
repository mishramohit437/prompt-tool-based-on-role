import { StateGraph } from '@langchain/langgraph';
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
    const graph = new StateGraph<WorkflowState>();

    graph.addNode('fetchJira', async (state: WorkflowState): Promise<WorkflowState> => {
        const jiraData = await jiraService.fetchJiraData(state.jiraId);
        return { ...state, jiraData };
    });

    graph.addNode('fetchConfluence', async (state: WorkflowState): Promise<WorkflowState> => {
        const confData = await confluenceService.fetchConfluenceData(state.confId);
        return { ...state, confData };
    });

    graph.addNode('router', async (state: WorkflowState): Promise<WorkflowState> => state);

    graph.addNode('testerPrompt', async (state: WorkflowState): Promise<WorkflowState> => {
        const output = await promptService.generatePrompt(state);
        return { ...state, output };
    });

    graph.addNode('baPrompt', async (state: WorkflowState): Promise<WorkflowState> => {
        const output = await promptService.generatePrompt(state);
        return { ...state, output };
    });

    graph.addEdge('fetchJira', 'fetchConfluence');
    graph.addEdge('fetchConfluence', 'router');

    graph.addConditionalEdges('router', (state: WorkflowState) => {
        if (state.role === Role.Tester) return 'testerPrompt';
        if (state.role === Role.BusinessAnalyst) return 'baPrompt';
        throw new AppError(400, `Invalid role: must be '${Role.Tester}' or '${Role.BusinessAnalyst}'`);
    });

    graph.addEdge('testerPrompt', 'end');
    graph.addEdge('baPrompt', 'end');

    const executable = graph.compile();

    const result = await executable.invoke({
        role: input.role,
        jiraId: input.jiraId,
        confId: input.confId
    });

    return result;
}

