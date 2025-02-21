import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import Icon from '../components/icon/icon.component';
import { UserService } from '../services/user.service';
import { UserProfile } from '../types/user.interface';

type TimeFilterType = '24h' | '7d' | '30d' | 'all';

const HistoryPage: React.FC = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals' | 'bets'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return;
      setIsLoading(true);
      try {
        const user = await UserService.getProfile();
        setUserProfile(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [publicKey]);

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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const transactions = userProfile?.transactions || [];
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposits') return tx.type === 'deposit';
    if (activeTab === 'withdrawals') return tx.type === 'withdraw';
    if (activeTab === 'bets') return tx.type === 'bet' || tx.type === 'win';
    return true;
  });

  // Calculate stats
  const stats = {
    totalDeposits: transactions
      .filter(tx => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0),
    totalWithdrawals: transactions
      .filter(tx => tx.type === 'withdraw')
      .reduce((sum, tx) => sum + tx.amount, 0),
    netGaming: transactions
      .filter(tx => tx.type === 'win' || tx.type === 'bet')
      .reduce((sum, tx) => sum + tx.amount, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        
        <div className="flex gap-4">
          {/* Time Filter */}
          <select 
            className="select select-bordered"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilterType)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Export Button */}
          <button className="btn btn-outline gap-2">
            <Icon name="documentDownload" className="text-lg" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-primary">
            <Icon name="wallet" className="text-3xl" />
          </div>
          <div className="stat-title">Total Deposits</div>
          <div className="stat-value text-primary">{stats.totalDeposits.toFixed(2)} SOL</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-secondary">
            <Icon name="coin" className="text-3xl" />
          </div>
          <div className="stat-title">Total Withdrawals</div>
          <div className="stat-value text-secondary">{stats.totalWithdrawals.toFixed(2)} SOL</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-success">
            <Icon name="chart" className="text-3xl" />
          </div>
          <div className="stat-title">Net Gaming</div>
          <div className="stat-value text-success">{stats.netGaming.toFixed(2)} SOL</div>
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
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
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
                          href={`https://solscan.io/tx/${tx.txHash}`}
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
  );
};

export default HistoryPage;
  