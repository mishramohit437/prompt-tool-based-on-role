import { Router } from 'express';
import PromptController from '../controllers/promptController.js';

const router = Router();
const promptController = new PromptController();

router.post('/generate', promptController.generatePrompt);

export default router;
