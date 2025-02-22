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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Wallet Operations</h2>
          <button onClick={onClose} className="btn btn-ghost btn-circle">
            <Icon name="closeCircle" className="text-2xl" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-base-content/60">Wallet Balance</p>
            <p className="text-xl font-bold">{walletBalance.toFixed(4)} SOL</p>
          </div>
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-base-content/60">Game Balance</p>
            <p className="text-xl font-bold">{Number(pdaBalance).toFixed(4)} SOL</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed">
          <button 
            className={`tab flex-1 ${activeTab === 'deposit' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            Deposit
          </button>
          <button 
            className={`tab flex-1 ${activeTab === 'withdraw' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Amount (SOL)</span>
            <span className="label-text-alt">
              Max: {activeTab === 'deposit' ? walletBalance.toFixed(4) : Number(pdaBalance).toFixed(4)} SOL
            </span>
          </label>
          <div className="join w-full">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input input-bordered join-item w-full"
              placeholder="Enter amount"
              step={1 / LAMPORTS_PER_SOL}
              min={0}
              max={activeTab === 'deposit' ? walletBalance : Number(pdaBalance)}
            />
            <button 
              className="btn join-item"
              onClick={() => setAmount(activeTab === 'deposit' ? walletBalance : Number(pdaBalance))}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
          onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
          disabled={isLoading || amount <= 0}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <Icon name={activeTab === 'deposit' ? 'arrowDown' : 'arrowUp'} className="text-xl" />
          )}
          {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
};

export default WalletModal; 