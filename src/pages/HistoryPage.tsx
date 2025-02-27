import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo, useState, useEffect } from 'react';
import Icon from '../components/icon/icon.component';
import { useTransactions } from '../hooks/useTransactions';
import { useInView } from 'react-intersection-observer';

type TimeFilterType = '24h' | '7d' | '30d' | 'all';

interface SortConfig {
  key: 'date' | 'amount' | 'type';
  direction: 'asc' | 'desc';
}

const HistoryPage: React.FC = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals' | 'bets'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: transactionPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useTransactions(20);

  // Keep just the transactions data
  const transactions = useMemo(() => 
    transactionPages?.pages.flatMap(page => page.data) || [], 
    [transactionPages?.pages]
  );

  // Add intersection observer for infinite scroll
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    const now = new Date();
    const matchesSearch = searchQuery === '' ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery) ||
      tx.signature.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        activeTab === 'deposits' ? tx.type === 'DEPOSIT' :
          activeTab === 'withdrawals' ? tx.type === 'WITHDRAW' :
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

  const stats = useMemo(() => {
    const deposits = transactions.filter(tx => tx.type === 'DEPOSIT');
    const withdrawals = transactions.filter(tx => tx.type === 'WITHDRAW');

    return {
      // Totals
      totalDeposits: deposits.reduce((sum, tx) => sum + tx.amount, 0),
      totalWithdrawals: Math.abs(withdrawals.reduce((sum, tx) => sum + tx.amount, 0)),
      
      // Counts
      depositCount: deposits.length,
      withdrawalCount: withdrawals.length,
      
      // Averages
      avgDeposit: deposits.length ? deposits.reduce((sum, tx) => sum + tx.amount, 0) / deposits.length : 0,
      avgWithdrawal: withdrawals.length ? Math.abs(withdrawals.reduce((sum, tx) => sum + tx.amount, 0)) / withdrawals.length : 0,
      
      // Largest transactions
      largestDeposit: deposits.length ? Math.max(...deposits.map(tx => tx.amount)) : 0,
      largestWithdrawal: withdrawals.length ? Math.abs(Math.min(...withdrawals.map(tx => tx.amount))) : 0,
      
      // Total fees
      totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
      
      // Success rate
      successRate: transactions.length ? 
        (transactions.filter(tx => tx.status === 'success').length / transactions.length) * 100 : 0
    };
  }, [transactions]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Total Deposits</div>
            <div className="stat-value text-primary">{stats.totalDeposits.toFixed(4)} SOL</div>
            <div className="stat-desc">Count: {stats.depositCount}</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Total Withdrawals</div>
            <div className="stat-value text-secondary">{stats.totalWithdrawals.toFixed(4)} SOL</div>
            <div className="stat-desc">Count: {stats.withdrawalCount}</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Average Transaction</div>
            <div className="stat-value">
              <div className="text-sm">
                <span className='text-primary'> D:</span> {stats.avgDeposit.toFixed(4)} SOL
              </div>
              <div className="text-sm">
                <span className='text-secondary'> W:</span> {stats.avgWithdrawal.toFixed(4)} SOL
              </div>
            </div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Largest Transaction</div>
            <div className="stat-value">
              <div className="text-sm">
               <span className='text-primary'> D:</span> {stats.largestDeposit.toFixed(4)} SOL
              </div>
              <div className="text-sm">
                <span className='text-secondary'> W:</span> {stats.largestWithdrawal.toFixed(4)} SOL
              </div>
            </div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Total Fees</div>
            <div className="stat-value text-accent">{stats.totalFees.toFixed(6)} SOL</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Success Rate</div>
            <div className="stat-value text-success">{stats.successRate.toFixed(1)}%</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
            <div className="stat-title">Net Balance</div>
            <div className={`stat-value ${stats.totalDeposits - stats.totalWithdrawals > 0 ? 'text-success' : 'text-error'}`}>
              {(stats.totalDeposits - stats.totalWithdrawals).toFixed(4)} SOL
            </div>
          </div>

          <div className="stat bg-base-200 rounded-2xl">
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
            {isLoading ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
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
                    <tr key={tx.signature}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-outline badge-sm w-18 ${tx.type === 'DEPOSIT' ? 'badge-primary' :
                            tx.type === 'WITHDRAW' ? 'badge-secondary' :
                              'badge-neutral'
                          }`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className={`font-bold ${tx.amount > 0 ? 'text-success' : 'text-error'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} SOL
                      </td>
                      <td>
                        <span className={`badge badge-sm w-18 ${tx.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          {tx.signature.slice(0, 8)}...{tx.signature.slice(-4)}
                        </a>
                      </td>
                    </tr>
                  ))}
                  {hasNextPage && (
                    <tr ref={ref}>
                      <td colSpan={5} className="text-center p-4">
                        {isFetchingNextPage ? (
                          <span className="loading loading-spinner loading-md"></span>
                        ) : (
                          'Load more'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPage;