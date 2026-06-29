"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/ui/FallbackImage";
import { useSession } from "next-auth/react";

export function JobListingSection() {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                <div className="bg-[#FFFBF0] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 order-2 md:order-1">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <FallbackImage
                                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                                alt="Job Listing"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69C2E] mb-4">For Clients & Businesses</p>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                            Post a Project.<br />
                            <span className="text-[#C69C2E]">Get the Best Talent.</span>
                        </h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            Can't find what you're looking for? Post a job for free and let the talent come to you. Freelancers and service providers from across Nigeria will submit competitive bids for your consideration.
                        </p>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Review proposals, negotiate prices directly, and once you're happy, confirm the deal. Your payment is secured in Escrow until the job is done right.
                        </p>
                        <Link href={isAuthenticated ? "/dashboard/job-board" : "/register"}>
                            <Button variant="default" className="bg-[#C69C2E] hover:bg-[#B58B1D] text-white px-8 py-5 rounded-xl font-semibold">Post a Job for Free</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
