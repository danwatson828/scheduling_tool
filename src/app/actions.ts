'use server';

import { db } from '@/db';
import { tasks, subtasks, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { User, Task, Subtask } from '@/lib/data';

import { users as mockUsers, tasks as mockTasks, subtasks as mockSubtasks } from '@/lib/data';

// --- Data Fetching ---

export async function getInitialData() {
    try {
        const allUsers = await db.select().from(users);
        const allTasks = await db.select().from(tasks);
        const allSubtasks = await db.select().from(subtasks);

        // Transform DB shapes to App shapes if necessary (currently they match closely)
        // Note: Enum mapping might be needed if TS complains, but Drizzle handles it well usually.

        // We need to nest subtasks into tasks for the 'Task' interface if used that way, 
        // but the app currently keeps them separate in 'page.tsx' state (tasks vs subtasks).

        return {
            users: allUsers as unknown as User[],
            tasks: allTasks as unknown as Task[],
            subtasks: allSubtasks as unknown as Subtask[]
        };
    } catch (error) {
        console.warn("Database fetch failed (likely missing env vars during build). Falling back to mock data.");
        return {
            users: mockUsers,
            tasks: mockTasks,
            subtasks: mockSubtasks
        };
    }
}

// --- Mutations ---

export async function addTask(taskData: Omit<Task, 'id' | 'subtasks'>) {
    const [newTask] = await db.insert(tasks).values({
        customerName: taskData.customerName,
        taskType: taskData.taskType, // Type cast might be needed if generic string
        leadAnalystId: taskData.leadAnalystId,
        priority: taskData.priority,
        requestedDate: taskData.requestedDate,
        presentationDate: taskData.presentationDate,
        estimatedCompletionDate: taskData.estimatedCompletionDate,
        addedDate: taskData.addedDate,
    }).returning();

    revalidatePath('/');
    return newTask;
}

export async function addSubtask(subtaskData: Omit<Subtask, 'id'>) {
    const [newSubtask] = await db.insert(subtasks).values({
        taskId: subtaskData.taskId,
        name: subtaskData.name,
        assignedAnalystId: subtaskData.assignedAnalystId,
        stage: subtaskData.stage,
        startDate: subtaskData.startDate,
        dueDate: subtaskData.dueDate,
        completionDate: subtaskData.completionDate,
        estimatedHours: subtaskData.estimatedHours,
        blockedReason: subtaskData.blockedReason,
    }).returning();

    revalidatePath('/');
    return newSubtask;
}

export async function updateSubtask(id: number, updates: Partial<Subtask>) {
    const [updated] = await db.update(subtasks)
        .set({
            ...updates,
            stageChangedAt: updates.stage ? new Date() : undefined
        })
        .where(eq(subtasks.id, id))
        .returning();

    revalidatePath('/');
    return updated;
}

export async function deleteSubtask(id: number) {
    await db.delete(subtasks).where(eq(subtasks.id, id));
    revalidatePath('/');
}
