import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import Toolbar from '../components/common/Toolbar';
import { AuthService, AuthState } from '../services/auth.service';
import { useUserStore } from '../stores/user.store';

const DefaultLayout: React.FC = () => {
    const { wallet, disconnect, publicKey, signMessage } = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const [copied, setCopied] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const { fetchUser, user } = useUserStore();
    const [authState, setAuthState] = useState<AuthState>('unauthenticated');

    useEffect(() => {
        let isMounted = true;

        const fetchBalance = async () => {
            if (!publicKey) return;
            try {
                const balance = await connection.getBalance(publicKey);
                if (isMounted) setBalance(balance / LAMPORTS_PER_SOL);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };

        fetchBalance();
        if (publicKey) {
            const id = connection.onAccountChange(publicKey, () => {
                fetchBalance();
            });

            return () => {
                isMounted = false;
                connection.removeAccountChangeListener(id);
            };
        }
        return () => {
            isMounted = false;
        };
    }, [publicKey, connection]);

    const handleLogin = useCallback(async () => {
        if (!publicKey || !signMessage || authState === 'authenticating') return;
        
        setAuthLoading(true);
        AuthService.setAuthState('authenticating');
        setAuthState('authenticating');

        try {
            const nonce = await AuthService.getNonce(publicKey.toBase58());
            const message = new TextEncoder().encode(nonce);
            const signature = await signMessage(message);
            const base64Signature = Buffer.from(signature).toString('base64');
            
            const success = await AuthService.login(
                publicKey.toBase58(),
                base64Signature,
                nonce
            );
            
            if (success) {
                await fetchUser();
                setAuthState('authenticated');
                toast.success('Successfully authenticated!');
            } else {
                setAuthState('unauthenticated');
                toast.error('Authentication failed');
            }
        } catch (error) {
            setAuthState('unauthenticated');
            console.error('Auth error:', error);
            const axiosError = error as AxiosError<{ error: string; code: string }>;
            toast.error(
                axiosError?.response?.data?.error || 
                'Authentication failed. Please try again.'
            );
            AuthService.clearTokens();
        } finally {
            setAuthLoading(false);
        }
    }, [publicKey, signMessage, fetchUser, authState]);

    useEffect(() => {
        if (publicKey && !AuthService.isAuthenticated() && authState === 'unauthenticated') {
            handleLogin();
        }
    }, [publicKey, handleLogin, authState]);

    const handleDisconnect = useCallback(async () => {
        await AuthService.logout();
        disconnect();
        setAuthState('unauthenticated');
    }, [disconnect]);

    const copyAddress = useCallback(() => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [publicKey]);

    return (
        <div className="min-h-screen flex flex-col">
            <Toolbar
                balance={balance}
                copied={copied}
                copyAddress={copyAddress}
                wallet={wallet}
                publicKey={publicKey}
                disconnect={handleDisconnect}
                setVisible={setVisible}
                authLoading={authLoading}
                userPdaBalance={user?.userPda?.balance ?? null}
            />

            <main className="flex-1 container mx-auto px-4 py-8">
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
