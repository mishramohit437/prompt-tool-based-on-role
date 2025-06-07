import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import logger from '../utils/logger.js';
import { executePromptWorkflow } from '../workflows/promptWorkflow.js';

class PromptController {
    constructor() {
        // No-op constructor; services are handled in the workflow
    }

    generatePrompt = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { role, jiraId, confId } = req.body as { role: Role; jiraId: string; confId: string };

            // Validate role
            if (role !== Role.Tester && role !== Role.BusinessAnalyst) {
                throw new AppError(400, `Invalid role: must be '${Role.Tester}' or '${Role.BusinessAnalyst}'`);
            }

            logger.info(`Processing request for role: ${role}, JIRA ID: ${jiraId}, Confluence ID: ${confId}`);

            // Execute workflow which handles data fetching and prompt generation
            const result = await executePromptWorkflow({ role, jiraId, confId });
            const output = result.output;

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
