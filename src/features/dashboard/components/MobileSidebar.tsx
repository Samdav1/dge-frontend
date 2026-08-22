"use client";

import { Menu } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DashboardSidebar } from "./DashboardSidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700">
                    <Menu className="w-6 h-6" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0D0D0D] z-50 shadow-xl flex flex-col h-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200 ease-in-out outline-none overflow-hidden">
                    <VisuallyHidden>
                        <Dialog.Title>Navigation Menu</Dialog.Title>
                        <Dialog.Description>Mobile navigation sidebar</Dialog.Description>
                    </VisuallyHidden>
                    <DashboardSidebar mobile />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
