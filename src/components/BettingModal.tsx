import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import Icon from './icon/icon.component';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bet: number, risk: number) => void;
}

const BettingModal: React.FC<BettingModalProps> = ({ isOpen, onClose, onConfirm }) => {
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

    if (isOpen) {
      fetchAndUpdateBalances();
    }
  }, [isOpen, publicKey, connection]);

  useEffect(() => {
    const maxWin = bet * 50 * (1 + risk);
    setPotentialWin(maxWin);
  }, [bet, risk]);

  const isInsufficientBalance = bet > (pdaBalance || 0);
  const isValidBet = bet >= 0.05 && !isInsufficientBalance;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    
    console.log('handleConfirm called with:', { bet, risk, pdaBalance });

    if (!pdaBalance) {
      setError("Could not fetch game balance");
      return;
    }

    if (isInsufficientBalance) {
      setError("Insufficient game balance");
      return;
    }

    if (bet < 0.05) {
      setError("Minimum bet is 0.05 SOL");
      return;
    }

    try {
      setIsSubmitting(true);
      onClose();
      onConfirm(bet, risk);
    } catch (error) {
      console.error('Error in bet confirmation:', error);
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-2xl p-3 md:p-8 w-full max-w-md space-y-3 md:space-y-6 shadow-2xl animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Place Your Bet
          </h2>
          {publicKey ? (
            <div className='flex justify-between bg-base-200 p-2 rounded-lg'>
              <p className="text-base-content/60 text-nowrap">
                <span className='text-xs'>Game Balance:</span>
                <span className="font-bold text-primary">
                  {pdaBalance?.toFixed(4) || '0'} <span className='text-xs text-accent'>SOL</span>
                </span>
              </p>
              <p className="text-base-content/60 text-nowrap">
                <span className='text-xs'>Wallet Balance:</span>
                <span className="font-bold text-primary">
                  {walletBalance?.toFixed(4) || '0'} <span className='text-xs text-accent'>SOL</span>
                </span>
              </p>
            </div>
          ) : (
            <p className="text-base-content/60">
              Balance: <span className="font-bold text-error">Not Connected</span>
            </p>
          )}
        </div>
        {/* Bet Amount Section */}
        <div className="space-y-3 border border-dashed my-4 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <label className=" flex items-center gap-2">
              <Icon name="wallet" className="text-2xl text-primary" />
              <span className='text-base md:text-lg font-semibold'> Your Bet </span>
            </label>
            <div className="flex gap-2 items-center py-2">
              <button
                onClick={() => setBet(Math.max(0.05, Number((bet - 0.1).toFixed(9))))}
                className="btn btn-circle btn-sm btn-primary btn-outline"
              >
                -
              </button>
              <div className="relative">
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Number(e.target.value))}
                  className={`input input-bordered w-24 text-center font-bold ${isInsufficientBalance ? 'input-error border-2' : ''
                    }`}
                  min={0.05}
                  step={0.1}
                />
                {isInsufficientBalance && (
                  <div className="absolute -bottom-5 left-0 right-0 text-center">
                    <span className="text-xs text-error text-nowrap">Insufficient balance</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setBet(Math.min(walletBalance || 0, Number((bet + 0.1).toFixed(9))))}
                className="btn btn-circle btn-sm btn-primary btn-outline"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quick Bet Presets */}
        <div className="grid grid-cols-4 gap-2">
          {betPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                setBet(preset.amount);
                setSelectedPreset(index);
              }}
              className={`btn btn-sm ${selectedPreset === index ? 'btn-primary' : 'btn-outline'}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Risk Level Section */}
        <div className="space-y-3 bg-base-200 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <label className="text-lg font-semibold flex items-center gap-2">
              <Icon name="game" className="text-xl text-primary" />
              Risk Level
            </label>
            <span className="badge badge-primary">{risk}x</span>
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
          <div className="flex justify-between text-sm text-base-content/60">
            <span>Safer</span>
            <span>Riskier</span>
          </div>
          {/* Risk Level Quick Presets */}
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

        {/* Potential Winnings */}
        <div className="bg-base-200 rounded-xl p-4 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="wallet" className="text-xl text-primary" />
            Potential Results (SOL)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 p-3 rounded-lg">
              <p className="text-sm text-base-content/60">Max Win (Royal Flush)</p>
              <p className="text-2xl font-bold text-success">+{potentialWin.toFixed(4)}</p>
            </div>
            <div className="bg-error/10 p-3 rounded-lg">
              <p className="text-sm text-base-content/60">Max Loss</p>
              <p className="text-2xl font-bold text-error">-{(bet * risk).toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 flex-col md:flex-row">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-outline flex-1 gap-2 py-3"
          >
            <Icon name="closeCircle" className="text-xl" />
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!isValidBet || isSubmitting}
            className={`btn btn-primary flex-1 gap-2 py-3 ${
              (!isValidBet || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Placing Bet...
              </>
            ) : (
              <>
                <Icon name="game" className="text-xl" />
                Place Bet & Play
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-error/10 p-3 rounded-lg text-center">
            <p className="text-error font-semibold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingModal; 