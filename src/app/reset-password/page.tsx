"use client";

import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { ResetPasswordSuccessContent } from "@/features/auth/components/ResetPasswordSuccessContent";
import { ResetPasswordFailureContent } from "@/features/auth/components/ResetPasswordFailureContent";
import { Suspense, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
        text: "Connecting clients in need to freelancers who deliver"
    },
    {
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop",
        text: "Work from anywhere, anytime with our secure platform"
    },
    {
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
        text: "Join thousands of professionals growing their business"
    }
];

type ViewState = "form" | "success" | "failure";

export default function ResetPasswordPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [viewState, setViewState] = useState<ViewState>("form");

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSuccess = () => {
        setViewState("success");
    };

    const handleFailure = () => {
        setViewState("failure");
    };

    const handleRetry = () => {
        setViewState("form");
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Image Slider (Desktop only) */}
            <div className="hidden lg:block lg:w-1/2 relative p-6">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative bg-black">
                    {SLIDES.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <img
                                src={slide.image}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                    ))}

                    {/* Text Overlay */}
                    <div className="absolute bottom-12 left-12 text-white max-w-md z-10">
                        <h2 className="text-3xl font-medium mb-4 transition-all duration-500">
                            {SLIDES[currentSlide].text}
                        </h2>
                        <div className="flex gap-1">
                            {SLIDES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Content */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
                {viewState === "form" && (
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center space-y-3 p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading password reset...</p>
                        </div>
                    }>
                        <ResetPasswordForm onSuccess={handleSuccess} onFailure={handleFailure} />
                    </Suspense>
                )}
                {viewState === "success" && (
                    <ResetPasswordSuccessContent />
                )}
                {viewState === "failure" && (
                    <ResetPasswordFailureContent onRetry={handleRetry} />
                )}
            </div>
        </div>
    );
}
