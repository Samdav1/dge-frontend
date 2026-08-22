import FallbackImage from "@/components/ui/FallbackImage";
import { LandingSearchBar } from "./LandingSearchBar";

export function HeroSection() {
    return (
        <section className="py-4 md:py-10">
            <div className="container mx-auto px-2 md:px-8 max-w-[1600px]">
                <div className="relative rounded-3xl md:rounded-[2.5rem] min-h-[500px] md:min-h-[600px] flex items-center justify-center shadow-2xl">

                    {/* Background Image & Overlay Container */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl md:rounded-[2.5rem] overflow-hidden">
                        <FallbackImage
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                            alt="Workspace"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />

                        {/* Overlays */}
                        <div className="absolute inset-0 bg-black/50 mix-blend-multiply z-10" />
                        <div className="absolute inset-0 bg-[#C69C2E]/20 mix-blend-overlay z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />
                    </div>

                    {/* Content */}
                    <div className="relative z-20 text-center text-white px-2 sm:px-4 md:px-6 max-w-5xl mx-auto py-8 sm:py-12 w-full">
                        <h1 className="text-xl sm:text-3xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-snug sm:leading-[1.1] break-words text-balance px-1">
                            One Ecosystem.<br className="hidden md:block" /> Infinite Possibilities.<br className="hidden md:block" /> <span style={{ color: '#C69C2E' }}>Absolute Trust.</span>
                        </h1>

                        <p className="text-xs sm:text-base md:text-xl text-gray-100 mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto font-light tracking-wide px-1 leading-relaxed">
                            From skilled freelancers and local professionals to reliable rides, connect, negotiate, and transact with peace of mind. Every payment is Escrow-protected until you're 100% satisfied.
                        </p>

                        <LandingSearchBar />
                    </div>
                </div>
            </div>
        </section>
    );
}

