import { Suspense } from "react";
import { ProfileLayout } from "@/features/profile/components/ProfileLayout";

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Profile...</div>}>
            <ProfileLayout />
        </Suspense>
    );
}
