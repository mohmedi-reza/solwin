import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Toolbar from '../components/common/Toolbar';

const DefaultLayout: React.FC = () => {

    return (
        <div className="min-h-screen flex flex-col">
            <Toolbar />

            <main className="flex-1 container mx-auto px-6 py-8">
                <Outlet />
            </main>

            <footer className="hidden md:block bg-base-200 border-t border-base-content/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-base-content/60">
                            © 2024 BeStuidos. All rights reserved.
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DefaultLayout;
