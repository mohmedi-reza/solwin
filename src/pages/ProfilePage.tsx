import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useCallback, useEffect, useState } from 'react';
import AddressShort from '../components/AddressShort';
import Icon from '../components/icon/icon.component';
import WalletModal from '../components/WalletModal';
import { UserService } from '../services/user.service';
import { UserProfile } from '../types/user.interface';
import { BalanceCacheService } from '../services/balanceCache.service';

const ProfilePage: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [copied, setCopied] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return;
      setIsLoading(true);
      try {
        console.log("Fetching user profile...");
        const user = await UserService.getProfile();
        console.log("User profile response:", user);
        setUserProfile(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [publicKey]);

  // Add back wallet balance effect
  useEffect(() => {
    const getBalance = async () => {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    getBalance();
    const intervalId = setInterval(getBalance, 20000);
    return () => clearInterval(intervalId);
  }, [connection, publicKey]);

  // Add effect to listen for balance updates
  useEffect(() => {
    const unsubscribe = BalanceCacheService.subscribe(async () => {
      if (publicKey) {
        try {
          const user = await UserService.getProfile();
          setUserProfile(user);
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [publicKey]);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletOperationSuccess = useCallback(async () => {
    if (publicKey) {
      try {
        // Fetch updated user profile (includes transactions)
        const user = await UserService.getProfile();
        setUserProfile(user);

        // Update wallet balance
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / LAMPORTS_PER_SOL);

        // Update cache
        BalanceCacheService.setBalance(Number(user.balance.pdaBalance));
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="wallet" className="text-6xl text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-base-content/60">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const stats = userProfile?.stats ?? {
    totalGames: 0,
    winRate: 0,
    highestWin: 0,
    totalWagered: 0,
    netProfit: 0,
    favoriteGame: 'None'
  };

  const recentGames = userProfile?.gameHistory.slice(0, 4).map(game => ({
    date: new Date(game.startedAt).toISOString().split('T')[0],
    type: game.gameType,
    result: game.result.toString(),
    amount: game.profit,
    multiplier: game.result
  })) ?? [];

  return (
    <>
      <div className="container mx-auto py-8 space-y-8">
        {/* Profile Header */}
        <div className="relative bg-base-200 rounded-3xl p-6 md:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
          <div className="absolute inset-0 bg-[url('/assets/pattern.png')] opacity-5"></div>

          <div className="relative flex flex-col md:flex-row gap-6 items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center">
                <Icon name="user" className="text-4xl text-primary" />
              </div>
            </div>

            <div className="text-center md:text-left">
              <span className="text-2xl w-20 font-bold mb-2">
                Player #{publicKey.toBase58().slice(-4)}
              </span>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <span className="bg-base-300 px-3 py-1 rounded-lg text-sm">
                  <AddressShort address={publicKey.toBase58()} length={6} />
                </span>
                <button
                  onClick={copyAddress}
                  className="btn btn-sm btn-ghost gap-2"
                >
                  <Icon name="copy" className="text-lg" />
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>

            <div className="stats bg-base-100 shadow ms-0 md:ms-auto">
              <div className="stat">
                <div className="stat-title">Wallet Balance</div>
                <div className="stat-value text-primary">{walletBalance?.toFixed(4) || '0'} SOL</div>
                <div className="stat-desc">Updated just now</div>
                <button
                  className="btn btn-primary mt-4 relative"
                  onClick={() => setIsWalletModalOpen(true)}
                >
                  <span className='status status-error size-2 animate-ping'></span>
                  Deposit To Games
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-accent">
              <Icon name="coin" className="text-3xl" />
            </div>
            <div className="stat-title">PDA Balance</div>
            <div className="stat-value text-success">{userProfile?.balance.pdaBalance || '0'} <span className='text-sm text-base-content'>SOL</span></div>
            <div className="stat-desc">Your game balance</div>
            <button
              className="btn btn-primary mt-4 relative"
              onClick={() => setIsWalletModalOpen(true)}
            >
              Manage Funds
            </button>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-accent">
              <Icon name="chart" className="text-3xl" />
            </div>
            <div className="stat-title">Total Games</div>
            <div className="stat-value">{stats.totalGames}</div>
            <div className="stat-desc">Lifetime games played</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-accent">
              <Icon name="game" className="text-3xl" />
            </div>
            <div className="stat-title">Win Rate</div>
            <div className="stat-value ">{stats.winRate}%</div>
            <div className="stat-desc">Average success rate</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-accent">
              <Icon name="game" className="text-3xl" />
            </div>
            <div className="stat-title">Win Rate</div>
            <div className="stat-value ">{stats.winRate}%</div>
            <div className="stat-desc">Average success rate</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-base-200 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <button className="btn btn-ghost btn-sm gap-2">
              <Icon name="history" className="text-lg" />
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentGames.length > 0 ? (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Game</th>
                    <th>Result</th>
                    <th>Amount</th>
                    <th>Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGames.map((game, index) => (
                    <tr key={index}>
                      <td>{game.date}</td>
                      <td>{game.type}</td>
                      <td>
                        <span className={`badge text-nowrap text-xs ${game.amount > 0 ? 'badge-success' : 'badge-error'} gap-1`}>
                          {game.result}
                        </span>
                      </td>
                      <td className={game.amount > 0 ? 'text-success' : 'text-error'}>
                        {game.amount > 0 ? '+' : ''}{game.amount}$
                      </td>
                      <td>{game.multiplier}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <Icon name="game" className="text-4xl text-base-content/20 mx-auto mb-2" />
                <p className="text-base-content/60">No games played yet</p>
                <button className="btn btn-primary btn-sm mt-4">Play Now</button>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-base-200 rounded-3xl p-6 space-y-6">
          <h2 className="text-2xl font-bold">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-base-100 p-4 rounded-xl text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="star" className="text-3xl text-primary" />
              </div>
              <h3 className="font-bold">First Win</h3>
              <p className="text-sm text-base-content/60">Won your first game</p>
            </div>
            <div className="bg-base-100 p-4 rounded-xl text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
                <Icon name="crown" className="text-3xl text-secondary" />
              </div>
              <h3 className="font-bold">High Roller</h3>
              <p className="text-sm text-base-content/60">Bet 100+ SOL in total</p>
            </div>
            <div className="bg-base-100 p-4 rounded-xl text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <Icon name="chart" className="text-3xl text-success" />
              </div>
              <h3 className="font-bold">Lucky Streak</h3>
              <p className="text-sm text-base-content/60">Won 5 games in a row</p>
            </div>
            <div className="bg-base-100 p-4 rounded-xl text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-error/20 flex items-center justify-center">
                <Icon name="game" className="text-3xl text-error" />
              </div>
              <h3 className="font-bold">Veteran</h3>
              <p className="text-sm text-base-content/60">Played 100+ games</p>
            </div>
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletBalance={walletBalance || 0}
        onSuccess={handleWalletOperationSuccess}
      />
    </>
  );
};

export default ProfilePage;
