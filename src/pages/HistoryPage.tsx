import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo, useState } from 'react';
import Icon from '../components/icon/icon.component';
import { UserProfile } from '../types/user.interface';
import WalletModal from '../components/WalletModal';

type TimeFilterType = '24h' | '7d' | '30d' | 'all';

interface SortConfig {
  key: 'date' | 'amount' | 'type';
  direction: 'asc' | 'desc';
}

const MOCK_USER_PROFILE: UserProfile = {
  id: '1',
  username: 'Player1',
  avatar: null,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  stats: {
    totalGames: 156,
    wins: 82,
    losses: 74,
    totalBets: 156,
    totalWinnings: 485.8,
    highestWin: 25.5,
    lastGamePlayed: new Date(),
    winRate: 52,
    totalWagered: 450,
    netProfit: 35.8,
    favoriteGame: 'poker',
    gamesPlayed: {
      poker: 100,
      crash: 56
    }
  },
  transactions: [
    {
      id: 'tx1',
      type: 'deposit',
      amount: 10,
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed',
      txHash: '3xYz...7890'
    },
    {
      id: 'tx2',
      type: 'bet',
      amount: -2.5,
      timestamp: new Date(Date.now() - 7200000),
      status: 'completed',
      txHash: '4wVu...1234',
      matchId: 'match1'
    },
    {
      id: 'tx3',
      type: 'win',
      amount: 5,
      timestamp: new Date(Date.now() - 10800000),
      status: 'completed',
      txHash: '5tQr...5678',
      matchId: 'match1'
    },
    {
      id: 'tx4',
      type: 'withdraw',
      amount: -3,
      timestamp: new Date(Date.now() - 86400000),
      status: 'pending',
      txHash: '6sNm...9012'
    }
  ],
  // ... rest of the mock profile data from before
  balance: {
    available: 12.5,
    locked: 0,
    pdaBalance: '12.5',
    totalDeposited: 50,
    totalWithdrawn: 25
  },
  userPda: {
    pdaAddress: 'mock-pda-address',
    rentFee: 0.001,
    balance: '12.5'
  },
  preferences: {
    theme: 'dark',
    soundEnabled: true,
    notifications: true,
    autoExitCrash: false,
    defaultBetAmount: 0.1
  },
  gameHistory: [],
  activeGame: null,
  currentMatch: null
};

const HistoryPage: React.FC = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals' | 'bets'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Use mock data directly
  const userProfile = publicKey ? MOCK_USER_PROFILE : null;
  const transactions = userProfile?.transactions || [];

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    const now = new Date();
    const matchesSearch = searchQuery === '' || 
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery) ||
      tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(tx.timestamp).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply time filter
    const matchesTimeFilter = (() => {
      switch (timeFilter) {
        case '24h':
          return now.getTime() - txDate.getTime() <= 24 * 60 * 60 * 1000;
        case '7d':
          return now.getTime() - txDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case '30d':
          return now.getTime() - txDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    })();

    // Apply type filter
    const matchesTypeFilter = 
      activeTab === 'all' ? true :
      activeTab === 'deposits' ? tx.type === 'deposit' :
      activeTab === 'withdrawals' ? tx.type === 'withdraw' :
      activeTab === 'bets' ? (tx.type === 'bet' || tx.type === 'win') :
      true;

    return matchesSearch && matchesTimeFilter && matchesTypeFilter;
  });

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortConfig.key === 'type') {
        return sortConfig.direction === 'asc' 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
  }, [filteredTransactions, sortConfig]);

  const handleWalletOperationSuccess = () => {
    // No-op since we're using mock data
  };

  if (!publicKey) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="wallet" className="text-6xl text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-base-content/60">Please connect your wallet to view your history</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalDeposits: userProfile?.balance?.totalDeposited || 0,
    totalWithdrawals: userProfile?.balance?.totalWithdrawn || 0,
    netGaming: userProfile?.stats?.netProfit || 0,
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h1 className="text-3xl font-bold">Transaction History</h1>
          
          <div className="flex flex-col w-full md:w-auto md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search transactions..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="select select-bordered w-full md:w-auto"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilterType)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-primary">
              <Icon name="wallet" className="text-3xl" />
            </div>
            <div className="stat-title">Total Deposits</div>
            <div className="stat-value text-primary">{stats.totalDeposits} SOL</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-secondary">
              <Icon name="coin" className="text-3xl" />
            </div>
            <div className="stat-title">Total Withdrawals</div>
            <div className="stat-value text-secondary">{stats.totalWithdrawals} SOL</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-success">
              <Icon name="chart" className="text-3xl" />
            </div>
            <div className="stat-title">Net Gaming</div>
            <div className="stat-value text-success">{stats.netGaming} SOL</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-figure text-info">
              <Icon name="game" className="text-3xl" />
            </div>
            <div className="stat-title">Total Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
        </div>

        {/* Transaction Tabs */}
        <div className="tabs tabs-boxed justify-center">
          <button 
            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Transactions
          </button>
          <button 
            className={`tab ${activeTab === 'deposits' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('deposits')}
          >
            Deposits
          </button>
          <button 
            className={`tab ${activeTab === 'withdrawals' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawals
          </button>
          <button 
            className={`tab ${activeTab === 'bets' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('bets')}
          >
            Gaming
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-base-200 rounded-3xl p-6">
          <div className="overflow-x-auto">
            {filteredTransactions.length > 0 ? (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="cursor-pointer" onClick={() => handleSort('date')}>
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="cursor-pointer" onClick={() => handleSort('type')}>
                      Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="cursor-pointer" onClick={() => handleSort('amount')}>
                      Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Status</th>
                    <th>Transaction Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`badge gap-1 ${
                          tx.type === 'deposit' ? 'badge-primary' :
                          tx.type === 'withdraw' ? 'badge-secondary' :
                          tx.type === 'win' ? 'badge-success' :
                          'badge-error'
                        }`}>
                          <Icon name={
                            tx.type === 'deposit' ? 'wallet' :
                            tx.type === 'withdraw' ? 'coin' :
                            tx.type === 'win' ? 'star' :
                            'game'
                          } className="text-sm" />
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td className={`font-bold ${
                        tx.amount > 0 ? 'text-success' : 'text-error'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} SOL
                      </td>
                      <td>
                        <span className={`badge badge-sm ${
                          tx.status === 'completed' ? 'badge-success' :
                          tx.status === 'pending' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        {tx.txHash && (
                          <a 
                            href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-4)}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <Icon name="transactionMinus" className="text-4xl text-base-content/20 mx-auto mb-2" />
                <p className="text-base-content/60">
                  {activeTab === 'all' ? 'No transactions found' :
                   activeTab === 'deposits' ? 'No deposits yet' :
                   activeTab === 'withdrawals' ? 'No withdrawals yet' :
                   'No gaming transactions yet'}
                </p>
                {activeTab === 'deposits' && (
                  <button className="btn btn-primary btn-sm mt-4">Make a Deposit</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletBalance={Number(userProfile?.balance?.pdaBalance || 0)}
        onSuccess={handleWalletOperationSuccess}
      />
    </>
  );
};

export default HistoryPage;
  