import React, { useState, useEffect } from 'react';
import Icon from './icon/icon.component';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bet: number, risk: number) => void;
  balance: number;
}

const BettingModal: React.FC<BettingModalProps> = ({ isOpen, onClose, onConfirm, balance }) => {
  const [bet, setBet] = useState(10);
  const [risk, setRisk] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [potentialWin, setPotentialWin] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const betPresets = [
    { amount: 10, label: 'Min' },
    { amount: 50, label: '50$' },
    { amount: 100, label: '100$' },
    { amount: balance, label: 'Max' }
  ];

  const riskPresets = [
    { value: 0.5, label: 'Safe' },
    { value: 1.0, label: 'Normal' },
    { value: 1.5, label: 'High' },
    { value: 2.0, label: 'Max' }
  ];

  useEffect(() => {
    // محاسبه حداکثر برد ممکن (با ضریب Royal Flush)
    const maxWin = bet * 50 * (1 + risk);
    setPotentialWin(maxWin);
  }, [bet, risk]);

  const handleConfirm = () => {
    if (bet > balance) {
      setError("Insufficient balance");
      return;
    }
    if (bet < 10) {
      setError("Minimum bet is $10");
      return;
    }
    onConfirm(bet, risk);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Place Your Bet
          </h2>
          <p className="text-base-content/60">
            Current Balance: <span className="font-bold text-primary">${balance}</span>
          </p>
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

        {/* Bet Amount Section */}
        <div className="space-y-3 bg-base-200 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <label className="text-lg font-semibold flex items-center gap-2">
              <Icon name="wallet" className="text-xl text-primary" />
              Bet Amount
            </label>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setBet(Math.max(10, bet - 10))} 
                className="btn btn-circle btn-sm btn-primary btn-outline"
              >
                -
              </button>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className="input input-bordered w-24 text-center font-bold"
                min={10}
              />
              <button 
                onClick={() => setBet(Math.min(balance, bet + 10))} 
                className="btn btn-circle btn-sm btn-primary btn-outline"
              >
                +
              </button>
            </div>
          </div>
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
            max={2.0}
            step={0.1}
          />
          <div className="flex justify-between text-sm text-base-content/60">
            <span>Safer</span>
            <span>Riskier</span>
          </div>
        </div>

        {/* Potential Winnings */}
        <div className="bg-base-200 rounded-xl p-4 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="wallet" className="text-xl text-primary" />
            Potential Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 p-3 rounded-lg">
              <p className="text-sm text-base-content/60">Max Win (Royal Flush)</p>
              <p className="text-2xl font-bold text-success">+${potentialWin.toFixed(2)}</p>
            </div>
            <div className="bg-error/10 p-3 rounded-lg">
              <p className="text-sm text-base-content/60">Max Loss</p>
              <p className="text-2xl font-bold text-error">-${(bet * risk).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 p-3 rounded-lg text-center">
            <p className="text-error font-semibold">{error}</p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={onClose}
            className="btn btn-outline flex-1 gap-2"
          >
            <Icon name="closeCircle" className="text-xl" />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-primary flex-1 gap-2"
          >
            <Icon name="game" className="text-xl" />
            Place Bet & Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default BettingModal; 