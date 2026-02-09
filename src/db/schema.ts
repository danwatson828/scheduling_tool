import { pgTable, serial, text, integer, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['Analyst', 'Staff Analyst', 'AVP', 'Team Lead']);
export const taskTypeEnum = pgEnum('task_type', [
    'Client Meeting', 'Value Reporting', 'QBR', 'Custom Analysis',
    'Custom Dashboard', 'Opportunity Analysis', 'Prospective Customer'
]);
export const subtaskStageEnum = pgEnum('subtask_stage', [
    'Data Validation', 'Scripting & Data Pull', 'Validation',
    'Review w/ Staff Analyst', 'Review w/ AVP', 'Completed', 'Blocked'
]);

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    clerkId: text('clerk_id').unique(), // Made optional/nullable for seed data compatibility if needed, or keep unique
    name: text('name').notNull(),
    role: userRoleEnum('role').notNull().default('Analyst'),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    customerName: text('customer_name').notNull(),
    taskType: taskTypeEnum('task_type').notNull(),
    leadAnalystId: integer('lead_analyst_id').references(() => users.id),
    priority: integer('priority').notNull().default(3),
    requestedDate: date('requested_date'),
    addedDate: date('added_date').defaultNow(),
    presentationDate: date('presentation_date'),
    estimatedCompletionDate: date('estimated_completion_date'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const subtasks = pgTable('subtasks', {
    id: serial('id').primaryKey(),
    taskId: integer('task_id').references(() => tasks.id).notNull(),
    name: text('name').notNull(),
    assignedAnalystId: integer('assigned_analyst_id').references(() => users.id),
    stage: subtaskStageEnum('stage').notNull().default('Data Validation'),
    startDate: date('start_date'),
    dueDate: date('due_date'),
    completionDate: date('completion_date'),
    estimatedHours: integer('estimated_hours').notNull().default(0),
    blockedReason: text('blocked_reason'),
    createdAt: timestamp('created_at').defaultNow(),
    stageChangedAt: timestamp('stage_changed_at'),
});
