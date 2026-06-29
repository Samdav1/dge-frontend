"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists, if not I'll use Input or create it
import { Loader2 } from "lucide-react";
import { createUserPortfolio, updateUserPortfolio, getUserPortfolio } from "../actions";
import { UserPortfolio } from "../types";
import { PortfolioMediaUpload } from "./PortfolioMediaUpload";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const portfolioSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    skills: z.string(),
    experience_years: z.coerce.number().min(0, "Experience must be positive"),
    hourly_rate: z.coerce.number().min(0, "Hourly rate must be positive").optional(),
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export function PortfolioSetupForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PortfolioFormValues>({
        resolver: zodResolver(portfolioSchema) as any,
    });

    useEffect(() => {
        async function loadPortfolio() {
            try {
                const data = await getUserPortfolio();
                if (data) {
                    setPortfolio(data);
                    const portfolioData = data as any;
                    let extraData: any = {};
                    try {
                        if (portfolioData.category) {
                            extraData = JSON.parse(portfolioData.category);
                        }
                    } catch (e) {
                        console.error("Failed to parse category JSON", e);
                    }
                    reset({
                        title: portfolioData.title || "",
                        description: portfolioData.description || "",
                        skills: Array.isArray(extraData.skills) ? extraData.skills.join(", ") : "",
                        experience_years: extraData.experience_years || 0,
                        hourly_rate: extraData.hourly_rate || 0,
                    });
                }
            } catch (error) {
                console.error("Failed to load portfolio:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadPortfolio();
    }, [reset]);

    const onSubmit = async (data: PortfolioFormValues) => {
        setIsSaving(true);
        try {
            const extraData = {
                skills: data.skills.split(",").map((s) => s.trim()).filter(Boolean),
                experience_years: data.experience_years,
                hourly_rate: data.hourly_rate,
            };

            const payload = {
                title: data.title,
                description: data.description,
                category: JSON.stringify(extraData),
            };

            if (portfolio) {
                await updateUserPortfolio(payload as any);
            } else {
                const newPortfolio = await createUserPortfolio(payload as any);
                setPortfolio(newPortfolio);
            }
            router.refresh();
            toast.success("Portfolio saved successfully!");
        } catch (error) {
            console.error("Failed to save portfolio:", error);
            toast.error("Failed to save portfolio. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-6">
            <div>
                <h1 className="text-2xl font-bold">Portfolio Setup</h1>
                <p className="text-muted-foreground">Showcase your work and skills to potential clients.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Portfolio Title</label>
                    <Input id="title" placeholder="e.g. Senior Full Stack Developer" {...register("title")} />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea
                        id="description"
                        placeholder="Describe your expertise and experience..."
                        className="min-h-[120px]"
                        {...register("description")}
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="experience_years" className="text-sm font-medium">Years of Experience</label>
                        <Input type="number" id="experience_years" {...register("experience_years")} />
                        {errors.experience_years && <p className="text-xs text-red-500">{errors.experience_years.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="hourly_rate" className="text-sm font-medium">Hourly Rate ($)</label>
                        <Input type="number" step="0.01" id="hourly_rate" {...register("hourly_rate")} />
                        {errors.hourly_rate && <p className="text-xs text-red-500">{errors.hourly_rate.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="skills" className="text-sm font-medium">Skills (comma separated)</label>
                    <Input id="skills" placeholder="React, Node.js, TypeScript..." {...register("skills")} />
                    {errors.skills && <p className="text-xs text-red-500">{errors.skills.message}</p>}
                </div>

                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {portfolio ? "Update Portfolio" : "Create Portfolio"}
                </Button>
            </form>

            {portfolio ? (
                <div className="pt-8 border-t">
                    <PortfolioMediaUpload
                        portfolioId={portfolio.id}
                        initialMedia={portfolio.media}
                        onUploadComplete={(newMedia) => {
                            setPortfolio((prev) => {
                                if (!prev) return null;
                                return {
                                    ...prev,
                                    media: [...(prev.media || []), newMedia],
                                };
                            });
                        }}
                    />
                </div>
            ) : (
                <div className="pt-8 border-t">
                    <h3 className="text-lg font-medium">Portfolio Media</h3>
                    <p className="text-muted-foreground text-sm mt-2">
                        Create your portfolio first to upload images and videos.
                    </p>
                </div>
            )}
        </div>
    );
}
