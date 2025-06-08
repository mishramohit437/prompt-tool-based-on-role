import { END, StateGraph } from '@langchain/langgraph';
import JiraService from '../services/jiraService.js';
import ConfluenceService from '../services/confluenceService.js';
import PromptGenerationService from '../services/promptGenerationService.js';
import { Role, WorkflowState } from '../types/index.js';
import { AppError } from '../middleware/error.js';

const jiraService = new JiraService();
const confluenceService = new ConfluenceService();
const promptService = new PromptGenerationService();

export interface PromptWorkflowInput {
    role: Role;
    jiraId: string;
    confId: string;
}

export async function executePromptWorkflow(input: PromptWorkflowInput): Promise<WorkflowState> {
    const graph = new StateGraph<WorkflowState>();

    graph.addNode('fetchJiraNode', async (state) => {
        try {
            state.jiraData = await jiraService.fetchJiraData(state.jiraId);
        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Unknown error';
        }
        return state;
    });

    graph.addNode('fetchConfluenceNode', async (state) => {
        if (state.error) return state;
        try {
            state.confData = await confluenceService.fetchConfluenceData(state.confId);
        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Unknown error';
        }
        return state;
    });

    graph.addNode('roleRouterNode', async (state) => {
        if (state.error) return state;
        if (state.role !== Role.Tester && state.role !== Role.BusinessAnalyst) {
            state.error = `Invalid role: must be '${Role.Tester}' or '${Role.BusinessAnalyst}'`;
        }
        return state;
    });

    const promptNode = async (state: WorkflowState): Promise<WorkflowState> => {
        if (state.error) return state;
        try {
            state.output = await promptService.generatePrompt(state);
        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Unknown error';
        }
        return state;
    };

    graph.addNode('testerPromptNode', promptNode);
    graph.addNode('baPromptNode', promptNode);

    graph.addEdge('fetchJiraNode', 'fetchConfluenceNode');
    graph.addEdge('fetchConfluenceNode', 'roleRouterNode');
    graph.addConditionalEdge('roleRouterNode', (s) => {
        if (s.error) return END;
        return s.role === Role.Tester ? 'testerPromptNode' : 'baPromptNode';
    });
    graph.addEdge('testerPromptNode', END);
    graph.addEdge('baPromptNode', END);

    const workflow = graph.compile();

    const result = await workflow.invoke({
        role: input.role,
        jiraId: input.jiraId,
        confId: input.confId
    });

    if (result.error) {
        throw new AppError(400, result.error);
    }

    return result;
}
