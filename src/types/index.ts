export enum Role {
    Tester = 'Tester',
    BusinessAnalyst = 'BusinessAnalyst'
}

export interface GeneratePromptRequest {
    role: Role;
    jiraId: string;
    confId: string;
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

export interface ApiResponse {
    role?: Role;
    jiraId?: string;
    confId?: string;
    output?: string;
    error?: string;
}
