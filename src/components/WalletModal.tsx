import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Icon from './icon/icon.component';
import { WalletService } from '../services/wallet.service';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  pdaBalance: string;
  onSuccess: () => void;
}

type TabType = 'deposit' | 'withdraw';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  pdaBalance,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsLoading(true);
    try {
      const success = await WalletService.deposit(amount);
      if (success) {
        toast.success(`Successfully deposited ${amount} SOL`);
        setAmount(0);
        onSuccess();
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.error || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > Number(pdaBalance)) {
      toast.error('Insufficient game balance');
      return;
    }

    setIsLoading(true);
    try {
      const response = await WalletService.withdraw(amount);
      if (response.success) {
        toast.success(`Successfully withdrew ${amount} SOL. Transaction: ${response.txHash}`);
        setAmount(0);
        onSuccess();
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.error || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-2xl p-8 w-full max-w-md space-y-7 shadow-xl border border-base-300">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Wallet Operations
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-circle hover:rotate-90 transition-transform">
            <Icon name="closeCircle" className="text-2xl" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-base-200 p-5 rounded-2xl hover:shadow-md transition-shadow">
            <p className="text-sm text-base-content/70 mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold text-primary">{walletBalance.toFixed(4)} SOL</p>
          </div>
          <div className="bg-base-200 p-5 rounded-2xl hover:shadow-md transition-shadow">
            <p className="text-sm text-base-content/70 mb-1">Game Balance</p>
            <p className="text-2xl font-bold text-secondary">{Number(pdaBalance).toFixed(4)} SOL</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed p-1 bg-base-200 rounded-xl">
          <button
            className={`tab flex-1 transition-all duration-200 ${activeTab === 'deposit'
              ? 'tab-active bg-primary text-primary-content rounded-lg'
              : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            Deposit
          </button>
          <button
            className={`tab flex-1 transition-all duration-200 ${activeTab === 'withdraw'
              ? 'tab-active bg-primary text-secondary-content rounded-lg'
              : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Amount (SOL)</span>
            <span className="label-text-alt opacity-70">
              Max: {activeTab === 'deposit' ? walletBalance.toFixed(4) : Number(pdaBalance).toFixed(4)} SOL
            </span>
          </label>
          <div className="join w-full shadow-sm">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input input-bordered join-item w-full focus:outline-none focus:border-primary"
              placeholder="Enter amount"
              step={1 / LAMPORTS_PER_SOL}
              min={0}
            />
            <button
              className="btn join-item btn-primary"
              onClick={() => setAmount(activeTab === 'deposit' ? walletBalance : Number(pdaBalance))}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`btn btn-primary
            w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl 
            transition-all duration-200 ${isLoading ? 'loading' : ''}`}
          onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
          disabled={isLoading || amount <= 0}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <Icon name={activeTab === 'deposit' ? 'arrowDown' : 'arrowUp1'} className="text-xl" />
          )}
          {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
};

export default WalletModal; 