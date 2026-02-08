import { Sidebar } from "@/components/Sidebar";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* MAIN CONTENT */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* HEADER */}
                <header className="flex items-center justify-end h-16 px-8 border-b border-white/10 bg-slate-950">
                    <UserButton />
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
