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
    <div className="relative bg-none rounded-3xl ">

      <div className="rounded-2xl w-full animate-fadeIn ">
        {/* Header */}
        <div className="flex flex-col md:flex-row  items-start md:items-center justify-between mb-6 ">
          <div className='flex gap-4  p-2 rounded-lg'>
            {/* Back Button */}
            <button
              onClick={onClose}
              className="rounded-2xl btn-soft z-50 left-4 sm:left-6 top-4 sm:top-6 btn btn-square backdrop-blur-sm hover:/80 transition-all"
            >
              <Icon name="arrowLeft" className="text-xl sm:text-2xl" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Place Your Bet
            </h2>
          </div>

          {publicKey && (
            <div className='flex gap-4  p-2 rounded-lg'>
              <p className="text-base-content/60 text-nowrap">
                <span className='text-xs'>Game:</span>
                <span className="font-bold text-primary">
                  {pdaBalance?.toFixed(4) || '0'} <span className='text-xs text-accent'>SOL</span>
                </span>
              </p>
              <p className="text-base-content/60 text-nowrap">
                <span className='text-xs'>Wallet:</span>
                <span className="font-bold text-primary">
                  {walletBalance?.toFixed(4) || '0'} <span className='text-xs text-accent'>SOL</span>
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Three Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border border-base-300 bg-base-100 rounded-2xl">
          {/* Column 1 - Bet Amount */}
          <div className="  rounded-xl p-4  flex-1 h-full">
            <h3 className=" opacity-40 font-semibold flex items-center gap-2">
              <Icon name="wallet" className="text-xl text-primary" />
              Your Bet
            </h3>
            <div className="space-y-2 mt-6 ">
              {/* Bet Input */}
              <div className=" p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2">
                    {/* <Icon name="moneySend" className="text-2xl text-primary" /> */}
                    <span className='text-base font-semibold'>Amount</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={decrementBet}
                      className="btn btn-circle btn-soft btn-sm btn-primary text-xl"
                    >
                      <span className='text-3xl p-0 m-0'>-</span>
                    </button>
                    <div className="relative">
                      <input
                        type="number"
                        value={bet}
                        onChange={handleBetChange}
                        className={`input text-xl text-primary input-bordered w-24 text-center font-bold ${error ? 'input-error border-2' : ''}`}
                        min={0.05}
                        step={0.0001}
                        max={pdaBalance || 0}
                      />
                      {error && (
                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                          <span className="text-xs text-error text-nowrap">{error}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={incrementBet}
                      className="btn btn-circle btn-soft btn-sm btn-primary "
                    >
                      <span className='text-xl p-0 m-0'>+</span>

                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Bet Presets */}
              <div className="grid grid-cols-4  gap-2">
                {betPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setBet(preset.amount);
                      setSelectedPreset(index);
                    }}
                    className={`btn btn-sm text-nowrap ${selectedPreset === index ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 - Risk Level */}
          <div className="  rounded-xl p-4  flex-1 h-full">
            <h3 className=" opacity-40 font-semibold flex items-center gap-2">
              <Icon name="game" className="text-xl text-primary" />
              Risk Level
            </h3>
            <div className="space-y-5">
              {/* Risk Controls */}
              <div className="space-y-2 mt-6 ">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/60">Level</span>
                  <span className="badge badge-sm badge-primary">{risk}x</span>
                </div>
                <input
                  type="range"
                  value={risk}
                  onChange={(e) => setRisk(Number(e.target.value))}
                  className="range range-primary range-lg"
                  min={0.5}
                  max={1.0}
                  step={0.05}
                />
                {/* <div className="flex justify-between text-sm text-base-content/60">
                  <span>Safer</span>
                  <span>Riskier</span>
                </div> */}
              </div>

              {/* Risk Presets */}
              <div className="grid grid-cols-4 gap-2">
                {riskPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setRisk(preset.value)}
                    className={`btn btn-sm ${risk === preset.value ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 - Potential Results */}
          <div className="  rounded-xl p-4  flex-1 h-full">
            <h3 className=" opacity-40 font-semibold flex items-center gap-2">
              <Icon name="wallet" className="text-xl text-primary" />
              Potential Results
            </h3>
            <div className="space-y-2 mt-6 ">
              <div className="bg-success/10 py-3 px-3 flex justify-between rounded-lg">
                <p className="text-sm text-base-content/60">Max Win (Royal Flush)</p>
                <p className="text-xl font-bold text-success">+{potentialWin.toFixed(4)}</p>
              </div>
              <div className="bg-error/10 py-3 px-3 flex justify-between rounded-lg">
                <p className="text-sm text-base-content/60">Max Loss</p>
                <p className="text-xl font-bold text-error">-{(bet * risk).toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>
        {/* <div className='divider'></div> */}
        {/* Action Buttons - Below Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={!isValidBet || isSubmitting}
              className={`relative btn btn-primary flex-1 ${!isValidBet || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className=' absolute top-1 left-1 status status-error animate-ping'></span>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Placing...
                </>
              ) : (
                <>
                  <Icon name="game" className="text-xl" />
                  Place Bet
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-outline flex-1"
            >
              <Icon name="closeCircle" className="text-xl" />
              Cancel
            </button>

          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-error/10 p-3 rounded-lg text-center mt-4">
            <p className="text-error font-semibold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingSection; 