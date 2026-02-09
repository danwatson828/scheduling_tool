"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Task, Subtask, User } from "@/lib/data";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface NewTaskDialogProps {
    users: User[];
    existingCustomers: string[];
    onAddTask: (task: Task, subtasks: Subtask[]) => void;
}

interface MiniSubtask {
    id: number;
    name: string;
    analystId: string;
    hours: string;
    dueDate?: string;
}

export function NewTaskDialog({ users, existingCustomers, onAddTask }: NewTaskDialogProps) {
    const [open, setOpen] = useState(false);

    // Form State
    const [customer, setCustomer] = useState("");
    const [taskName, setTaskName] = useState(""); // Parent Task Name
    const [date, setDate] = useState("2023-11-01"); // "Start Date"
    const [presentationDate, setPresentationDate] = useState("");

    const [customerOpen, setCustomerOpen] = useState(false);

    // Subtasks State
    const [subtasks, setSubtasks] = useState<MiniSubtask[]>([
        { id: 1, name: "Initial Analysis", analystId: "", hours: "5" }
    ]);

    const addSubtaskRow = () => {
        setSubtasks([...subtasks, { id: Math.random(), name: "", analystId: "", hours: "5" }]);
    };

    const removeSubtaskRow = (id: number) => {
        if (subtasks.length > 1) {
            setSubtasks(subtasks.filter(s => s.id !== id));
        }
    };

    const updateSubtask = (id: number, field: keyof MiniSubtask, value: string) => {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!customer || !taskName) return;
        const validSubtasks = subtasks.filter(s => s.name && s.analystId);
        if (validSubtasks.length === 0) return;

        // Create IDs
        const newTaskId = Math.floor(Math.random() * 10000);

        const newTask: Task = {
            id: newTaskId,
            customerName: customer,
            taskType: 'Custom Analysis',
            leadAnalystId: parseInt(validSubtasks[0].analystId), // Default to first analyst
            priority: 5, // Cast to number
            requestedDate: date,
            addedDate: new Date().toISOString().split('T')[0], // Today
            presentationDate: presentationDate || undefined,
            estimatedCompletionDate: date, // Placeholder, would be calc'd
            status: 'In Progress'
        };

        const newSubtaskObjects: Subtask[] = validSubtasks.map(s => ({
            id: Math.floor(Math.random() * 100000) + s.id, // Ensure uniqueness
            taskId: newTaskId,
            name: s.name,
            assignedAnalystId: parseInt(s.analystId),
            stage: 'Scripting & Data Pull',
            estimatedHours: parseInt(s.hours),
            startDate: date, // Initialize all subtask start dates to parent start date
            dueDate: s.dueDate // Map the due date
        }));

        onAddTask(newTask, newSubtaskObjects);
        setOpen(false);

        // Reset form
        setCustomer("");
        setTaskName("");
        setPresentationDate("");
        setSubtasks([{ id: 1, name: "Initial Analysis", analystId: "", hours: "5" }]);
    };

    // Combine existing customers with current input if it's new
    const uniqueCustomers = useMemo(() => {
        const set = new Set(existingCustomers);
        if (customer && !set.has(customer)) {
            // Don't add to the list strictly here, mostly for display logic
        }
        return Array.from(set).sort();
    }, [existingCustomers, customer]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">New Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new parent task and its subtasks.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden gap-4 py-4">
                    {/* Top Section: Parent Task Details */}
                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                        <div className="flex flex-col gap-2">
                            <Label>Customer</Label>
                            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={customerOpen}
                                        className="justify-between"
                                    >
                                        {customer || "Select or type customer..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search customer..." onValueChange={(val) => setCustomer(val)} />
                                        <CommandList>
                                            <CommandEmpty>
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No customer found. <br />
                                                    <span className="font-medium text-foreground">"{customer}"</span> will be created.
                                                </div>
                                                <Button variant="ghost" className="w-full text-xs" onClick={() => setCustomerOpen(false)}>Confirm New</Button>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {uniqueCustomers.map((c) => (
                                                    <CommandItem
                                                        key={c}
                                                        value={c}
                                                        onSelect={(currentValue) => {
                                                            setCustomer(currentValue)
                                                            setCustomerOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                customer === c ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {c}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Parent Task Name</Label>
                            <Input
                                placeholder="e.g. Q4 QBR"
                                value={taskName}
                                onChange={e => setTaskName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Presentation Date <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Input
                                type="date"
                                value={presentationDate}
                                onChange={e => setPresentationDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Subtasks Section */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <Label>Subtasks</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSubtaskRow} className="w-full">
                                Add Study
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 border rounded-md p-2">
                            <div className="space-y-2">
                                {subtasks.map((sub, index) => (
                                    <div key={sub.id} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md bg-muted/20">
                                        <div className="col-span-4 flex flex-col gap-1">
                                            <Label className="text-xs">Study Name</Label>
                                            <Input
                                                placeholder="Subtask Name"
                                                value={sub.name}
                                                onChange={e => updateSubtask(sub.id, 'name', e.target.value)}
                                                className="h-8"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-3 flex flex-col gap-1">
                                            <Label className="text-xs">Analyst</Label>
                                            <Select value={sub.analystId} onValueChange={v => updateSubtask(sub.id, 'analystId', v)}>
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="Analyst" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map(u => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 flex flex-col gap-1">
                                            <Label className="text-xs">Due Date</Label>
                                            <Input
                                                type="date"
                                                value={sub.dueDate || ""}
                                                onChange={e => updateSubtask(sub.id, 'dueDate', e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-2 flex flex-col gap-1">
                                            <Label className="text-xs">Hours</Label>
                                            <Input
                                                type="number"
                                                value={sub.hours}
                                                onChange={e => updateSubtask(sub.id, 'hours', e.target.value)}
                                                className="h-8"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                                onClick={() => removeSubtaskRow(sub.id)}
                                                disabled={subtasks.length === 1}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit">Create Task & Subtasks</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
