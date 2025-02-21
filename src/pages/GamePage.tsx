import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BettingModal from '../components/BettingModal';
import Icon from '../components/icon/icon.component';
import { PokerGame } from '../services/pokerGame';
import { Card, HandResult } from '../types/poker';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const game = new PokerGame();

interface ShufflingCard extends Card {
  key: number;
}

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentHand, setCurrentHand] = useState<Card[]>([]);
  const [handResult, setHandResult] = useState<HandResult | null>(null);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [risk, setRisk] = useState(1.0);
  const [shufflingCards, setShufflingCards] = useState<ShufflingCard[]>([]);
  const [recentWinners] = useState([
    { name: 'Player1', hand: 'Royal Flush', amount: 2500 },
    { name: 'Player2', hand: 'Four of a Kind', amount: 800 },
    { name: 'Player3', hand: 'Straight Flush', amount: 1200 },
  ]);
  const [isRulesOpen, setIsRulesOpen] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const rulesRef = useRef<HTMLDivElement>(null);

  const scrollToRules = () => {
    rulesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const getBalance = async () => {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    getBalance();
    const intervalId = setInterval(getBalance, 20000);

    return () => clearInterval(intervalId);
  }, [connection, publicKey]);

  useEffect(() => {
    if (isDrawing) {
      let lastUpdate = Date.now();
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastUpdate >= 600) {
          const randomCards = Array(5).fill(null).map(() => {
            const display = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][Math.floor(Math.random() * 13)];
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
            const suit = suits[Math.floor(Math.random() * 4)];
            const cardNumber = display === 'A' ? '01'
              : display === 'J' ? '11'
                : display === 'Q' ? '12'
                  : display === 'K' ? '13'
                    : display.padStart(2, '0');
            return {
              suit,
              display,
              value: display === 'A' ? 14 : display === 'K' ? 13 : display === 'Q' ? 12 : display === 'J' ? 11 : Number(display),
              imagePath: `/assets/${suit.charAt(0).toUpperCase() + suit.slice(1)}-${cardNumber}.png`
            };
          });
          setShufflingCards(() => {
            return randomCards.map((card, index) => ({
              ...card,
              key: Date.now() + index
            }));
          });
          lastUpdate = now;
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isDrawing]);

  const handleStartGame = () => {
    setShowBettingModal(true);
  };

  const handleBetConfirm = useCallback((newBet: number, newRisk: number) => {
    if (!walletBalance || newBet > walletBalance) {
      // Show error toast or message
      return;
    }

    setShowBettingModal(false);
    setIsDrawing(true);
    setBet(newBet);
    setRisk(newRisk);

    setTimeout(() => {
      const hand = game.drawHand();
      const result = game.evaluateHand(hand);
      const winnings = game.calculateWinnings(newBet, newRisk, result);

      setIsDrawing(false);
      setCurrentHand(hand);
      setHandResult(result);
      setBalance(prev => prev + winnings);
    }, 5000);
  }, [walletBalance]);

  const handleBack = useCallback(() => {
    setCurrentHand([]);
    setHandResult(null);
    setShufflingCards([]);
    setIsDrawing(false);
  }, []);

  const goToHomePage = () => {
    navigate('/');
  };

  const renderReadyToPlay = () => {
    return (
      <div className=" min-h-[calc(100vh-5rem)] flex flex-col justify-start  bg-base-100">
        <div className="relative w-full max-w-6xl space-y-12">
          {/* Hero Section with CTA */}
          <div className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 rounded-3xl overflow-hidden">
            {/* Back Button */}
            <button
              onClick={goToHomePage}
              className="absolute rounded-2xl btn-soft z-50 left-4 sm:left-6 top-4 sm:top-6 btn btn-square backdrop-blur-sm hover:bg-base-200/80 transition-all"
            >
              <Icon name="arrowLeft" className="text-xl sm:text-2xl" />
            </button>

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
            <div className="absolute inset-0 z-0 bg-[url('/assets/pattern.png')] opacity-5"></div>
            <div className="absolute -top-24 -right-24 z-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 z-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 text-center space-y-4 sm:space-y-6 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-16">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Ready to Test Your Luck?
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-base-content/60 max-w-2xl mx-auto">
                Place your bet and try to win big with the best poker hands!
              </p>

              {/* Main CTA */}
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                  <button
                    onClick={handleStartGame}
                    className="relative text-nowrap btn btn-primary btn-lg text-xl px-4 py-8 rounded-xl gap-4 group-hover:scale-105 transition-transform duration-300"
                  >
                    <Icon name="game" className="text-3xl" />
                    Place Your Bet & Play Now
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex status status-error size-3"></span>
                      </span>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-base-content/60">
                  <div className="flex items-center gap-2">
                    <Icon name="wallet" className="text-xl" />
                    Min Bet: $10
                  </div>
                  <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Icon name="cup" className="text-xl" />
                    Max Win: 50x
                  </div>
                  <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Icon name="cloudLightning" className="text-xl" />
                    Instant Payouts
                  </div>
                </div>

                {/* Learn More Button */}
                <button
                  onClick={scrollToRules}
                  className="btn btn-outline gap-2 text-base-content/60 hover:text-primary transition-colors"
                >
                  Learn More
                  <Icon name="arrowBottom" className="text-lg animate-bounce" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats stats-vertical sm:stats-horizontal shadow-lg bg-base-200 w-full overflow-x-auto">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Icon name="wallet" className="text-3xl" />
              </div>
              <div className="stat-title">Your Balance</div>
              {publicKey ? (
                <>
                  <div className="stat-value text-primary">{walletBalance?.toFixed(2) || '0'} SOL</div>
                  <div className="stat-desc">Ready to bet</div>
                </>
              ) : (
                <>
                  <div className="stat-value text-error">Not Connected</div>
                  <div className="stat-desc">Connect wallet to play</div>
                </>
              )}
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <Icon name="cup" className="text-3xl" />
              </div>
              <div className="stat-title">Max Multiplier</div>
              <div className="stat-value text-secondary">50x</div>
              <div className="stat-desc">Royal Flush</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <Icon name="game" className="text-3xl" />
              </div>
              <div className="stat-title">Min Bet</div>
              <div className="stat-value text-accent">$10</div>
              <div className="stat-desc">Start small</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-primary">
                <Icon name="crown" className="text-3xl" />
              </div>
              <div className="stat-title">Next Milestone</div>
              <div className="stat-value text-primary">$500</div>
              <div className="stat-desc">
                <progress className="progress progress-primary w-full" value="70" max="100"></progress>
              </div>
            </div>
          </div>

          {/* Winning Hands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all">
              <div className="card-body p-3 sm:p-4">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Royal Flush
                </h3>
                <div className="text-2xl font-bold text-primary">50x</div>
                <p className="text-base-content/60 text-sm">Ace through 10, same suit</p>
                <div className="mt-2 flex -space-x-4">
                  <img src="/assets/Hearts-01.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 " />
                  <img src="/assets/Hearts-13.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Hearts-12.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Hearts-11.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Hearts-10.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all">
              <div className="card-body p-3 sm:p-4">
                <h3 className="card-title text-lg">Straight Flush</h3>
                <div className="text-2xl font-bold text-primary">10x</div>
                <p className="text-base-content/60 text-sm">Five consecutive cards, same suit</p>
                <div className="mt-2 flex -space-x-4">
                  <img src="/assets/Spades-09.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 " />
                  <img src="/assets/Spades-08.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Spades-07.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Spades-06.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Spades-05.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all">
              <div className="card-body p-3 sm:p-4">
                <h3 className="card-title text-lg">Four of a Kind</h3>
                <div className="text-2xl font-bold text-primary">5x</div>
                <p className="text-base-content/60 text-sm">Four cards of same rank</p>
                <div className="mt-2 flex -space-x-4">
                  <img src="/assets/Hearts-07.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 " />
                  <img src="/assets/Diamonds-07.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Clubs-07.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Spades-07.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Hearts-02.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px] opacity-50" />
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all">
              <div className="card-body p-3 sm:p-4">
                <h3 className="card-title text-lg">Full House</h3>
                <div className="text-2xl font-bold text-primary">4x</div>
                <p className="text-base-content/60 text-sm">Three of a kind with a pair</p>
                <div className="mt-2 flex -space-x-4">
                  <img src="/assets/Hearts-04.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 " />
                  <img src="/assets/Diamonds-04.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Clubs-04.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Hearts-09.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                  <img src="/assets/Spades-09.png" className="w-15 h-20 rounded bg-amber-300 shadow-2xl shadow-black border border-white/20 -translate-x-[20px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Winners */}
          <div className="bg-base-200 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="cup" className="text-primary text-2xl" />
              Recent Big Wins
            </h3>
            <div className="space-y-3">
              {recentWinners.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-base-100 rounded-lg animate-slideRight" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-white rounded-full w-8">
                        <span className="text-xs">{winner.name.charAt(0)}</span>
                      </div>
                    </div>
                    <span className="font-semibold">{winner.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-base-content/60">{winner.hand}</div>
                    <div className="text-success font-bold">+${winner.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Rules Collapse */}
          <div ref={rulesRef} className="bg-base-200 rounded-xl overflow-hidden">
            <div tabIndex={0} className="collapse">
              <input
                type="checkbox"
                checked={isRulesOpen}
                onChange={(e) => setIsRulesOpen(e.target.checked)}
              />
              <div className="collapse-title p-6 flex items-center gap-3 text-xl font-bold">
                <Icon name="book" className="text-primary text-2xl" />
                How to Play & Rules
                <Icon name="arrowBottom" className="ml-auto text-base-content/40" />
              </div>
              <div className="collapse-content bg-base-100/50 backdrop-blur-sm p-6 space-y-6">
                {/* Main Rules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Icon name="cup" className="text-primary" />
                    Game Objective
                  </h3>
                  <p className="text-base-content/70">
                    Get the best poker hand possible from the five cards dealt to you. Better hands mean higher multipliers!
                  </p>
                </div>

                {/* Winning Hands Table */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Hand</th>
                        <th>Description</th>
                        <th className="text-right">Multiplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-bold text-primary">Royal Flush</td>
                        <td>A, K, Q, J, 10 of the same suit</td>
                        <td className="text-right font-bold">50x</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-primary">Straight Flush</td>
                        <td>Five consecutive cards of the same suit</td>
                        <td className="text-right font-bold">10x</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-primary">Four of a Kind</td>
                        <td>Four cards of the same rank</td>
                        <td className="text-right font-bold">5x</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-primary">Full House</td>
                        <td>Three of a kind plus a pair</td>
                        <td className="text-right font-bold">4x</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-primary">Flush</td>
                        <td>Any five cards of the same suit</td>
                        <td className="text-right font-bold">3x</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-primary">Straight</td>
                        <td>Five consecutive cards of any suit</td>
                        <td className="text-right font-bold">2x</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-primary">Three of a Kind</td>
                        <td>Three cards of the same rank</td>
                        <td className="text-right font-bold">1.5x</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* How to Play Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Icon name="message" className="text-primary" />
                    How to Play
                  </h3>
                  <ul className="steps steps-vertical">
                    <li className="step step-primary">Place your bet (minimum $10)</li>
                    <li className="step step-primary">Choose your risk level (0.5x - 2.0x)</li>
                    <li className="step step-primary">Get dealt 5 random cards</li>
                    <li className="step step-primary">Win based on your hand's value!</li>
                  </ul>
                </div>

                {/* Risk Level Info */}
                <div className="alert bg-base-200/50">
                  <Icon name="information" className="text-primary text-2xl" />
                  <div>
                    <h4 className="font-bold">Risk Level Explained</h4>
                    <p className="text-sm text-base-content/70">
                      Higher risk levels increase both potential wins and losses. A 2x risk level doubles both your possible winnings and losses!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 justify-center">
            <button className="btn btn-ghost btn-circle btn-lg">
              <Icon name="history" className="text-2xl" />
            </button>
            <button className="btn btn-ghost btn-circle btn-lg">
              <Icon name="settings" className="text-2xl" />
            </button>
            <button className="btn btn-ghost btn-circle btn-lg">
              <Icon name="documentText" className="text-2xl" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-base-content/60 text-sm">
            <p>Minimum bet: $10 • Maximum risk level: 2.0x • Instant payouts</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <div className="w-full max-w-6xl mx-auto  flex-1 flex flex-col">
        {/* Balance Header */}

        {/* Ready to Play */}
        {!currentHand.length && !isDrawing && renderReadyToPlay()}

        {/* Shuffling Animation */}
        {isDrawing && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Background Cards */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-32 h-44 top-20 left-20 rotate-[-15deg] opacity-20 animate-float-1">
                <img src="/assets/Spades-01.png" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="absolute w-32 h-44 bottom-40 right-20 rotate-[25deg] opacity-20 animate-float-2">
                <img src="/assets/Hearts-01.png" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="absolute w-32 h-44 top-40 right-40 rotate-[-35deg] opacity-20 animate-float-3">
                <img src="/assets/Clubs-01.png" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
              {/* Title Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-base-200/50 rounded-2xl backdrop-blur-sm">

                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                    Shuffling Your Cards
                  </h2>
                </div>
              </div>

              {/* Cards Dealing Animation */}
              <div className="relative h-[300px] mb-16">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[300px]">
                    {shufflingCards.map((card, index) => (
                      <div
                        key={card.key}
                        className="absolute left-1/2 top-1/2 w-36 h-52 transition-all duration-700 ease-out"
                        style={{
                          transform: `translate(-50%, -50%) translateX(${(index - 2) * 60}px) rotate(${(index - 2) * 5}deg)`,
                          opacity: 1,
                          zIndex: index,
                          transitionDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur-md"></div>
                          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                            <div className="absolute inset-0 bg-base-100"></div>
                            <img
                              src={card.imagePath}
                              alt="Shuffling"
                              className="relative z-10 w-full h-full object-cover animate-card-change"
                              style={{
                                animationDelay: `${index * 0.1}s`,
                                backfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d',
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="text-center space-y-8">
                <div className="flex flex-col items-center gap-3 px-6 py-3 bg-base-200/50 backdrop-blur-sm rounded-full">
                  <div className='flex items-center gap-3'>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <p className="text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Finding your lucky combination...
                    </p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-64 mx-auto">
                    {/* <span className="text-4xl">🎲</span> */}
                    <div className="h-1 w-full bg-base-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <div className="h-full w-full bg-gradient-to-r from-primary to-secondary rounded-full animate-progressLine"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Final Hand Display */}
        {currentHand.length > 0 && !isDrawing && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 ">
            {/* Result Hero Section */}
            {handResult && (
              <div className="relative w-full max-w-4xl mx-auto bg-base-200 rounded-3xl p-2 py-4 md:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
                {handResult.multiplier > 0 ? (
                  <>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-success/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-success/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </>
                ) : (
                  <>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-error/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-error/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </>
                )}

                <div className="relative text-center space-y-6 animate-slideDown">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {handResult.type}
                  </h2>

                  {handResult.multiplier > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className='text-4xl'>🤩</span>
                        <span className="text-3xl font-bold text-success">
                          You Won ${(handResult.multiplier * bet * (1 + risk)).toFixed(2)}!
                        </span>
                      </div>
                      <div className="stats bg-base-100 shadow inline-flex">
                        <div className="stat">
                          <div className="stat-title">Multiplier</div>
                          <div className="stat-value text-success">{handResult.multiplier}x</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Risk Level</div>
                          <div className="stat-value text-primary">{risk}x</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Total Bet</div>
                          <div className="stat-value">${bet}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className='text-4xl'>😥</span>
                        <span className="text-3xl text-start font-bold text-error">
                          Better luck next time!
                        </span>
                      </div>
                      <p className="text-base-content/60">
                        You lost ${bet}. Try again with a different strategy!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cards Display */}
            <div className="relative w-full max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 rounded-3xl blur-3xl"></div>
              <div className="relative flex flex-wrap gap-2 sm:gap-4 justify-center py-4 sm:py-8">
                {currentHand.map((card, index) => (
                  <div
                    key={index}
                    className="w-5 sm:w-36 -translate-x-12 -translate-y-12 md:-translate-x-0 md:-translate-y-0 md:w-40 h-44 sm:h-48 md:h-56 relative group"
                    style={{
                      transform: `rotate(${(index - 2) * 5}deg)`,
                      transition: 'all 0.3s ease',
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all"></div>
                    <div className="w-40 h-56 relative transform group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-300">
                      <div className="absolute inset-0 bg-base-100 rounded-2xl shadow-lg"></div>
                      <img
                        src={card.imagePath}
                        alt={`${card.display} of ${card.suit}`}
                        className="relative z-10 w-full h-full object-cover rounded-2xl animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-6 text-center animate-slideUp">
              <div className="flex flex-col gap-4 justify-center items-center">
                <button
                  onClick={handleStartGame}
                  className="btn btn-primary btn-lg gap-3 px-8  w-full md:w-sm"
                >
                  <Icon name="refresh" className="text-2xl" />
                  Try Your Luck Again
                </button>

                <button
                  onClick={handleBack}
                  className="btn btn-outline btn-lg gap-3 px-8  w-full md:w-sm"
                >
                  <Icon name="backSquare" className="text-2xl" />
                  Back
                </button>

              </div>

              <div className="stats-vertical md:stats bg-base-200 shadow">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <Icon name="wallet" className="text-3xl" />
                  </div>
                  <div className="stat-title">Current Balance</div>
                  <div className="stat-value text-primary">${balance}</div>
                  <div className="stat-desc">Updated just now</div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <Icon name="game" className="text-3xl" />
                  </div>
                  <div className="stat-title">Last Bet</div>
                  <div className="stat-value">${bet}</div>
                  <div className="stat-desc">Risk: {risk}x</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Betting Modal */}
        <BettingModal
          isOpen={showBettingModal}
          onClose={() => setShowBettingModal(false)}
          onConfirm={handleBetConfirm}
          balance={balance}
        />
      </div>
    </div>
  );
};

export default GamePage;