"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Task, Subtask, User, SubtaskStage } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

interface TaskDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    subtask: Subtask | null;
    task: Task | null;
    analyst: User | undefined;
    onUpdateSubtask: (subtask: Subtask) => void;
}

const STAGE_OPTIONS: SubtaskStage[] = [
    'Data Validation',
    'Scripting & Data Pull',
    'Validation',
    'Review w/ Staff Analyst',
    'Review w/ AVP',
    'Completed',
    'Blocked'
];

export function TaskDetailsSheet({ isOpen, onClose, subtask, task, analyst, onUpdateSubtask }: TaskDetailsSheetProps) {
    if (!subtask || !task) return null;

    const handleMarkComplete = () => {
        const updatedSubtask: Subtask = {
            ...subtask,
            stage: 'Completed',
            completionDate: new Date().toISOString().split('T')[0]
        };
        onUpdateSubtask(updatedSubtask);
    };

    const handleStageChange = (newStage: SubtaskStage) => {
        const updatedSubtask: Subtask = {
            ...subtask,
            stage: newStage,
            // Auto-set completion date if marking as completed
            completionDate: (newStage as string) === 'Completed'
                ? new Date().toISOString().split('T')[0]
                : ((newStage as string) !== 'Completed' && subtask.completionDate ? undefined : subtask.completionDate)
        };
        onUpdateSubtask(updatedSubtask);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="mb-2">
                            {task.taskType}
                        </Badge>
                        <Badge className={
                            subtask.stage === 'Blocked' ? "bg-red-500" :
                                subtask.stage === 'Completed' ? "bg-green-500" :
                                    "bg-blue-600"
                        }>
                            {subtask.stage}
                        </Badge>
                    </div>
                    <SheetTitle>{subtask.name}</SheetTitle>
                    <SheetDescription>
                        {task.customerName} - {task.taskType}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                    {/* Stage Selector */}
                    <div className="grid gap-2">
                        <label className="text-sm font-semibold">Change Stage</label>
                        <Select value={subtask.stage} onValueChange={handleStageChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STAGE_OPTIONS.map(stage => (
                                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quick Complete Button */}
                    {subtask.stage !== 'Completed' && (
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium" onClick={handleMarkComplete}>
                            Mark as Complete
                        </Button>
                    )}

                    {/* Analyst Info */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{analyst?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-sm font-medium">Assigned to</div>
                            <div className="font-bold">{analyst?.name}</div>
                        </div>
                    </div>

                    <Separator />

                    {/* Subtask Specific Dates */}
                    <div className="grid gap-2">
                        <h4 className="font-semibold text-base">Schedule (Study)</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-1">
                            <div>
                                <span className="text-muted-foreground block text-xs">Start Date</span>
                                {format(parseISO(subtask.startDate), 'MMM d, yyyy')}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Due Date</span>
                                {subtask.dueDate ? format(parseISO(subtask.dueDate), 'MMM d, yyyy') : '-'}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Completion Date</span>
                                {subtask.completionDate ? format(parseISO(subtask.completionDate), 'MMM d, yyyy') : '-'}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Est. Hours</span>
                                {subtask.estimatedHours}h
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Parent Task Dates */}
                    <div className="grid gap-2">
                        <h4 className="font-semibold text-base">Project Timeline</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-1">
                            <div>
                                <span className="text-muted-foreground block text-xs">Added On</span>
                                {task.addedDate ? format(parseISO(task.addedDate), 'MMM d, yyyy') : '-'}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Presentation Date</span>
                                {task.presentationDate ? format(parseISO(task.presentationDate), 'MMM d, yyyy') : '-'}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Est. Project End</span>
                                {format(parseISO(task.estimatedCompletionDate), 'MMM d, yyyy')}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Priority</span>
                                P{task.priority}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Blocked Reason */}
                    {subtask.stage === 'Blocked' && subtask.blockedReason && (
                        <div className="bg-red-50 p-3 rounded-md border border-red-200">
                            <h4 className="font-semibold text-red-700 text-sm mb-1">Blocked Reason</h4>
                            <p className="text-sm text-red-600">{subtask.blockedReason}</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
