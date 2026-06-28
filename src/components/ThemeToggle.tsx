"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);
    const { theme, setTheme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-gray-400 dark:text-gray-500 w-full opacity-50 cursor-not-allowed"
                disabled
            >
                <div className="relative w-5 h-5 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-[#C69C2E]" />
                </div>
                <span>Loading Theme...</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white w-full cursor-pointer"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun className="absolute w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0 text-[#C69C2E]" />
                <Moon className="absolute w-5 h-5 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100 text-[#C69C2E]" />
            </div>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
    );
}
