import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import Icon from '../components/icon/icon.component';
import WalletModal from '../components/WalletModal';
import { useWalletBalance } from '../hooks/useWalletBalance';
// import { motion } from 'framer-motion';

// Game modes and status types
type GameMode = 'CREATE' | 'JOIN' | 'PLAYING';
type GameStatus = 'WAITING' | 'READY' | 'COUNTDOWN' | 'FLIPPING' | 'RESULT';

// Sound effects
const SOUNDS = {
  flip: new Audio('/assets/sounds/flip.mp3'),
  win: new Audio('/assets/sounds/win.mp3'),
  lose: new Audio('/assets/sounds/lose.mp3'),
  countdown: new Audio('/assets/sounds/countdown.mp3'),
  select: new Audio('/assets/sounds/select.mp3'),
};

interface DuelGame {
  id: string;
  creator: {
    name: string;
    publicKey: string;
    betAmount: number;
    choice: 'heads' | 'tails' | null;
  };
  opponent?: {
    name: string;
    publicKey: string;
    betAmount: number;
    choice: 'heads' | 'tails' | null;
  };
  status: GameStatus;
  result?: 'heads' | 'tails';
  winner?: string;
}

interface PlayerState {
  name: string;
  betAmount: number;
  choice: 'heads' | 'tails' | null;
  avatar?: string;
  level?: number;
  wins?: number;
}

const DuelGamePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { data: walletData } = useWalletBalance();
  
  // Game mode and active game
  const [gameMode, setGameMode] = useState<GameMode>('CREATE');
  const [activeGame, setActiveGame] = useState<DuelGame | null>(null);
  const [availableGames, setAvailableGames] = useState<DuelGame[]>([]);
  
  // Game states
  const [gameState, setGameState] = useState<GameStatus>('WAITING');
  const [countdown, setCountdown] = useState(5);
  
  // Player states
  const [player1, setPlayer1] = useState<PlayerState>({
    name: 'You',
    betAmount: 0.1,
    choice: null,
    avatar: '/assets/avatars/player1.png',
    level: 1,
    wins: 0
  });
  
  // Handle bet amount changes
  const handleBetChange = (amount: number) => {
    setPlayer1(prev => ({ ...prev, betAmount: amount }));
  };

  // Handle coin choice
  const handleCoinChoice = (choice: 'heads' | 'tails') => {
    setPlayer1(prev => ({ ...prev, choice }));
    // For demo, opponent takes opposite side
  };

  // Countdown effect
  useEffect(() => {
    if (gameState === 'COUNTDOWN' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        SOUNDS.countdown.play();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'COUNTDOWN' && countdown === 0) {
      setGameState('FLIPPING');

      setTimeout(() => {
        const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
        const isWinner = flipResult === player1.choice;
        setGameState('RESULT');
        
        setActiveGame(prev => prev ? {
          ...prev,
          result: flipResult,
          winner: isWinner ? 'creator' : 'opponent'
        } : null);

        if (isWinner) {
          SOUNDS.win.play();
        } else {
          SOUNDS.lose.play();
        }
      }, 2000);
    }
  }, [gameState, countdown, player1.choice]);

  // Create new game
  const createGame = (betAmount: number, choice: 'heads' | 'tails') => {
    if (!publicKey) return;
    
    const newGame: DuelGame = {
      id: Math.random().toString(36).substring(7),
      creator: {
        name: `Player #${publicKey.toBase58().slice(-4)}`,
        publicKey: publicKey.toBase58(),
        betAmount,
        choice
      },
      status: 'WAITING'
    };
    
    setActiveGame(newGame);
    setGameMode('PLAYING');
  };

  // Join existing game
  const joinGame = (gameId: string, betAmount: number, choice: 'heads' | 'tails') => {
    if (!publicKey) return;
    
    const game = availableGames.find(g => g.id === gameId);
    if (!game) return;
    
    const updatedGame: DuelGame = {
      ...game,
      opponent: {
        name: `Player #${publicKey.toBase58().slice(-4)}`,
        publicKey: publicKey.toBase58(),
        betAmount,
        choice
      },
      status: 'READY'
    };
    
    setActiveGame(updatedGame);
    setGameMode('PLAYING');
  };

  // Render game creation UI
  const renderCreateGame = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center">Create New Duel</h2>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Bet Amount (SOL)</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              className="input input-bordered"
              placeholder="Enter bet amount"
              value={player1.betAmount}
              onChange={(e) => handleBetChange(Number(e.target.value))}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose Your Side</span>
            </label>
            <div className="flex gap-4">
              <button 
                className={`btn flex-1 ${player1.choice === 'heads' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleCoinChoice('heads')}
              >
                Heads
              </button>
              <button 
                className={`btn flex-1 ${player1.choice === 'tails' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleCoinChoice('tails')}
              >
                Tails
              </button>
            </div>
          </div>
          
          <button 
            className="btn btn-primary mt-4"
            onClick={() => createGame(player1.betAmount, player1.choice!)}
            disabled={!player1.choice || player1.betAmount <= 0}
          >
            Create Duel
          </button>
        </div>
      </div>
    </div>
  );

  // Render available games list
  const renderGamesList = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center">Available Duels</h2>
      <div className="grid gap-4">
        {availableGames.map(game => (
          <div key={game.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                Duel by {game.creator.name}
              </h3>
              <p>Bet Amount: {game.creator.betAmount} SOL</p>
              <button 
                className="btn btn-primary"
                onClick={() => joinGame(game.id, game.creator.betAmount, game.creator.choice === 'heads' ? 'tails' : 'heads')}
              >
                Join Duel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Move this useEffect before any returns or conditional logic
  useEffect(() => {
    // Simulated games data - replace with API call later
    setAvailableGames([
      {
        id: 'game1',
        creator: {
          name: 'Player #1234',
          publicKey: '123...abc',
          betAmount: 0.5,
          choice: 'heads'
        },
        status: 'WAITING'
      }
    ]);
  }, []);

  // Wallet connection check
  if (!publicKey) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="wallet" className="text-6xl text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-base-content/60">Please connect your wallet to play duels</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] container mx-auto py-8">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Coin Flip Duel
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {!activeGame && gameMode === 'CREATE' && renderCreateGame()}
        {!activeGame && gameMode === 'JOIN' && renderGamesList()}
        {activeGame && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h3 className="font-bold">{activeGame.creator.name}</h3>
                  <p>Bet: {activeGame.creator.betAmount} SOL</p>
                  <p>Choice: {activeGame.creator.choice}</p>
                </div>
                
                {activeGame.opponent && (
                  <div className="space-y-2">
                    <h3 className="font-bold">{activeGame.opponent.name}</h3>
                    <p>Bet: {activeGame.opponent.betAmount} SOL</p>
                    <p>Choice: {activeGame.opponent.choice}</p>
                  </div>
                )}
              </div>

              <div className="text-center mt-8">
                {activeGame.status === 'WAITING' && (
                  <p className="text-xl">Waiting for opponent...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletBalance={walletData?.balance || 0}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default DuelGamePage; 