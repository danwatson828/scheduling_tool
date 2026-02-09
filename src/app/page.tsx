import { ResourceCalendar } from "@/components/ResourceCalendar";
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getInitialData } from "./actions";

// This is now a Server Component
export default async function DashboardPage() {
    const { users, tasks, subtasks } = await getInitialData();

    // Calculate stats based on DB data
    const activeSubtasks = subtasks.filter(s => s.stage !== 'Completed').length;
    const totalAnalytics = users.filter(u => u.role.includes('Analyst')).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Capacity Dashboard</h1>
                <p className="text-muted-foreground">Real-time view of analyst workload and availability.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
                        <div className="text-2xl font-bold">{activeSubtasks}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Analysts</CardTitle>
                        <div className="text-2xl font-bold">{totalAnalytics}</div>
                    </CardHeader>
                </Card>
            </div>

            {/* Pass DB data to the client component */}
            <ResourceCalendar
                users={users}
                initialSubtasks={subtasks}
                initialTasks={tasks}
            />
        </div>
    );
}
