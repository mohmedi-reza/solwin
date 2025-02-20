import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserService } from '../services/userService';
import { UserProfile } from '../types/user';
import Toolbar from '../components/common/Toolbar';
import { AuthService } from '../services/authService';
import { toast } from 'react-toastify';
import { useUserStore } from '../stores/userStore';

const DefaultLayout: React.FC = () => {
    const { wallet, disconnect, publicKey, signMessage } = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const [copied, setCopied] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const { fetchUser } = useUserStore();

    useEffect(() => {
        let isMounted = true;

        const getBalance = async () => {
            if (publicKey) {
                try {
                    const fetchedBalance = await connection.getBalance(publicKey);
                    if (isMounted) setBalance(fetchedBalance / LAMPORTS_PER_SOL);
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            } else {
                setBalance(null);
            }
        };

        getBalance();
        const intervalId = setInterval(getBalance, 20000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [connection, publicKey, userProfile]);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        const initializeUser = async () => {
            if (!publicKey) {
                setUserProfile(null);
                setIsLoading(false);
                return;
            }

            try {
                const user = await UserService.getOrCreateUser(publicKey.toBase58());
                if (isMounted) setUserProfile(user);
            } catch (error) {
                if (isMounted) {
                    console.error('Error initializing user:', error);
                    setError('Failed to load user data. Please try reconnecting your wallet.');
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initializeUser();

        return () => {
            isMounted = false;
        };
    }, [publicKey]);

    const handleAuthenticate = useCallback(async () => {
        if (!publicKey || !signMessage) return;
        
        setAuthLoading(true);
        setError(null);
        
        try {
            const success = await AuthService.login(publicKey, signMessage);
            if (success) {
                await fetchUser();
                toast.success('Successfully authenticated!');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate. Please try again.';
            console.error('Authentication error:', error);
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setAuthLoading(false);
        }
    }, [publicKey, signMessage, fetchUser]);

    const handleDisconnect = useCallback(async () => {
        try {
            setAuthLoading(true);
            await AuthService.logout();
            await disconnect();
            setUserProfile(null);
            toast.success('Wallet disconnected successfully');
        } catch (error) {
            console.error('Disconnect error:', error);
            toast.error('Error disconnecting wallet');
        } finally {
            setAuthLoading(false);
        }
    }, [disconnect]);

    useEffect(() => {
        const handleWalletConnection = async () => {
            if (publicKey && !AuthService.isAuthenticated()) {
                await handleAuthenticate();
            }
        };

        handleWalletConnection();
    }, [publicKey, handleAuthenticate]);

    useEffect(() => {
        // Fetch user data when component mounts
        if (AuthService.isAuthenticated()) {
            fetchUser();
        }
    }, [fetchUser]);

    const copyAddress = async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReconnect = async () => {
        if (wallet) {
            await disconnect();
            setTimeout(() => setVisible(true), 500);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-error mb-4">{error}</p>
                    <button onClick={handleReconnect} className="btn btn-primary">
                        Reconnect Wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            <Toolbar
                balance={balance}
                copied={copied}
                copyAddress={copyAddress}
                wallet={wallet}
                publicKey={publicKey}
                disconnect={handleDisconnect}
                setVisible={setVisible}
                authLoading={authLoading}
            />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:py-6 lg:py-8 min-h-[calc(100vh-4rem)]">
                <Outlet />
            </main>
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
