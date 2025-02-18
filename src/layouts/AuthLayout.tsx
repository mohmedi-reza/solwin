import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <main className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout; 