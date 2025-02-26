import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressShort from '../components/AddressShort';
import Icon from '../components/icon/icon.component';
import WalletModal from '../components/WalletModal';
import { LeaderboardService } from '../services/leaderboard.service';
import { PlayerHistory } from '../types/user.interface';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { UserService } from '../services/user.service';
import { IconName } from '../components/icon/iconPack';

const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const ProfilePage: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [playerHistory, setPlayerHistory] = useState<PlayerHistory[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [pdaBalance, setPdaBalance] = useState<number>(0);

  const fetchPlayerHistory = useCallback(async () => {
    if (!publicKey) return;
    try {
      const history = await LeaderboardService.getPlayerHistory(100); // Get more history for stats
      setPlayerHistory(history);
    } catch (error) {
      console.error('Error fetching player history:', error);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchPlayerHistory();
  }, [fetchPlayerHistory]);

  // Generate stats from player history
  const stats = useMemo(() => {
    const totalGames = playerHistory.length;
    const wins = playerHistory.filter(game => game.winnings > 0).length;
    const losses = totalGames - wins;
    const winRate = totalGames ? Math.round((wins / totalGames) * 100) : 0;
    const lossRate = totalGames ? Math.round((losses / totalGames) * 100) : 0;

    return {
      totalGames,
      wins,
      losses,
      winRate,
      lossRate,
      totalWinnings: playerHistory.reduce((sum, game) => sum + game.winnings, 0),
      totalWagered: playerHistory.reduce((sum, game) => sum + game.buyInAmount, 0),
    };
  }, [playerHistory]);

  // Get recent games (last 10)
  const recentGames = playerHistory.slice(0, 10);

  const handleWalletOperationSuccess = useCallback(() => {
    // Mock operation complete - no state updates needed
  }, []);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Replace the direct access with a helper function
  // const getLatestHistory = () => {
  //   if (!playerHistory.length) return null;
  //   return playerHistory[playerHistory.length - 1];
  // };

  // Add this useEffect for wallet balance
  useEffect(() => {
    let isMounted = true;

    const getBalance = async () => {
      if (!publicKey) return;
      try {
        const balance = await connection.getBalance(publicKey);
        if (isMounted) setWalletBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    if (publicKey) {
      getBalance();
      const id = connection.onAccountChange(publicKey, () => {
        getBalance();
      });
      return () => {
        isMounted = false;
        connection.removeAccountChangeListener(id);
      };
    }
  }, [connection, publicKey]);

  // Add this for PDA balance
  const fetchPdaBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const balance = await UserService.getWalletBalance();
      setPdaBalance(Number(balance.balance));
    } catch (error) {
      console.error('Error fetching PDA balance:', error);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchPdaBalance();
  }, [fetchPdaBalance]);

  // Add this near the other useMemo calculations
  const achievements = useMemo(() => {
    return {
      firstWin: {
        title: "First Win",
        description: "Won your first game",
        icon: "star" as IconName,
        color: "primary",
        isUnlocked: stats.wins > 0
      },
      highRoller: {
        title: "High Roller",
        description: "Bet 100+ SOL in total",
        icon: "crown" as IconName,
        color: "secondary",
        isUnlocked: stats.totalWagered >= 100
      },
      luckyStreak: {
        title: "Lucky Streak",
        description: "Won 5 games in a row",
        icon: "chart" as IconName,
        color: "success",
        isUnlocked: playerHistory.some((_, index) => 
          playerHistory.slice(index, index + 5).length === 5 && 
          playerHistory.slice(index, index + 5).every(game => game.winnings > 0)
        )
      },
      veteran: {
        title: "Veteran",
        description: "Played 100+ games",
        icon: "game" as IconName,
        color: "error",
        isUnlocked: stats.totalGames >= 100
      }
    };
  }, [playerHistory, stats]);

  // Replace the achievements section with this updated version
  const renderAchievements = () => (
    <div className="bg-base-200 rounded-3xl p-6 space-y-6">
      <h2 className="text-2xl font-bold">Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(achievements).map(([key, achievement]) => (
          <div 
            key={key}
            className={`relative bg-base-100 p-4 rounded-xl text-center space-y-2 transition-all duration-300 ${
              achievement.isUnlocked 
                ? 'bg-gradient-to-br from-base-100 to-base-200 shadow-lg border border-base-300' 
                : 'bg-opacity-50'
            }`}
          >
            {achievement.isUnlocked && (
              <div className="absolute -top-2 -right-2">
                <div className="badge badge-primary badge-sm">Unlocked</div>
              </div>
            )}
            <div className={`
              w-16 h-16 mx-auto rounded-full 
              ${achievement.isUnlocked 
                ? `bg-gradient-to-br from-${achievement.color} to-${achievement.color}/60 shadow-lg shadow-${achievement.color}/20` 
                : 'bg-base-200'
              } 
              flex items-center justify-center transition-all duration-300
            `}>
              <Icon 
                name={achievement.icon} 
                className={`text-3xl ${
                  achievement.isUnlocked 
                    ? 'text-base-100' 
                    : 'text-base-content/40'
                }`} 
              />
            </div>
            <h3 className={`font-bold ${
              achievement.isUnlocked ? `text-${achievement.color}` : 'text-base-content/60'
            }`}>
              {achievement.title}
            </h3>
            <p className="text-sm text-base-content/60">{achievement.description}</p>
            {!achievement.isUnlocked && (
              <div className="badge badge-ghost badge-sm">Locked</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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

  const renderRecentActivity = () => (
    <div className="bg-base-200 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="history" className="text-primary" />
          Recently Played
        </h2>
      </div>

      <div className="overflow-x-auto">
        {recentGames.length > 0 ? (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Time</th>
                <th>Hand</th>
                <th>Bet</th>
                <th>Risk</th>
                <th>Result</th>
                <th>Net Win</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game, index) => (
                <tr key={index} className="hover">
                  <td className="text-sm text-base-content/70">
                    {getRelativeTime(game.timestamp)}
                    <div className="text-xs opacity-50">
                      {new Date(game.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-ghost">{game.handType}</span>
                  </td>
                  <td>{game.buyInAmount.toFixed(3)} SOL</td>
                  <td>{game.risk}x</td>
                  <td>
                    <span className={`badge ${game.winnings > 0 ? 'badge-success' : 'badge-error'}`}>
                      {game.winnings > 0 ? 'Won' : 'Lost'}
                    </span>
                  </td>
                  <td className={game.winnings > 0 ? 'text-success' : 'text-error'}>
                    {game.winnings > 0 ? '+' : ''}{game.winnings.toFixed(3)} SOL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <Icon name="game" className="text-4xl text-base-content/20 mx-auto mb-2" />
            <p className="text-base-content/60">No games played yet</p>
            <button onClick={() => navigate('/game')} className="btn btn-primary btn-sm mt-4">
              Play Now
            </button>
          </div>
        )}
      </div>
    </div>
  );

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
                <div className="stat-value text-primary">
                  {(walletBalance || 0).toFixed(4)} SOL
                </div>
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
            <div className="stat-value text-success">
              {pdaBalance.toFixed(4)} SOL
            </div>
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
            <div className="stat-figure text-success">
              <Icon name="cup" className="text-3xl" />
            </div>
            <div className="stat-title">Win Rate</div>
            <div className="stat-value text-success">{stats.winRate}%</div>
            <div className="stat-desc">{stats.wins} wins</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-error">
              <Icon name="emojiSad" className="text-3xl" />
            </div>
            <div className="stat-title">Loss Rate</div>
            <div className="stat-value text-error">{stats.lossRate}%</div>
            <div className="stat-desc">{stats.losses} losses</div>
          </div>
        </div>

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Replace the static achievements section with the new dynamic one */}
        {renderAchievements()}
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
