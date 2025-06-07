import { Request, Response, NextFunction } from 'express';
import JiraService from '../services/jiraService.js';
import ConfluenceService from '../services/confluenceService.js';
import PromptGenerationService from '../services/promptGenerationService.js';
import { Role, WorkflowState } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import logger from '../utils/logger.js';

class PromptController {
    private jiraService: JiraService;
    private confluenceService: ConfluenceService;
    private promptService: PromptGenerationService;

    constructor() {
        this.jiraService = new JiraService();
        this.confluenceService = new ConfluenceService();
        this.promptService = new PromptGenerationService();
    }

    generatePrompt = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { role, jiraId, confId } = req.body as { role: Role; jiraId: string; confId: string };

            // Validate role
            if (role !== Role.Tester && role !== Role.BusinessAnalyst) {
                throw new AppError(400, `Invalid role: must be '${Role.Tester}' or '${Role.BusinessAnalyst}'`);
            }

            logger.info(`Processing request for role: ${role}, JIRA ID: ${jiraId}, Confluence ID: ${confId}`);

            // Fetch JIRA and Confluence data
            const [jiraData, confData] = await Promise.all([
                this.jiraService.fetchJiraData(jiraId),
                this.confluenceService.fetchConfluenceData(confId)
            ]);

            // Initialize workflow state with required data
            const state: WorkflowState = {
                role,
                jiraData,
                confData
            };

            // Generate prompt based on role
            const output = await this.promptService.generatePrompt(state);

            // Send response
            res.status(200).json({
                success: true,
                data: {
                    role,
                    jiraId,
                    confId,
                    output
                }
            });
        } catch (error) {
            next(error);
        }
    };
}

export default PromptController;