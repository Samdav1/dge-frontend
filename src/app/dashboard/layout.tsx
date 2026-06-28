import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { FloatingRideWidget } from "@/features/driving/components/FloatingRideWidget";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
            <DashboardSidebar />
            <div className="lg:pl-64">
                <DashboardHeader />
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
            <FloatingRideWidget />
        </div>
    );
}
