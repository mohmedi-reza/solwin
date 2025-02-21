import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../icon/icon.component';
import AddressShort from '../AddressShort';
import { IconName } from '../icon/iconPack';

interface ToolbarProps {
    balance: number | null;
    copied: boolean;
    copyAddress: () => void;
    wallet: ReturnType<typeof useWallet>['wallet'];
    publicKey: ReturnType<typeof useWallet>['publicKey'];
    disconnect: ReturnType<typeof useWallet>['disconnect'];
    setVisible: ReturnType<typeof useWalletModal>['setVisible'];
    authLoading: boolean;
    userPdaBalance: number | null;
}

// Add new type for balance display
type BalanceDisplay = 'pda' | 'wallet';

const Toolbar: React.FC<ToolbarProps> = ({
    balance,
    copied,
    copyAddress,
    wallet,
    publicKey,
    disconnect,
    setVisible,
    authLoading,
    userPdaBalance,
}) => {
    const location = useLocation();
    const [selectedBalance, setSelectedBalance] = useState<BalanceDisplay>('pda');

    const isActiveRoute = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname.startsWith('/game');
        }
        return location.pathname.startsWith(path);
    };

    const getBalanceDisplay = () => {
        if (selectedBalance === 'pda' && userPdaBalance !== null) {
            return {
                icon: "wallet",
                iconClass: "text-success",
                value: userPdaBalance,
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
                        <div className="flex items-center gap-2">
                            <Icon name="game" className="text-2xl text-primary" />
                            <span className="font-bold text-xl">RocketBet</span>
                        </div>

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
                            {(balance !== null || userPdaBalance !== null) && (
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="bg-base-200 flex gap-1 sm:flex items-center text-base-content/70 hover:text-base-content cursor-pointer p-2 rounded-lg hover:bg-base-200">
                                        <Icon name={getBalanceDisplay().icon as IconName} className={`${getBalanceDisplay().iconClass} text-lg`} />
                                        <span>{getBalanceDisplay().value?.toFixed(2)} SOL</span>
                                        <Icon name="arrowSquareDown" className="text-white text-sm opacity-50" />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52">
                                        <li className="menu-title">
                                            <span>Select Balance</span>
                                        </li>
                                        {userPdaBalance !== null && (
                                            <li>
                                                <button
                                                    onClick={() => setSelectedBalance('pda')}
                                                    className={selectedBalance === 'pda' ? 'active' : ''}
                                                >
                                                    <Icon name="wallet" className="text-success" />
                                                    Game Balance
                                                    <span className="ml-auto">{userPdaBalance.toFixed(2)} SOL</span>
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
                                                    Wallet Balance
                                                    <span className="ml-auto">{balance.toFixed(2)} SOL</span>
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
