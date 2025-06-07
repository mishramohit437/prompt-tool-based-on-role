export enum Role {
    Tester = 'Tester',
    BusinessAnalyst = 'BusinessAnalyst'
}

export interface JiraData {
    summary: string;
    description: string;
    acceptanceCriteria: string[];
}

export interface ConfluenceData {
    title: string;
    body: string;
}

export interface WorkflowState {
    role: Role;
    jiraData: JiraData;
    confData: ConfluenceData;
}

export class PromptGenerationError extends Error {
    cause?: Error;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'PromptGenerationError';
        
        // Set the cause if it's an instance of Error
        if (cause instanceof Error) {
            this.cause = cause;
        }
        
        // Set the prototype explicitly for TypeScript
        Object.setPrototypeOf(this, PromptGenerationError.prototype);
    }
}
