export type Role = 'Analyst' | 'Staff Analyst' | 'AVP' | 'Team Lead';
export type TaskType = 'Client Meeting' | 'Value Reporting' | 'QBR' | 'Custom Analysis' | 'Custom Dashboard' | 'Opportunity Analysis' | 'Prospective Customer';
export type SubtaskStage = 'Data Validation' | 'Scripting & Data Pull' | 'Validation' | 'Review w/ Staff Analyst' | 'Review w/ AVP' | 'Completed' | 'Blocked';

export interface User {
    id: number;
    name: string;
    role: Role;
    avatar?: string;
}

export interface Task {
    id: number;
    customerName: string;
    taskType: TaskType;
    leadAnalystId: number;
    priority: number; // 1-5
    requestedDate: string; // ISO date - effectively the "Start Date" of the project context
    addedDate: string; // ISO date
    presentationDate?: string; // ISO date
    estimatedCompletionDate: string;
    subtasks?: Subtask[];
}

export interface Subtask {
    id: number;
    taskId: number;
    name: string;
    assignedAnalystId: number;
    stage: SubtaskStage;
    startDate: string; // ISO Date - Independent scheduling
    dueDate?: string; // ISO Date
    completionDate?: string; // ISO Date
    estimatedHours: number;
    blockedReason?: string;
}

export const users: User[] = [
    { id: 1, name: "Alice Analyst", role: "Analyst", avatar: "A" },
    { id: 2, name: "Bob Builder", role: "Analyst", avatar: "B" },
    { id: 3, name: "Charlie Chief", role: "Team Lead", avatar: "C" },
    { id: 4, name: "Sarah Staff", role: "Staff Analyst", avatar: "S" },
    { id: 5, name: "David Data", role: "Analyst", avatar: "D" },
];

export const tasks: Task[] = [
    {
        id: 101,
        customerName: "Acme Corp",
        taskType: "QBR",
        leadAnalystId: 3,
        priority: 5,
        requestedDate: "2023-11-01",
        addedDate: "2023-10-25",
        presentationDate: "2023-11-10",
        estimatedCompletionDate: "2023-11-15",
    },
    {
        id: 102,
        customerName: "Global Tech",
        taskType: "Custom Dashboard",
        leadAnalystId: 3,
        priority: 4,
        requestedDate: "2023-11-05",
        addedDate: "2023-10-28",
        presentationDate: "2023-11-25",
        estimatedCompletionDate: "2023-11-20",
    },
    {
        id: 103,
        customerName: "StartUp Inc",
        taskType: "Value Reporting",
        leadAnalystId: 3,
        priority: 3,
        requestedDate: "2023-11-10",
        addedDate: "2023-11-01",
        estimatedCompletionDate: "2023-11-25",
    },
];

export const subtasks: Subtask[] = [
    // Acme Corp QBR
    { id: 1, taskId: 101, name: "Pull Q3 Data", assignedAnalystId: 1, stage: "Completed", startDate: "2023-11-01", completionDate: "2023-11-02", estimatedHours: 4 },
    { id: 2, taskId: 101, name: "Generate Slides", assignedAnalystId: 1, stage: "Validation", startDate: "2023-11-03", dueDate: "2023-11-08", estimatedHours: 6 },
    { id: 3, taskId: 101, name: "Review with Sales", assignedAnalystId: 3, stage: "Data Validation", startDate: "2023-11-09", estimatedHours: 2 },

    // Global Tech Dashboard
    { id: 4, taskId: 102, name: "SQL Query Setup", assignedAnalystId: 2, stage: "Scripting & Data Pull", startDate: "2023-11-05", estimatedHours: 8 },
    { id: 5, taskId: 102, name: "Tableau Visualization", assignedAnalystId: 2, stage: "Data Validation", startDate: "2023-11-08", dueDate: "2023-11-15", estimatedHours: 5 },

    // StartUp Inc Value Report
    { id: 6, taskId: 103, name: "Data Extraction", assignedAnalystId: 5, stage: "Blocked", startDate: "2023-11-10", estimatedHours: 3, blockedReason: "Missing credentials" },
    { id: 7, taskId: 103, name: "Report Writeup", assignedAnalystId: 5, stage: "Data Validation", startDate: "2023-11-12", estimatedHours: 4 },
];
