import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UserService } from '../services/user.service';
import useGameWeb3 from '../web3/slots';
import Icon from './icon/icon.component';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../hooks/useWalletBalance';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
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
  onSuccess
}) => {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoadingPda, setIsLoadingPda] = useState(true);
  const [pdaBalance, setPdaBalance] = useState('0');
  const { SendSol, withdrawFromUserPDA } = useGameWeb3();
  const queryClient = useQueryClient();

  const STEP_SIZE = 0.1;
  const MIN_DEPOSIT = 0.1;

  const handleConnectWallet = () => {
    setVisible(true); // Open Solana wallet modal
    onClose(); // Close current modal
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(inputValue) || 0;
    // Round to 4 decimal places to avoid floating point precision issues
    const newValue = Math.round((currentValue + STEP_SIZE) * 10000) / 10000;
    const maxValue = activeTab === 'deposit' ? walletBalance : Number(pdaBalance);

    if (newValue <= maxValue) {
      setInputValue(newValue.toFixed(4));
      validateAmount(newValue.toString());
    }
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(inputValue) || 0;
    // Round to 4 decimal places to avoid floating point precision issues
    const newValue = Math.round(Math.max(currentValue - STEP_SIZE, 0) * 10000) / 10000;

    if (newValue >= 0) {
      setInputValue(newValue.toFixed(4));
      validateAmount(newValue.toString());
    }
  };

  const validateAmount = (value: string) => {
    setInputValue(value);
    setError(null);
    setIsValid(false);

    if (value === '') {
      setError('Please enter a valid amount');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      setError('Please enter a valid amount');
      return;
    }

    if (activeTab === 'deposit') {
      if (numericValue < MIN_DEPOSIT) {
        setError('Minimum deposit is 0.1 SOL');
      } else if (numericValue > walletBalance) {
        setError(`Insufficient balance (max: ${walletBalance.toFixed(4)} SOL)`);
      } else {
        setIsValid(true);
      }
    } else {
      if (numericValue <= 0) {
        setError('Amount must be greater than 0');
      } else if (numericValue > Number(pdaBalance)) {
        setError(`Insufficient game balance (max: ${Number(pdaBalance).toFixed(4)} SOL)`);
      } else {
        setIsValid(true);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input, numbers, and one decimal point
    if (!/^$|^\d*\.?\d*$/.test(value)) {
      return;
    }

    validateAmount(value);
  };

  const handleMaxAmount = () => {
    const maxAmount = activeTab === 'deposit' ? walletBalance : Number(pdaBalance);
    setInputValue(maxAmount.toFixed(4));
    validateAmount(maxAmount.toString());
  };

  const handleDeposit = async () => {
    const amount = parseFloat(inputValue);
    if (!amount || amount < 0.1) {
      toast.error('Minimum deposit amount is 0.1 SOL');
      return;
    }

    setIsLoading(true);
    try {
      const success = await SendSol(amount);
      if (success) {
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET_BALANCE] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
        
        toast.success(`Successfully deposited ${amount.toFixed(4)} SOL`);
        setInputValue('');
        onClose();
        onSuccess();
      }
    } catch (error) {
      const err = error as Error;
      toast.error(`Deposit failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(inputValue);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > Number(pdaBalance)) {
      toast.error(`Insufficient game balance. Maximum available: ${Number(pdaBalance).toFixed(4)} SOL`);
      return;
    }

    setIsLoading(true);
    try {
      const success = await withdrawFromUserPDA(amount);
      if (success) {
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET_BALANCE] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });

        toast.success(`Successfully withdrew ${amount.toFixed(4)} SOL`);
        setInputValue('');
        onClose();
        onSuccess();
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.error || 'Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPdaBalance = async () => {
      if (!publicKey) return;

      setIsLoadingPda(true);
      try {
        const walletData = await UserService.getWalletBalance();
        setPdaBalance(walletData.balance.toString());
      } catch (error) {
        console.error('Error fetching PDA balance:', error);
        toast.error('Failed to fetch wallet balance');
      } finally {
        setIsLoadingPda(false);
      }
    };

    if (isOpen) {
      fetchPdaBalance();
    }
  }, [isOpen, publicKey]);

  if (!isOpen) return null;

  if (!publicKey) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="bg-base-100 rounded-2xl p-8 w-full max-w-md space-y-7 shadow-xl border border-base-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Wallet Required
            </h2>
            <button onClick={onClose} className="btn btn-ghost btn-circle hover:rotate-90 transition-transform">
              <Icon name="closeCircle" className="text-2xl" />
            </button>
          </div>

          <div className="text-center space-y-4">
            <div className="p-6 bg-base-200 rounded-xl">
              <Icon name="wallet" className="text-5xl text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Please connect your wallet first</p>
              <p className="text-base-content/60 mt-2">
                You need to connect a Solana wallet to deposit or withdraw funds.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleConnectWallet}
                className="btn btn-primary btn-lg gap-2"
              >
                <Icon name="wallet" className="text-xl" />
                Connect Wallet
              </button>
              <button
                onClick={onClose}
                className="btn btn-outline gap-2"
              >
                <Icon name="closeCircle" className="text-xl" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Icon name="wallet" className="text-5xl text-primary mx-auto mb-4" />
            <p className="text-sm text-base-content/70 mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold text-primary">{walletBalance.toFixed(4)} SOL</p>
          </div>
          <div className="bg-base-200 p-5 rounded-2xl hover:shadow-md transition-shadow">
            <Icon name="game" className="text-5xl text-secondary mx-auto mb-4" />
            <p className="text-sm text-base-content/70 mb-1">Game Balance</p>
            {isLoadingPda ? (
              <div className="loading loading-spinner loading-md text-secondary"></div>
            ) : (
              <p className="text-2xl font-bold text-secondary">{Number(pdaBalance).toFixed(4)} SOL</p>
            )}
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
            disabled={isLoadingPda || pdaBalance === '0'}
          >
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-control space-y-3">
          <label className="label">
            <span className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Amount (SOL)
            </span>
            <span className={`label-text-alt transition-colors duration-200 ${error ? 'text-error font-medium' : 'opacity-70'}`}>
              {activeTab === 'deposit' ? 'Min: 0.1 SOL, ' : ''}Max: {activeTab === 'deposit' ? walletBalance.toFixed(4) : Number(pdaBalance).toFixed(4)} SOL
            </span>
          </label>
          <div className="join w-full shadow-lg hover:shadow-xl transition-all duration-200">
            <button
              onClick={handleDecrement}
              className="btn join-item px-4"
              disabled={!inputValue || parseFloat(inputValue) <= 0}
            >
              <Icon name="minus" className="text-xl" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleAmountChange}
              className={`input input-bordered join-item w-full focus:outline-none text-lg text-center
                ${error ? 'input-error border-error/50 bg-error/5' : isValid ? 'input-success border-success/50 bg-success/5' : ''}
                ${isValid ? 'focus:border-success' : error ? 'focus:border-error' : 'focus:border-primary'}
                transition-all duration-200
              `}
              placeholder={`Enter amount ${activeTab === 'deposit' ? '(min 0.1 SOL)' : ''}`}
              inputMode="decimal"
            />
            <button
              onClick={handleIncrement}
              className="btn join-item px-4"
              disabled={!isValid}
            >
              <Icon name="add" className="text-xl" />
            </button>
            <button
              className={`btn join-item px-6 font-bold
                ${isValid ? 'btn-success text-success-content' : error ? 'btn-error text-error-content' : 'btn-primary text-primary-content'}
                hover:scale-105 transition-all duration-200
              `}
              onClick={handleMaxAmount}
            >
              MAX
            </button>
          </div>

          {/* Dynamic Message Container */}
          <div className={`text-sm flex items-center gap-2 p-2 rounded-lg animate-fadeIn
            ${error ? 'bg-error/10 text-error' : isValid ? 'bg-success/10 text-success' : 'hidden'}
          `}>
            <Icon
              name={error ? 'warning' : 'tickCircle'}
              className={`text-lg ${isValid && !error ? 'animate-bounce' : ''}`}
            />
            <span className="font-medium">
              {error ? error : isValid && inputValue > '0' && (
                <>Ready to {activeTab} <span className="font-bold">{inputValue} SOL</span></>
              )}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`btn w-full h-12 text-lg font-bold shadow-lg
            ${isLoading ? 'loading' : ''}
            ${isValid
              ? 'bg-primary hover:scale-[1.02] text-primary-content'
              : 'bg accent-accent to-secondary border-none text-primary-content opacity-50'
            }
            transition-all duration-200 transform hover:shadow-xl
          `}
          onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
          disabled={
            isLoading ||
            !isValid ||
            inputValue === '' ||
            (activeTab === 'deposit' && (parseFloat(inputValue) < 0.1 || parseFloat(inputValue) > walletBalance)) ||
            (activeTab === 'withdraw' && parseFloat(inputValue) > Number(pdaBalance))
          }
        >
          {isLoading ? (
            <span className="loading bg-primary loading-spinner loading-md size-6"></span>
          ) : (
            <div className="flex items-center gap-3">
              <Icon
                name={activeTab === 'deposit' ? 'arrowDown' : 'arrowUp1'}
                className={`text-xl ${isValid ? 'animate-bounce' : ''}`}
              />
              <span className="text-base">
                {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} SOL
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default WalletModal; 