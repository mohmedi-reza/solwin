import React, { useState, useCallback } from 'react';
import { Card, HandResult } from '../types/poker.interface';
import { PokerGame as PokerGameService } from '../services/poker.service';

const game = new PokerGameService();

const PokerGameComponent: React.FC = () => {
    const [bet, setBet] = useState<number>(10);
    const [riskLevel, setRiskLevel] = useState<number>(1);
    const [currentHand, setCurrentHand] = useState<Card[]>([]);
    const [handResult, setHandResult] = useState<HandResult | null>(null);
    const [winnings, setWinnings] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        totalWinnings: 0,
        biggestWin: 0
    });

    const handleBetChange = (value: number) => {
        setBet(value);
        const error = game.validateBet(value, riskLevel);
        setError(error);
    };

    const handleRiskChange = (value: number) => {
        setRiskLevel(value);
        const error = game.validateBet(bet, value);
        setError(error);
    };

    const handlePlay = useCallback(() => {
        const error = game.validateBet(bet, riskLevel);
        if (error) {
            setError(error);
            return;
        }

        const hand = game.drawHand();
        const result = game.evaluateHand(hand);
        const winAmount = game.calculateWinnings(bet, riskLevel, result);

        setCurrentHand(hand);
        setHandResult(result);
        setWinnings(winAmount);
        setStats(prev => ({
            gamesPlayed: prev.gamesPlayed + 1,
            totalWinnings: prev.totalWinnings + winAmount,
            biggestWin: Math.max(prev.biggestWin, winAmount > 0 ? winAmount : 0)
        }));
    }, [bet, riskLevel]);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Poker Card Betting Game</h1>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Bet Amount</label>
                        <input
                            type="number"
                            min="10"
                            value={bet}
                            onChange={(e) => handleBetChange(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Risk Level (0.5-2.0)</label>
                        <input
                            type="number"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={riskLevel}
                            onChange={(e) => handleRiskChange(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                <button
                    onClick={handlePlay}
                    disabled={bet < 10}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                    Draw Cards
                </button>

                {currentHand.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex gap-2 justify-center">
                            {currentHand.map((card, index) => (
                                <div
                                    key={index}
                                    className="w-40 h-56 border rounded-2xl 
                                             bg-amber-100
                                             flex items-center justify-center relative
                                             shadow-lg"
                                >
                                    <img
                                        src={card.imagePath}
                                        alt={`${card.display} of ${card.suit}`}
                                        className="w-40 h-56"
                                    />
                                </div>
                            ))}
                        </div>

                        {handResult && (
                            <div className="text-center">
                                <p className="text-xl font-bold">{handResult.type}</p>
                                <p className="text-lg">
                                    {winnings && winnings > 0
                                        ? `You won ${winnings}!`
                                        : `You lost ${Math.abs(winnings || 0)}`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                )}

                <div className="mt-4 text-sm text-gray-600">
                    <div>Games Played: {stats.gamesPlayed}</div>
                    <div>Total Winnings: {stats.totalWinnings}</div>
                    <div>Biggest Win: {stats.biggestWin}</div>
                </div>
            </div>
        </div>
    );
};

export default PokerGameComponent; 