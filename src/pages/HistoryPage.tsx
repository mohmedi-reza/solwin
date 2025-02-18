import React, { useState } from 'react';
import Icon from '../components/icon/icon.component';
import { useWallet } from '@solana/wallet-adapter-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  details: string;
  hash: string;
}

type TimeFilterType = '24h' | '7d' | '30d' | 'all';

const HistoryPage: React.FC = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals' | 'bets'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');

  // Mock data - Replace with real data from your backend
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 5.5,
      date: '2024-03-15 14:30',
      status: 'completed',
      details: 'Deposit from Phantom Wallet',
      hash: '5D4tQd...8Ryk',
    },
    {
      id: '2',
      type: 'bet',
      amount: -1.2,
      date: '2024-03-15 14:35',
      status: 'completed',
      details: 'Poker Game Bet',
      hash: '7H9nMs...2Pql',
    },
    {
      id: '3',
      type: 'win',
      amount: 2.4,
      date: '2024-03-15 14:36',
      status: 'completed',
      details: 'Poker Game Win - Royal Flush',
      hash: '3K7vXp...9Wzt',
    },
    {
      id: '4',
      type: 'withdraw',
      amount: -3.0,
      date: '2024-03-15 15:00',
      status: 'pending',
      details: 'Withdrawal to Phantom Wallet',
      hash: '1A4rBc...5Yuj',
    },
  ]);

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

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposits') return tx.type === 'deposit';
    if (activeTab === 'withdrawals') return tx.type === 'withdraw';
    if (activeTab === 'bets') return tx.type === 'bet' || tx.type === 'win';
    return true;
  });

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
          <div className="stat-value text-primary">5.5 SOL</div>
          <div className="stat-desc">↗︎ 2.1 SOL (24h)</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-secondary">
            <Icon name="coin" className="text-3xl" />
          </div>
          <div className="stat-title">Total Withdrawals</div>
          <div className="stat-value text-secondary">3.0 SOL</div>
          <div className="stat-desc">↘︎ 1.0 SOL (24h)</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-success">
            <Icon name="chart" className="text-3xl" />
          </div>
          <div className="stat-title">Net Gaming</div>
          <div className="stat-value text-success">+1.2 SOL</div>
          <div className="stat-desc">↗︎ 0.5 SOL (24h)</div>
        </div>

        <div className="stat bg-base-200 rounded-2xl">
          <div className="stat-figure text-info">
            <Icon name="game" className="text-3xl" />
          </div>
          <div className="stat-title">Total Transactions</div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-desc">↗︎ 12 new (24h)</div>
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
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Details</th>
                <th>Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
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
                  <td>{tx.details}</td>
                  <td>
                    <a 
                      href={`https://solscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      {tx.hash}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
  