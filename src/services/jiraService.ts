import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JiraData } from '../types/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JiraService {
    private readonly mocksPath: string;

    constructor() {
        this.mocksPath = path.join(__dirname, '..', 'mocks');
    }

    async fetchJiraData(jiraId: string): Promise<JiraData> {
        try {
            const filePath = path.join(this.mocksPath, `JIRA-${jiraId}.json`);
            const data = await fs.readFile(filePath, 'utf-8');
            const jiraData = JSON.parse(data) as JiraData;

            logger.info(`Successfully fetched JIRA data for ID: ${jiraId}`);
            return jiraData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to fetch JIRA data for ID: ${jiraId}`, { error: errorMessage });
            throw new AppError(404, `JIRA data not found for ID: ${jiraId}`);
        }
    }
}

export default JiraService;
