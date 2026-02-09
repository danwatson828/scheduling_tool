
import { db } from '../src/db/index';
import { users, tasks, subtasks } from '../src/db/schema';
import { users as initialUsers, tasks as initialTasks, subtasks as initialSubtasks } from '../src/lib/data';

async function main() {
    console.log('Seeding database...');

    // 1. Users
    console.log('Seeding users...');
    for (const user of initialUsers) {
        await db.insert(users).values({
            // Ensure ID matches if possible, or let serial handle it and map later.
            // For seed, better to force ID if we can, but serial columns auto-increment.
            // Drizzle doesn't easily let us force IDs on serial columns unless we use 'overriding system value'.
            // For simplicity in this MVP seed, we'll let DB generate IDs and trust they start at 1 if table is empty.
            // OR we can explicitly insert if we want to match `data.ts` relations.
            // Let's try inserting without ID first, but that breaks relations if IDs shift.
            // Actually, we can assume fresh DB.
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            clerkId: `mock_clerk_${user.id}`, // Placeholder
        });
    }

    // 2. Tasks
    console.log('Seeding tasks...');
    for (const task of initialTasks) {
        await db.insert(tasks).values({
            customerName: task.customerName,
            taskType: task.taskType,
            leadAnalystId: task.leadAnalystId,
            priority: task.priority,
            requestedDate: task.requestedDate,
            addedDate: task.addedDate,
            presentationDate: task.presentationDate,
            estimatedCompletionDate: task.estimatedCompletionDate,
        });
    }

    // 3. Subtasks
    console.log('Seeding subtasks...');
    for (const subtask of initialSubtasks) {
        await db.insert(subtasks).values({
            taskId: subtask.taskId,
            name: subtask.name,
            assignedAnalystId: subtask.assignedAnalystId,
            stage: subtask.stage,
            startDate: subtask.startDate,
            dueDate: subtask.dueDate,
            completionDate: subtask.completionDate,
            estimatedHours: subtask.estimatedHours,
            blockedReason: subtask.blockedReason,
        });
    }

    console.log('Seeding finished.');
}

main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
