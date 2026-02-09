"use client";

import { useMemo, useState } from "react";
import { tasks, subtasks, users, Task, Subtask, User } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    ChevronDown,
    ChevronRight,
    Plus,
    Filter,
    AlertCircle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export default function TasksPage() {
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [filterAnalyst, setFilterAnalyst] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const toggleTask = (taskId: number) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    };

    const getAnalystName = (id: number) => users.find(u => u.id === id)?.name || "Unknown";

    const getTaskSubtasks = (taskId: number) => subtasks.filter(s => s.taskId === taskId);

    const calculateCompletion = (taskId: number) => {
        const taskSubtasks = getTaskSubtasks(taskId);
        const totalHours = taskSubtasks.reduce((acc, curr) => acc + curr.estimatedHours, 0);
        // Add 20% buffer
        const withBuffer = Math.ceil(totalHours * 1.2);
        // Simple calc: assume 1 analyst works 6 hours a day on this
        const days = Math.ceil(withBuffer / 6);
        return { hours: withBuffer, days };
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.customerName.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterAnalyst === "all") return matchesSearch;

        // Filter by analyst assigned to any subtask of this task
        const taskSubtasks = getTaskSubtasks(task.id);
        const hasAnalyst = taskSubtasks.some(s => s.assignedAnalystId.toString() === filterAnalyst);
        return matchesSearch && hasAnalyst;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage customer requests and assignments.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                    <CardDescription>
                        View and manage all active tasks.
                    </CardDescription>
                    <div className="flex items-center gap-4 py-4">
                        <div className="relative w-72">
                            <Input
                                placeholder="Search by customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterAnalyst} onValueChange={setFilterAnalyst}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Analyst" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Analysts</SelectItem>
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Est. Hours (Buffered)</TableHead>
                                <TableHead>Est. Completion</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.map((task) => {
                                const isExpanded = expandedTasks.has(task.id);
                                const stats = calculateCompletion(task.id);
                                const taskSubtasks = getTaskSubtasks(task.id);
                                const hasBlocked = taskSubtasks.some(s => s.stage === 'Blocked');

                                return (
                                    <>
                                        <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleTask(task.id)}>
                                            <TableCell>
                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {task.customerName}
                                                {hasBlocked && <Badge variant="destructive" className="ml-2 text-[10px] h-5">Blocked</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{task.taskType}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    task.priority >= 4 ? "bg-red-500 hover:bg-red-600" :
                                                        task.priority === 3 ? "bg-orange-500 hover:bg-orange-600" :
                                                            "bg-blue-500 hover:bg-blue-600"
                                                }>P{task.priority}</Badge>
                                            </TableCell>
                                            <TableCell>{task.requestedDate}</TableCell>
                                            <TableCell>{stats.hours} hrs</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">~{stats.days} days</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); /* Edit logic */ }}>Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                        {isExpanded && (
                                            <TableRow className="bg-muted/30">
                                                <TableCell colSpan={8} className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-semibold text-sm">Subtasks</h4>
                                                            <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Add Subtask</Button>
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {taskSubtasks.length === 0 ? (
                                                                <p className="text-sm text-muted-foreground">No subtasks yet.</p>
                                                            ) : (
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow className="h-8">
                                                                            <TableHead className="text-xs">Subtask Name</TableHead>
                                                                            <TableHead className="text-xs">Assigned To</TableHead>
                                                                            <TableHead className="text-xs">Stage</TableHead>
                                                                            <TableHead className="text-xs text-right">Hours</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {taskSubtasks.map(sub => (
                                                                            <TableRow key={sub.id} className="h-10 hover:bg-background">
                                                                                <TableCell className="text-sm font-medium">
                                                                                    {sub.name}
                                                                                    {sub.stage === 'Blocked' && (
                                                                                        <div className="flex items-center text-red-500 text-xs mt-1">
                                                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                                                            {sub.blockedReason}
                                                                                        </div>
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell className="text-sm">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                                            {getAnalystName(sub.assignedAnalystId)[0]}
                                                                                        </div>
                                                                                        {getAnalystName(sub.assignedAnalystId)}
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Badge variant={sub.stage === 'Completed' ? 'default' : sub.stage === 'Blocked' ? 'destructive' : 'secondary'}>
                                                                                        {sub.stage}
                                                                                    </Badge>
                                                                                </TableCell>
                                                                                <TableCell className="text-right text-sm">{sub.estimatedHours}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
