import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/NavBar";
import { Toaster } from "@/components/ui/sonner"; // If we use sonner, need to install it. Or use simple alert.
// I'll skip toaster for now or install it.

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Analytics Capacity Scheduler",
    description: "Manage your analytics team capacity",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar />
                <main className="container mx-auto p-4">
                    {children}
                </main>
            </body>
        </html>
    );
}
