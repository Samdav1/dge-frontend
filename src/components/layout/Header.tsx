import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px] h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Logo */}
                    <Link href="/">
                        <img src="/DGE logo.png" alt="DGE Logo" className="h-10 w-auto" />
                    </Link>
                </div>

                <div className="flex items-center gap-8">
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
                        <Link href="/dashboard/driving" className="hover:text-primary transition-colors">Driving</Link>
                    </nav>

                    <div className="flex gap-4">
                        <Link href="/login">
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 rounded-lg hidden md:flex">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="default" className="bg-primary text-white hover:bg-primary/90 px-8 rounded-lg">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
