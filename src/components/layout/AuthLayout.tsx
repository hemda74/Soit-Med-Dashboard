import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                {children}
                <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
                    <div className="relative flex items-center justify-center z-1">
                        {/* Grid Pattern Background */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

                        <div className="flex flex-col items-center max-w-xs">
                            <Link to="/" className="block mb-4">
                                <img
                                    width={231}
                                    height={48}
                                    src="/src/assets/Logo.png"
                                    alt="Soit-Med Logo"
                                    className="h-12 w-auto"
                                />
                            </Link>
                            <p className="text-center text-gray-400 dark:text-white/60">
                                Soit-Med Dashboard - Medical Management System
                            </p>
                        </div>
                    </div>
                </div>
                <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
                    <ThemeToggleButton />
                </div>
            </div>
        </div>
    );
}

