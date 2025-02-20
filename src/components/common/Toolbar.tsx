import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../icon/icon.component';
import AddressShort from '../AddressShort';

interface ToolbarProps {
    balance: number | null;
    copied: boolean;
    copyAddress: () => void;
    wallet: ReturnType<typeof useWallet>['wallet'];
    publicKey: ReturnType<typeof useWallet>['publicKey'];
    disconnect: ReturnType<typeof useWallet>['disconnect'];
    setVisible: ReturnType<typeof useWalletModal>['setVisible'];
    authLoading: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
    balance,
    copied,
    copyAddress,
    wallet,
    publicKey,
    disconnect,
    setVisible,
    authLoading,
}) => {
    const location = useLocation();

    const isActiveRoute = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/game';
        }
        return location.pathname === path;
    };

    return (
        <>
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
                            <Link to="/" className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}>
                                <Icon name="game" className="text-lg" />
                                <span>Games</span>
                            </Link>
                            <Link to="/history" className={`nav-link ${isActiveRoute('/history') ? 'active' : ''}`}>
                                <Icon name="history" className="text-lg" />
                                <span>History</span>
                            </Link>
                            <Link to="/me" className={`nav-link ${isActiveRoute('/me') ? 'active' : ''}`}>
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
                                                onClick={disconnect} 
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
                    <Link to="/" className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}>
                        <Icon name="game" className="text-xl" />
                        <span className="text-xs">Games</span>
                    </Link>
                    <Link to="/history" className={`mobile-nav-link ${isActiveRoute('/history') ? 'active' : ''}`}>
                        <Icon name="history" className="text-xl" />
                        <span className="text-xs">History</span>
                    </Link>
                    <Link to="/me" className={`mobile-nav-link ${isActiveRoute('/me') ? 'active' : ''}`}>
                        <Icon name="user" className="text-xl" />
                        <span className="text-xs">Profile</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Toolbar;
