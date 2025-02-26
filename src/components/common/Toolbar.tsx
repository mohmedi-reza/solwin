import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AxiosError } from 'axios';
import bs58 from 'bs58';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthService, AuthState } from '../../services/auth.service';
import { UserService, WalletBalanceResponse } from '../../services/user.service';
import AddressShort from '../AddressShort';
import Icon from '../icon/icon.component';
import { IconName } from '../icon/iconPack';

// Add new type for balance display
type BalanceDisplay = 'pda' | 'wallet';

const Toolbar: React.FC = () => {
    const location = useLocation();
    const [selectedBalance, setSelectedBalance] = useState<BalanceDisplay>('pda');
    const { wallet, disconnect, publicKey, signMessage } = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const [copied, setCopied] = useState(false);
    const [balance, setBalance] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [authState, setAuthState] = useState<AuthState>('unauthenticated');
    const [walletBalance, setWalletBalance] = useState<WalletBalanceResponse | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);

    const fetchWalletBalance = useCallback(async () => {
        if (!AuthService.isAuthenticated() || !wallet) return;

        setIsBalanceLoading(true);
        try {
            // Cache invalid or empty, fetch fresh balance
            const balance = await UserService.getWalletBalance();
            setWalletBalance(balance);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        } finally {
            setIsBalanceLoading(false);
        }
    }, [wallet]);

    const handleLogin = useCallback(async () => {
        if (!publicKey || !signMessage || authState === 'authenticating') return;

        setAuthLoading(true);
        AuthService.setAuthState('authenticating');
        setAuthState('authenticating');

        try {
            // Get nonce and message from server
            const { nonce } = await AuthService.getNonce(publicKey.toBase58());

            if (!nonce) {
                throw new Error('Failed to get nonce from server');
            }

            // Create the message to sign
            const message = `Please sign this nonce to authenticate: ${nonce}`;
            const messageBytes = new TextEncoder().encode(message);
            const signature = await signMessage(messageBytes);
            const signatureBase58 = bs58.encode(signature);

            const success = await AuthService.login(
                publicKey.toBase58(),
                signatureBase58
            );

            if (success) {
                setAuthState('authenticated');
                toast.success('Successfully authenticated!');
                await fetchWalletBalance();
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            setAuthState('unauthenticated');
            console.error('Auth error:', error);
            const axiosError = error as AxiosError<{ error: string }>;
            const errorMessage = axiosError?.response?.data?.error ||
                (error instanceof Error ? error.message : 'Authentication failed. Please try again.');
            toast.error(errorMessage);
            AuthService.clearTokens();
        } finally {
            setAuthLoading(false);
        }
    }, [publicKey, signMessage, authState, fetchWalletBalance]);

    useEffect(() => {
        let isMounted = true;

        const fetchBalance = async () => {
            if (!publicKey || !wallet) return;
            try {
                const balance = await connection.getBalance(publicKey);
                if (isMounted) setBalance(balance.toString());
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };

        if (publicKey && wallet) {
            fetchBalance();
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
    }, [publicKey, connection, wallet]);

    useEffect(() => {
        const authState = AuthService.getAuthState();
        setAuthState(authState);
    }, []);

    useEffect(() => {
        const shouldAttemptLogin =
            wallet &&
            publicKey &&
            !AuthService.isAuthenticated() &&
            !authLoading &&
            authState === 'unauthenticated';

        if (shouldAttemptLogin) {
            handleLogin();
        }
    }, [wallet, publicKey, authLoading, authState, handleLogin]);

    useEffect(() => {
        // Initial fetch
        fetchWalletBalance();

        // Subscribe to balance updates
    }, [fetchWalletBalance]);

    const handleDisconnect = useCallback(async () => {
        // First logout from backend
        await AuthService.logout();
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        // Disconnect wallet
        disconnect();
        // Reset states
        setAuthState('unauthenticated');
        setBalance(null);
        setWalletBalance(null);
    }, [disconnect]);

    const copyAddress = useCallback(() => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [publicKey]);

    const isActiveRoute = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname.startsWith('/game');
        }
        return location.pathname.startsWith(path);
    };

    const getBalanceDisplay = () => {
        if (selectedBalance === 'pda' && walletBalance?.balance !== undefined) {
            return {
                icon: "wallet",
                iconClass: "text-success",
                value: walletBalance.balance,
                label: "Game Balance"
            };
        }
        return {
            icon: "coin",
            iconClass: "text-primary",
            value: balance,
            label: "Wallet Balance"
        };
    };

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
                <div className="container mx-auto px-4 h-16">
                    <div className="flex items-center justify-between h-full">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Icon name="solana" className="text-4xl text-primary" />
                            <span className="font-bold text-xl p">SolWin</span>
                        </Link>

                        {/* Navigation - Hide on mobile */}
                        <nav className="hidden md:flex items-center gap-6">
                            {[
                                { path: '/', icon: 'game', label: 'Games' },
                                { path: '/history', icon: 'history', label: 'History' },
                                { path: '/me', icon: 'user', label: 'Profile' },
                            ].map(({ path, icon, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`nav-link flex items-center gap-1 transition-colors duration-200 hover:text-primary ${isActiveRoute(path)
                                        ? 'text-primary font-medium'
                                        : 'text-base-content/70'
                                        }`}
                                >
                                    <Icon name={icon as IconName} className="text-lg" />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Actions - Responsive */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Balance Dropdown */}
                            {(balance !== null || walletBalance?.balance !== null) && (
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="bg-base-200 flex gap-1 sm:flex items-center text-base-content/70 hover:text-base-content cursor-pointer p-2 rounded-lg hover:bg-base-200">
                                        <Icon name={getBalanceDisplay().icon as IconName} className={`${getBalanceDisplay().iconClass} text-lg`} />
                                        {isBalanceLoading ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <p className='flex gap-2'>
                                                <span>
                                                    {selectedBalance === 'pda'
                                                        ? Number(walletBalance?.balance ?? '0').toFixed(4)
                                                        : (Number(balance) / LAMPORTS_PER_SOL).toFixed(4)}
                                                </span>
                                                <span>SOL</span>
                                            </p>
                                        )}
                                        <Icon name="arrowSquareDown" className="text-white text-sm opacity-50" />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-fit">
                                        <li className="menu-title">
                                            <span>Select Balance</span>
                                        </li>
                                        {walletBalance?.balance !== undefined && (
                                            <li>
                                                <button
                                                    onClick={() => setSelectedBalance('pda')}
                                                    className={selectedBalance === 'pda' ? 'active' : ''}
                                                >
                                                    <Icon name="wallet" className="text-success" />
                                                    <span className='text-nowrap'>Game Balance:</span>
                                                    <p className="ml-auto flex gap-2">
                                                        <span>{Number(walletBalance.balance).toFixed(4)}</span>
                                                        <span>SOL</span>
                                                    </p>
                                                </button>
                                            </li>
                                        )}
                                        {balance !== null && (
                                            <li>
                                                <button
                                                    onClick={() => setSelectedBalance('wallet')}
                                                    className={selectedBalance === 'wallet' ? 'active' : ''}
                                                >
                                                    <Icon name="coin" className="text-primary" />
                                                    <span className='text-nowrap'>Wallet Balance:</span>
                                                    <span className="ml-auto">
                                                        {(Number(balance) / LAMPORTS_PER_SOL).toFixed(4)} SOL
                                                    </span>
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Wallet Connection Button */}
                            <div className="dropdown dropdown-end">
                                <button
                                    onClick={() => !wallet && setVisible(true)}
                                    className="btn relative btn-primary btn-sm sm:btn-md normal-case"
                                    disabled={authLoading}
                                >
                                    {!wallet ? (
                                        <>
                                            <Icon name="wallet" className="text-lg sm:hidden" />
                                            <span className="hidden sm:inline">
                                                {authLoading ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-xs mr-2"></span>
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    'Connect Wallet'
                                                )}
                                            </span>
                                            {!authLoading && (
                                                <span className="animate-ping -right-1 -top-1 absolute inline-flex status status-error size-2"></span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Icon name="wallet" className="text-lg" />
                                            <span className="hidden sm:inline">
                                                <AddressShort address={publicKey?.toBase58() || '-'} />
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
                                            <button
                                                onClick={handleDisconnect}
                                                className="flex items-center gap-2 text-error"
                                                disabled={authLoading}
                                            >
                                                <Icon name="logout" className="text-lg" />
                                                {authLoading ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-xs mr-2"></span>
                                                        Disconnecting...
                                                    </>
                                                ) : (
                                                    'Disconnect'
                                                )}
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
                    {[
                        { path: '/', icon: 'game', label: 'Games' },
                        { path: '/history', icon: 'history', label: 'History' },
                        { path: '/me', icon: 'user', label: 'Profile' },
                    ].map(({ path, icon, label }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`mobile-nav-link flex items-center gap-1 ${isActiveRoute(path)
                                ? 'text-primary'
                                : 'text-base-content/70'
                                }`}
                        >
                            <Icon name={icon as IconName} className="text-xl" />
                            <span className="text-xs">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Toolbar;
