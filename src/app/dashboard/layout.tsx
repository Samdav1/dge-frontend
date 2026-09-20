import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { MobileBottomNav } from "@/features/dashboard/components/MobileBottomNav";
import { EmailVerificationBanner } from "@/components/ui/EmailVerificationBanner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] overflow-x-hidden w-full max-w-full">
            <DashboardSidebar />
            <div className="lg:pl-64 w-full max-w-full overflow-x-hidden">
                <EmailVerificationBanner />
                <DashboardHeader />
                <main className="p-3 sm:p-4 md:p-8 pb-24 lg:pb-8 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
            <MobileBottomNav />
        </div>
    );
}

