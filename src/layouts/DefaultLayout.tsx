import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Icon from '../components/icon/icon.component';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import AddressShort from '../components/AddressShort';

const DefaultLayout: React.FC = () => {
    const { wallet, disconnect, publicKey } = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const [copied, setCopied] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const getBalance = async () => {
            if (publicKey) {
                try {
                    const balance = await connection.getBalance(publicKey);
                    if (isMounted) {
                        setBalance(balance / LAMPORTS_PER_SOL);
                    }
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            } else {
                setBalance(null);
            }
        };

        getBalance();
        // Optional: Setup balance auto-refresh
        const intervalId = setInterval(getBalance, 20000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [connection, publicKey]);

    const copyAddress = async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isActiveRoute = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/game';
        }
        return location.pathname === path;
    };

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
                            <Link 
                                to="/" 
                                className={`btn btn-ghost gap-2 ${isActiveRoute('/') ? 'btn-active text-primary' : 'text-base-content/70'}`}
                            >
                                <Icon name="game" className="text-lg" />
                                <span>Games</span>
                            </Link>
                            <Link 
                                to="/history" 
                                className={`btn btn-ghost gap-2 ${isActiveRoute('/history') ? 'btn-active text-primary' : 'text-base-content/70'}`}
                            >
                                <Icon name="history" className="text-lg" />
                                <span>History</span>
                            </Link>
                            <Link 
                                to="/me" 
                                className={`btn btn-ghost gap-2 ${isActiveRoute('/me') ? 'btn-active text-primary' : 'text-base-content/70'}`}
                            >
                                <Icon name="user" className="text-lg" />
                                <span>Profile</span>
                            </Link>
                        </nav>

                        {/* Actions - Responsive */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {balance !== null && (
                                <div className="hidden sm:flex items-center gap-2 text-base-content/70">
                                    <Icon name="coin" className="text-primary text-lg" />
                                    <span>{balance.toFixed(2)} SOL</span>
                                </div>
                            )}
                            <div className="dropdown dropdown-end">
                                <button
                                    onClick={() => !wallet && setVisible(true)}
                                    className="btn relative btn-primary btn-sm sm:btn-md normal-case"
                                >
                                    {!wallet ? (
                                        <>
                                            <Icon name="wallet" className="text-lg sm:hidden" />
                                            <span className="hidden sm:inline">Connect Wallet</span>
                                            <span className="animate-ping -right-1 -top-1 absolute inline-flex status status-error size-2"></span>

                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Icon name="wallet" className="text-lg" />
                                            <span className="hidden sm:inline">
                                                <AddressShort address={publicKey?.toBase58()||"-"} />
                                            </span>
                                        </div>
                                    )}
                                </button>

                                {wallet && (
                                    <ul className="dropdown-content menu p-2 mt-2 shadow-lg bg-base-200 rounded-box w-52">
                                        <li>
                                            <button onClick={copyAddress} className="flex items-center gap-2">
                                                <Icon name="copy" className="text-lg" />
                                                {copied ? 'Copied' : 'Copy Address'}
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => setVisible(true)} className="flex items-center gap-2">
                                                <Icon name="refresh" className="text-lg" />
                                                Change Wallet
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={disconnect} className="flex items-center gap-2 text-error">
                                                <Icon name="logout" className="text-lg" />
                                                Disconnect
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Menu */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-content/10">
                <div className="flex justify-around p-2 py-4">
                    <Link 
                        to="/" 
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                            isActiveRoute('/') ? 'bg-primary/10 text-primary' : 'text-base-content/70'
                        }`}
                    >
                        <Icon name="game" className="text-xl" />
                        <span className="text-xs">Games</span>
                    </Link>
                    <Link 
                        to="/history" 
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                            isActiveRoute('/history') ? 'bg-primary/10 text-primary' : 'text-base-content/70'
                        }`}
                    >
                        <Icon name="history" className="text-xl" />
                        <span className="text-xs">History</span>
                    </Link>
                    <Link 
                        to="/me" 
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                            isActiveRoute('/me') ? 'bg-primary/10 text-primary' : 'text-base-content/70'
                        }`}
                    >
                        <Icon name="user" className="text-xl" />
                        <span className="text-xs">Profile</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:py-6 lg:py-8 min-h-[calc(100vh-4rem)]">
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