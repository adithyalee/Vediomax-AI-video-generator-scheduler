'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Library,
    Video,
    BookOpen,
    Building2,
    Settings,
    ShieldAlert,
    User,
    Plus,
    CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const sidebarItems = [
    { icon: Library, label: 'Series', href: '/dashboard' }, // Assuming dashboard home is series for now
    { icon: Video, label: 'Videos', href: '/dashboard/videos' },
    { icon: BookOpen, label: 'Guides', href: '/dashboard/guides' },
    { icon: Building2, label: 'Buildings', href: '/dashboard/buildings' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-slate-950 border-r border-white/10 text-white">
            {/* HEADER: Logo + Brand */}
            <div className="flex items-center gap-3 p-6">
                <div className="relative h-8 w-8">
                    <Image
                        src="/logo.png"
                        alt="VideoMax Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-xl font-bold text-white">VideoMax</span>
            </div>

            {/* CREATE BUTTON */}
            <div className="px-6 pb-4">
                <Link href="/dashboard/create">
                    <Button className="w-full justify-start gap-2 text-md font-semibold h-12 bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                        <Plus className="h-5 w-5" />
                        Create New Series
                    </Button>
                </Link>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 flex flex-col gap-1 px-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4">
                <Separator className="my-4" />
            </div>

            {/* FOOTER */}
            <div className="flex flex-col gap-1 px-4 pb-6">
                <Link
                    href="/dashboard/upgrade"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <ShieldAlert className="h-5 w-5" />
                    Upgrade
                </Link>
                <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <User className="h-5 w-5" />
                    Profile Settings
                </Link>
            </div>
        </div>
    );
}
