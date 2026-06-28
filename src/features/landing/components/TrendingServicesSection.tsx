"use client";

import Link from "next/link";
import { Droplet, Zap, Brush, Star, ArrowRight, TrendingUp } from "lucide-react";
import FallbackImage from "@/components/ui/FallbackImage";

const TRENDING_SERVICES = [
    {
        id: "plumbing",
        title: "Emergency Plumbing",
        category: "Plumbing",
        rating: 4.9,
        reviews: 1240,
        price: "From ₦50,000",
        icon: Droplet,
        color: "#3B82F6",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "electrical",
        title: "Home Wiring & Electrical",
        category: "Electrical",
        rating: 4.8,
        reviews: 856,
        price: "From ₦65,000",
        icon: Zap,
        color: "#F59E0B",
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop"
    },
    {
        id: "cleaning",
        title: "Deep House Cleaning",
        category: "Cleaning",
        rating: 4.9,
        reviews: 2100,
        price: "From ₦40,000",
        icon: Brush,
        color: "#10B981",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop"
    }
];

export function TrendingServicesSection() {
    return (
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px] relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Trending Now</p>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                            Most Popular <span className="text-muted-foreground">Services</span>
                        </h2>
                    </div>
                    <Link href="/services" className="group hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                        Explore All Services
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {TRENDING_SERVICES.map((service) => (
                        <Link 
                            href={`/services/${service.id}`} 
                            key={service.id}
                            className="group relative flex flex-col rounded-[2rem] overflow-hidden border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                <FallbackImage 
                                    src={service.image} 
                                    alt={service.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Category Badge */}
                                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                                    <service.icon className="w-3.5 h-3.5" style={{ color: service.color }} />
                                    <span className="text-xs font-semibold">{service.category}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-sm font-bold">{service.rating}</span>
                                    <span className="text-sm text-muted-foreground">({service.reviews} reviews)</span>
                                </div>
                                
                                <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                
                                <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-medium mb-0.5">Starting at</span>
                                        <span className="text-lg font-bold">{service.price}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {/* Mobile View All */}
                <div className="mt-10 flex justify-center md:hidden">
                    <Link href="/services" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                        Explore All Services
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
