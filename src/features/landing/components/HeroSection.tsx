import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FallbackImage from "@/components/ui/FallbackImage";

export function HeroSection() {
    return (
        <section className="py-4 md:py-10">
            <div className="container mx-auto px-2 md:px-8 max-w-[1600px]">
                <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center shadow-2xl">

                    {/* Background Image & Overlay Container */}
                    <div className="absolute inset-0 w-full h-full">
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
                    <div className="relative z-20 text-center text-white px-4 md:px-6 max-w-5xl mx-auto py-12">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight md:leading-[1.1]">
                            One Ecosystem.<br className="hidden md:block" /> Infinite Possibilities.<br className="hidden md:block" /> <span style={{ color: '#C69C2E' }}>Absolute Trust.</span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-8 md:mb-12 max-w-2xl mx-auto font-light tracking-wide px-2">
                            From skilled freelancers and local professionals to reliable rides, connect, negotiate, and transact with peace of mind. Every payment is Escrow-protected until you're 100% satisfied.
                        </p>

                        <div className="max-w-2xl mx-auto relative px-2 md:px-0">
                            <div className="relative flex items-center group">
                                <Input
                                    type="text"
                                    placeholder="Search for any service"
                                    className="w-full h-14 md:h-16 pl-6 md:pl-8 pr-16 md:pr-20 rounded-xl bg-white text-black border-0 shadow-2xl text-base md:text-lg placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#C69C2E]/50 transition-all"
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-2 top-2 bottom-2 h-10 w-10 md:h-12 md:w-12 rounded-lg bg-[#C69C2E] hover:bg-[#B58B1D] text-white shadow-md transition-transform active:scale-95"
                                >
                                    <Search className="h-5 w-5 md:h-6 md:w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
