import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConfluenceData } from '../types/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfluenceService {
    private readonly mocksPath: string;

    constructor() {
        this.mocksPath = path.join(__dirname, '..', 'mocks');
    }

    async fetchConfluenceData(confId: string): Promise<ConfluenceData> {
        try {
            const filePath = path.join(this.mocksPath, `CONFLUENCE-${confId}.json`);
            const data = await fs.readFile(filePath, 'utf-8');
            const confData = JSON.parse(data) as ConfluenceData;

            logger.info(`Successfully fetched Confluence data for ID: ${confId}`);
            return confData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to fetch Confluence data for ID: ${confId}`, { error: errorMessage });
            throw new AppError(404, `Confluence data not found for ID: ${confId}`);
        }
    }
}

export default ConfluenceService;
