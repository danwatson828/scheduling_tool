"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export function Navbar() {
    const pathname = usePathname();
    const [role, setRole] = useState("Team Lead"); // Mock role for MVP

    const navItems = [
        { name: "Dashboard", href: "/" },
        { name: "Tasks", href: "/tasks" },
    ];

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <span className="text-primary">📊</span>
                        Scheduler
                    </Link>
                    <div className="flex gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground hidden md:block">
                        Viewing as: <span className="font-semibold text-foreground">{role}</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                                    <AvatarFallback>TL</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuItem onClick={() => setRole("Team Lead")}>
                                Switch to Team Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRole("Analyst")}>
                                Switch to Analyst
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRole("AVP")}>
                                Switch to AVP
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
