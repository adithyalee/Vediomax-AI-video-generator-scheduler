'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from 'lucide-react';
import { deleteAccount } from '@/actions/settings';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeleteAccountButton() {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            toast.success("Account deleted successfully");
            router.push('/'); // Redirect to home or sign-in
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account");
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Account"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
