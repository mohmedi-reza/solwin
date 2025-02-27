import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import Icon from './icon/icon.component';

interface BettingSectionProps {
  onClose: () => void;
  onConfirm: (bet: number, risk: number) => void;
}

const BettingSection: React.FC<BettingSectionProps> = ({ onClose, onConfirm }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [pdaBalance, setPdaBalance] = useState<number | null>(null);
  const [bet, setBet] = useState(0.05);
  const [risk, setRisk] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [potentialWin, setPotentialWin] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const betPresets = useMemo(() => [
    { amount: 0.05, label: 'Min' },
    { amount: 0.5, label: '0.5 SOL' },
    { amount: 1, label: '1 SOL' },
    { amount: pdaBalance || 0, label: 'Max' }
  ], [pdaBalance]);

  const riskPresets = [
    { value: 0.5, label: 'Safe' },
    { value: 0.7, label: 'Low' },
    { value: 0.85, label: 'Med' },
    { value: 1.0, label: 'Max' }
  ];

  useEffect(() => {
    const fetchAndUpdateBalances = async () => {
      if (publicKey && AuthService.isAuthenticated()) {
        try {
          const walletData = await UserService.getWalletBalance();
          setPdaBalance(Number(walletData.balance));

          const solBalance = await connection.getBalance(publicKey);
          setWalletBalance(solBalance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error refreshing balances:', error);
        }
      }
    };

    fetchAndUpdateBalances();
  }, [publicKey, connection]);

  useEffect(() => {
    const maxWin = bet * 50 * (1 + risk);
    setPotentialWin(maxWin);
  }, [bet, risk]);

  const isInsufficientBalance = bet > (pdaBalance || 0);
  const isValidBet = bet >= 0.05 && !isInsufficientBalance;

  const validateBet = (value: number): string | null => {
    if (value < 0.05) {
      return "Minimum bet is 0.05 SOL";
    }
    if (value > (pdaBalance || 0)) {
      return "Insufficient balance";
    }
    return null;
  };

  const formatBetValue = (value: number): number => {
    // Silently format to 4 decimal places
    return Number(Math.floor(value * 10000) / 10000);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatBetValue(Number(e.target.value));
    setBet(newValue);
    setError(validateBet(newValue));
  };

  const incrementBet = () => {
    const newBet = formatBetValue(Math.min(
      pdaBalance || 0,
      bet + 0.1
    ));
    setBet(newBet);
    setError(validateBet(newBet));
  };

  const decrementBet = () => {
    const newBet = formatBetValue(Math.max(
      0.05,
      bet - 0.1
    ));
    setBet(newBet);
    setError(validateBet(newBet));
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    const validationError = validateBet(bet);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const formattedBet = Number(bet.toFixed(4));
      onClose();
      onConfirm(formattedBet, risk);
    } catch (error) {
      console.error('Error in bet confirmation:', error);
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="rounded-2xl w-full animate-fadeIn">
        {/* Header - Modernized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <div className='flex items-center gap-4'>
            <button
              onClick={onClose}
              className="rounded-2xl btn-soft z-50 left-4 sm:left-6 top-4 sm:top-6 btn btn-square backdrop-blur-sm hover:bg-base-200/80 transition-all"
            >
              <Icon name="arrowLeft" className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold text-primary">
              Place Your Bet
            </h2>
          </div>

          {publicKey && (
            <div className='flex gap-3 sm:gap-4 items-center w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start'>
              <div className="flex flex-col items-end">
                <span className='text-xs text-base-content/60'>Game Balance</span>
                <span className="font-bold text-primary text-sm sm:text-base">
                  {pdaBalance?.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className='text-xs text-base-content/60'>Wallet Balance</span>
                <span className="font-bold text-primary text-sm sm:text-base">
                  {walletBalance?.toFixed(4)} SOL
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid - Updated for equal height columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-4 border-base-300 pt-4 border-b">
          {/* Bet Amount Section */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-base-content/30">
              <Icon name="wallet" className="text-primary" />
              Bet Amount
            </h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center bg-base-200/50 rounded-2xl p-4 mb-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <button
                  onClick={decrementBet}
                  className="btn btn-circle btn-ghost btn-sm"
                >
                  <span className='text-2xl'>-</span>
                </button>
                
                <input
                  type="number"
                  value={bet}
                  onChange={handleBetChange}
                  className={`input bg-transparent outline-none focus:outline-none border-none text-center shadow-none w-24 text-xl font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${error ? 'text-error' : 'text-primary'}`}
                  min={0.05}
                  step={0.0001}
                  max={pdaBalance || 0}
                />
                
                <button
                  onClick={incrementBet}
                  className="btn btn-circle btn-ghost btn-sm"
                >
                  <span className='text-2xl'>+</span>
                </button>
              </div>

              {/* Bet Amount Presets */}
              <div className="grid grid-cols-4 gap-2 mt-auto">
                {betPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setBet(preset.amount);
                      setSelectedPreset(index);
                    }}
                    className={`btn btn-xs rounded-lg ${selectedPreset === index 
                      ? 'btn-primary btn-outline text-primary' 
                      : 'btn-ghost btn-soft'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Level Section */}
          <div className="flex flex-col gap h-full border-t border-base-300 md:border-t-0  pt-4 md:pt-0">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-base-content/30">
              <Icon name="game" className="text-primary" />
              Risk Level
            </h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/60">Level</span>
                  <span className="badge badge-primary badge-outline">
                    {risk}x
                  </span>
                </div>
                
                <input
                  type="range"
                  value={risk}
                  onChange={(e) => setRisk(Number(e.target.value))}
                  className="range range-primary  range-xs w-full"
                  min={0.5}
                  max={1.0}
                  step={0.05}
                />
              </div>
              
              {/* Risk Level Presets */}
              <div className="grid grid-cols-4 gap-2 mt-2 md:mt-auto">
                {riskPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setRisk(preset.value)}
                    className={`btn btn-xs rounded-lg ${risk === preset.value 
                      ? 'btn-primary btn-outline text-primary' 
                      : 'btn-ghost btn-soft'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Potential Results Section */}
          <div className="flex flex-col h-full border-t border-base-300 md:border-t-0  pt-4 md:pt-0">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-base-content/30">
              <Icon name="moneys" className="text-primary" />
              Potential Results
            </h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-success/5 p-4 rounded-2xl flex items-center justify-between">
                  <p className="text-sm text-base-content/60">Max Win</p>
                  <p className="text-xl font-bold text-success">
                    +{potentialWin.toFixed(4)}
                    <span className="text-xs ml-1">SOL</span>
                  </p>
                </div>
                
                <div className="bg-error/5 p-4 rounded-2xl flex items-center justify-between">
                  <p className="text-sm text-base-content/60">Max Loss</p>
                  <p className="text-xl font-bold text-error">
                    -{(bet * risk).toFixed(4)}
                    <span className="text-xs ml-1">SOL</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Modernized */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleConfirm}
            disabled={!isValidBet || isSubmitting}
            className="btn btn-primary  min-h-[3rem] relative rounded-xl"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Placing Bet...
              </>
            ) : (
              <>
                <Icon name="poker1" className="text-3xl" />
                <span className='text-xl'>Start Game</span>
              </>
            )}
            {isValidBet && !isSubmitting && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-error animate-ping"></span>
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-ghost  min-h-[3rem] rounded-xl"
          >
            Cancel
          </button>
        </div>

        {/* Error Display - Modernized */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-error/5 border border-error/20">
            <p className="text-error text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingSection;