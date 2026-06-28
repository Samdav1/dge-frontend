export function Footer() {
    return (
        <footer className="py-12 bg-black text-white text-sm">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <img src="/DGE logo.png" alt="DGE Logo" className="h-10 w-auto" />
                    <span className="text-gray-400 ml-4">@copyright 2025</span>
                </div>

                <div className="flex items-center gap-6">
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors"><span className="sr-only">Facebook</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors"><span className="sr-only">Instagram</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg></a>
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors"><span className="sr-only">TikTok</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music-2"><circle cx="8" cy="18" r="4" /><path d="M12 18V2l7 4" /></svg></a>
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors"><span className="sr-only">X</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg></a>
                </div>
            </div>
        </footer>
    );
}
