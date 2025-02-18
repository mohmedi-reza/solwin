import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Icon from '../components/icon/icon.component';
import AddressShort from '../components/AddressShort';

interface GameHistory {
  date: string;
  type: string;
  result: string;
  amount: number;
  multiplier: number;
}

const ProfilePage: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Mock data - Replace with real data from your backend
  const [stats] = useState({
    totalGames: 156,
    winRate: 62.5,
    biggestWin: 2500,
    totalWagered: 15000,
    netProfit: 3200,
    favoriteGame: 'Poker',
  });

  const [gameHistory] = useState<GameHistory[]>([
    { date: '2024-03-15', type: 'Poker', result: 'Royal Flush', amount: 2500, multiplier: 50 },
    { date: '2024-03-14', type: 'Poker', result: 'Full House', amount: -100, multiplier: 0 },
    { date: '2024-03-14', type: 'Poker', result: 'Two Pair', amount: -50, multiplier: 0 },
    { date: '2024-03-13', type: 'Poker', result: 'Four of a Kind', amount: 800, multiplier: 25 },
  ]);

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

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  return (
    <div className="container mx-auto px-2 py-8 space-y-8">
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
              <div className="stat-value text-primary">{walletBalance?.toFixed(2) || '0'} SOL</div>
              <div className="stat-desc">Updated just now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-primary">
            <Icon name="game" className="text-3xl" />
          </div>
          <div className="stat-title">Total Games</div>
          <div className="stat-value">{stats.totalGames}</div>
          <div className="stat-desc">Lifetime games played</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-secondary">
            <Icon name="chart" className="text-3xl" />
          </div>
          <div className="stat-title">Win Rate</div>
          <div className="stat-value text-secondary">{stats.winRate}%</div>
          <div className="stat-desc">Average success rate</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-success">
            <Icon name="wallet" className="text-3xl" />
          </div>
          <div className="stat-title">Biggest Win</div>
          <div className="stat-value text-success">${stats.biggestWin}</div>
          <div className="stat-desc">Single game record</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-primary">
            <Icon name="coin" className="text-3xl" />
          </div>
          <div className="stat-title">Total Wagered</div>
          <div className="stat-value">${stats.totalWagered}</div>
          <div className="stat-desc">Lifetime bets placed</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-success">
            <Icon name="chart" className="text-3xl" />
          </div>
          <div className="stat-title">Net Profit</div>
          <div className="stat-value text-success">${stats.netProfit}</div>
          <div className="stat-desc">Total earnings</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-secondary">
            <Icon name="star" className="text-3xl" />
          </div>
          <div className="stat-title">Favorite Game</div>
          <div className="stat-value text-secondary">{stats.favoriteGame}</div>
          <div className="stat-desc">Most played game</div>
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
              {gameHistory.map((game, index) => (
                <tr key={index}>
                  <td>{game.date}</td>
                  <td>{game.type}</td>
                  <td>
                    <span className={`badge text-nowrap text-xs ${
                      game.amount > 0 ? 'badge-success' : 'badge-error'
                    } gap-1`}>
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
  );
};

export default ProfilePage;
  