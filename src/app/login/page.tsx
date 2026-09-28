"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";
import React, { useState, useEffect } from "react";

const SLIDES = [
    {
        image: "/images/dge_job_listing.jpg",
        text: "Connecting clients in need to freelancers who deliver"
    },
    {
        image: "/images/dge_hero_bg.jpg",
        text: "Work from anywhere, anytime with our secure platform"
    },
    {
        image: "/images/dge_community.jpg",
        text: "Join thousands of professionals growing their business"
    }
];

export default function LoginPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

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

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
                <React.Suspense fallback={<div className="flex items-center justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-[#C69C2E] border-t-transparent rounded-full"></div></div>}>
                    <LoginForm />
                </React.Suspense>
            </div>
        </div>
    );
}
