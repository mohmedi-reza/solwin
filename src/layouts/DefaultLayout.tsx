import React from 'react';
import { Outlet } from 'react-router-dom';
import Icon from '../components/icon/icon.component';

const DefaultLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-base-100">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
                <div className="container mx-auto px-4 h-16">
                    <div className="flex items-center justify-between h-full">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <Icon name="game" className="text-2xl text-primary" />
                            <span className="font-bold text-xl">RocketBet</span>
                        </div>

                        {/* Navigation - Hide on mobile */}
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="/" className="nav-link">Games</a>
                            <a href="/history" className="nav-link">History</a>
                            <a href="/me" className="nav-link">Profile</a>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button className="btn btn-ghost btn-circle md:hidden">
                            <Icon name="menu" className="text-2xl" />
                        </button>

                        {/* Actions - Responsive */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden sm:flex items-center gap-1.5 text-base-content/80">
                                <Icon name="wallet" className="text-lg text-primary" />
                                <span>$1,000</span>
                            </div>
                            
                            <button className="btn btn-primary btn-sm sm:btn-md">
                                <Icon name="wallet" className="text-lg sm:hidden" />
                                <span className="hidden sm:inline">Connect Wallet</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Menu */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-content/10">
                <div className="flex justify-around p-2">
                    <a href="/" className="mobile-nav-link">
                        <Icon name="game" className="text-xl" />
                        <span className="text-xs">Games</span>
                    </a>
                    <a href="/history" className="mobile-nav-link">
                        <Icon name="history" className="text-xl" />
                        <span className="text-xs">History</span>
                    </a>
                    <a href="/me" className="mobile-nav-link">
                        <Icon name="user" className="text-xl" />
                        <span className="text-xs">Profile</span>
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-4 sm:py-6 min-h-[calc(100vh-4rem)]">
                <Outlet />
            </main>

            {/* Footer - Hide on mobile due to bottom navigation */}
            <footer className="hidden md:block bg-base-200 border-t border-base-content/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-base-content/60">
                            © 2024 RocketBet. All rights reserved.
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DefaultLayout; 