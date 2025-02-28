import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/icon/icon.component";
import WalletModal from "../components/WalletModal";

interface GameCardStats {
  minBet: number;
  maxWin: string;
  players: number;
}

interface GameCard {
  id: number;
  title: string;
  description?: string;
  status: "Active" | "Trend" | "Popular";
  image: string;
  stats: GameCardStats;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const gameCards: GameCard[] = [
    {
      id: 1,
      title: "Video Poker",
      description: "Test your luck with poker hands and win up to 50x multiplier!",
      status: "Active",
      image: "cover-1.png",
      stats: {
        minBet: 10,
        maxWin: "50x",
        players: 1205
      }
    },
    {
      id: 2,
      title: "Duel Game",
      description: "Challenge other players in 1v1 duels with custom stakes",
      status: "Active",
      image: "cover-2.png",
      stats: {
        minBet: 5,
        maxWin: "2x",
        players: 856
      }
    },
    {
      id: 3,
      title: "SpeedBet",
      description: "Fast-paced betting game with multipliers",
      status: "Popular",
      image: "cover-6.png",
      stats: { minBet: 5, maxWin: "25x", players: 645 }
    },
    {
      id: 4,
      title: "MegaJackpot",
      status: "Trend",
      image: "cover-3.png",
      description: "Mega jackpot with progressive multipliers",
      stats: { minBet: 20, maxWin: "200x", players: 432 }
    },
    {
      id: 5,
      title: "LuckySpin",
      status: "Trend",
      image: "cover-4.png",
      description: "Spin the wheel of fortune",
      stats: { minBet: 1, maxWin: "20x", players: 890 }
    },
    {
      id: 6,
      title: "FortuneWheel",
      status: "Popular",
      image: "cover-5.png",
      description: "Classic fortune wheel with bonuses",
      stats: { minBet: 5, maxWin: "15x", players: 567 }
    }
  ];

  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredCards =
    selectedFilter === "All"
      ? gameCards
      : gameCards.filter((card) => card.status === selectedFilter);

  // Add effect to fetch wallet balance
  useEffect(() => {
    const fetchAndUpdateBalance = async () => {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      }
    };

    // Initial fetch
    fetchAndUpdateBalance();
  }, [publicKey, connection]);

  // Add handler for wallet operation success
  const handleWalletOperationSuccess = async () => {
    if (publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-20">
        {/* Hero Banner */}
        <div className="relative mt-4 sm:mt-6 lg:mt-8 h-auto sm:h-[180px] py-4 sm:py-6 lg:py-0 bg-gradient-to-r from-base-200/80 via-base-100/40 to-base-200/80 backdrop-blur-sm rounded-3xl mb-8 border border-base-content/20 shadow-[0_0_15px_rgba(var(--primary),0.15)] hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-shadow overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-3xl"></div>

          {/* Animated Shapes */}
          <div className="absolute inset-0 rounded-3xl">
            {/* Circles */}
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-float-1"></div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl animate-float-2"></div>

            {/* Decorative Lines */}
            <div className="absolute top-1/4 left-1/4 w-32 h-[1px] bg-gradient-to-r from-primary/20 to-transparent rotate-45"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-[1px] bg-gradient-to-l from-secondary/20 to-transparent -rotate-45"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-3 sm:px-6 lg:px-8">
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
              {/* Left Side */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 max-w-xl text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-sm">
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                    SolWin
                  </span>
                  <span className="text-base-content/80 text-lg ml-3 font-normal">
                    Instant Poker Games
                  </span>
                </h1>
                <p className="text-base text-base-content/70 backdrop-blur-sm font-medium">
                  Experience the thrill of poker with instant payouts and up to 50x multipliers
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/game"
                    className="btn btn-primary gap-2 px-6 group relative hover:scale-105 transition-all shadow-[0_4px_12px_rgba(var(--primary),0.25)] hover:shadow-[0_6px_16px_rgba(var(--primary),0.35)]"
                  >
                    <Icon name="game" className="text-xl group-hover:rotate-12 transition-transform" />
                    <span className="font-bold">Play Now</span>
                  </Link>
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="btn btn-primary btn-outline gap-2 px-6 group relative hover:scale-105 transition-all"
                  >
                    <Icon name="wallet" className="text-xl group-hover:rotate-12 transition-transform" />
                    <span className="font-bold">Deposit</span>
                    <span className="absolute -top-1 -right-1 status status-error size-2 animate-ping"></span>
                  </button>
                </div>
              </div>

              {/* Right Side Stats - Stack on mobile */}
              <div className="flex flex-col items-center sm:items-end gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-center sm:justify-end">
                  <div className="flex items-center gap-1.5 text-base-content/80 font-medium">
                    <Icon name="wallet" className="text-lg text-primary drop-shadow" />
                    Min: $10
                  </div>
                  <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                  <div className="flex items-center gap-1.5 text-base-content/80 font-medium">
                    <Icon name="cup" className="text-lg text-secondary drop-shadow" />
                    Max: 50x
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game List Section */}
        <div className="w-full space-y-4 sm:space-y-5 lg:space-y-6 mt-6 sm:mt-8 lg:mt-10">
          {/* Header and Filter Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-start w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">Game List</h1>
              <span className="text-sm sm:text-base text-base-content/70">
                Cupidatat ut quis labore elit in voluptate non mollit
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
              {["All", "Active", "Trend", "Popular"].map((filter) => (
                <button
                  key={filter}
                  className={`badge badge-lg badge-outline whitespace-nowrap ${selectedFilter === filter ? "badge-primary" : ""
                    }`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Game Cards Grid - Better responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredCards.map((card) => (
              <div key={card.id} className="card bg-base-200 border border-white/15 hover:scale[1.2] rounded-3xl hover:shadow-xl transition-all flex flex-col min-h-[400px]  overflow-hidden">
                {/* Game Image - Simplified structure */}
                <div className="relative h-36 sm:h-40 lg:h-48">
                  {/* Base gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent z-10"></div>

                  {/* Accent color overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 mix-blend-overlay"></div>

                  {/* Dynamic accent overlay based on status */}
                  <div className={`absolute inset-0 ${card.status === "Active" ? "bg-success/5" :
                    card.status === "Trend" ? "bg-secondary/5" :
                      "bg-accent/5"
                    } mix-blend-overlay`}></div>

                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Status indicators */}
                  {card.status === "Active" ? (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-base-100/50 backdrop-blur-[2px] z-10"></div>
                  )}
                </div>

                {/* Content section */}
                <div className="flex flex-col flex-1 p-4">
                  <div className="flex-1 space-y-3">
                    {/* Title and status */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg sm:text-xl font-bold">{card.title}</h3>
                      <span className={`badge ${card.status === "Active"
                        ? "badge-success"
                        : "badge-outline opacity-50 bg-base-200"
                        }`}>
                        {card.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-base-content/70">
                      {card.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Icon name="wallet" className="text-primary" />
                        <span>{card.status === "Active" ? `$${card.stats.minBet}` : "--"}</span>
                      </div>
                      <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="cup" className="text-secondary" />
                        <span>{card.status === "Active" ? card.stats.maxWin : "--"}</span>
                      </div>
                      <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="user" className="text-accent" />
                        <span>{card.status === "Active" ? card.stats.players : "--"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(card.id === 2 ? '/duel' : `/game?id=${card.id}`)}
                      disabled={card.status !== "Active"}
                      className="w-full btn btn-primary"
                    >
                      <Icon name="game" />
                      {card.status === "Active" ? "Play Now" : "Coming Soon"}
                      {card.status === "Active" && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 status status-error rounded-full animate-ping"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="w-full bg-base-200/50 rounded-3xl p-6 sm:p-8 lg:p-10 mt-8 border border-base-content/10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-base-content/70">Start playing in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card bg-base-100/50 hover:bg-base-100/80 transition-colors border border-base-content/10">
              <div className="card-body items-center text-center relative">
                {/* <div className="badge badge-primary absolute -top-3">Step 1</div> */}
                <Icon name="wallet" className="text-4xl text-primary mb-4" />
                <h3 className="card-title">Connect Wallet</h3>
                <p className="text-base-content/70">Connect your Solana wallet with just one click</p>
                <div className="card-actions justify-end mt-4">

                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card bg-base-100/50 hover:bg-base-100/80 transition-colors border border-base-content/10">
              <div className="card-body items-center text-center relative">
                {/* <div className="badge badge-primary absolute -top-3">Step 2</div> */}
                <Icon name="solana" className="text-4xl text-primary mb-4" />
                <h3 className="card-title">Deposit SOL</h3>
                <p className="text-base-content/70">Fund your account with SOL tokens instantly</p>
                <div className="card-actions justify-end mt-4">

                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card bg-base-100/50 hover:bg-base-100/80 transition-colors border border-base-content/10">
              <div className="card-body items-center text-center relative">
                {/* <div className="badge badge-primary absolute -top-3">Step 3</div> */}
                <Icon name="game" className="text-4xl text-primary mb-4" />
                <h3 className="card-title">Start Playing</h3>
                <p className="text-base-content/70">Choose your game and start winning</p>
                <div className="card-actions justify-end mt-4">
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* Trust Section - Add this before Game List */}
        <div className="w-full bg-base-200/50 rounded-3xl p-6 sm:p-8 lg:p-10 mt-8 border border-base-content/10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left side with Chainlink VRF info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <img src="Chainlink-VRF.png" alt="Chainlink VRF" className="w-100 drop-shadow-sm" />
                <h2 className="text-2xl sm:text-3xl font-bold">Provably Fair Gaming</h2>
              </div>
              <p className="text-base-content/80 leading-relaxed">
                SolWin ensures complete fairness in all games using Chainlink's Verifiable Random Function (VRF).
                This cryptographically secure randomness guarantees that:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Icon name="check" className="text-success" />
                  <span>Every game outcome is completely random and verifiable</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check" className="text-success" />
                  <span>Results cannot be manipulated by anyone, including us</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check" className="text-success" />
                  <span>All randomness is verified on-chain for transparency</span>
                </li>
              </ul>
            </div>

            {/* Right side with stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="stat bg-base-300/50 rounded-2xl p-4">
                <div className="stat-title text-base-content/60">Total Games</div>
                <div className="stat-value text-primary">25K+</div>
                <div className="stat-desc">Last 30 days</div>
              </div>
              <div className="stat bg-base-300/50 rounded-2xl p-4">
                <div className="stat-title text-base-content/60">Paid Out</div>
                <div className="stat-value text-secondary">$850K</div>
                <div className="stat-desc">In SOL tokens</div>
              </div>
              <div className="stat bg-base-300/50 rounded-2xl p-4">
                <div className="stat-title text-base-content/60">Players</div>
                <div className="stat-value text-accent">12K+</div>
                <div className="stat-desc">Active users</div>
              </div>
              <div className="stat bg-base-300/50 rounded-2xl p-4">
                <div className="stat-title text-base-content/60">Success Rate</div>
                <div className="stat-value text-success">99.9%</div>
                <div className="stat-desc">Transaction success</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
          <div className="card bg-base-200 border border-base-content/10">
            <div className="card-body">
              <Icon name="shield" className="text-3xl text-primary mb-2" />
              <h3 className="card-title">Secure & Fast</h3>
              <p className="text-base-content/70">
                Built on Solana for lightning-fast transactions and military-grade security
              </p>
            </div>
          </div>
          <div className="card bg-base-200 border border-base-content/10">
            <div className="card-body">
              <Icon name="wallet" className="text-3xl text-secondary mb-2" />
              <h3 className="card-title">Instant Payouts</h3>
              <p className="text-base-content/70">
                Receive your winnings instantly in your wallet with minimal fees
              </p>
            </div>
          </div>
          <div className="card bg-base-200 border border-base-content/10">
            <div className="card-body">
              <Icon name="call" className="text-3xl text-accent mb-2" />
              <h3 className="card-title">24/7 Support</h3>
              <p className="text-base-content/70">
                Our support team is always available to help with any questions
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="w-full space-y-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-6 sm:p-8 lg:p-10 mt-8 mb-8 border border-base-content/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Stay Updated</h2>
              <p className="text-base-content/70">Get the latest news and special offers directly to your inbox</p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <input type="email" placeholder="Enter your email" className="input input-bordered w-full lg:w-80" />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>

      </div>

      {/* Add WalletModal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletBalance={walletBalance}
        onSuccess={handleWalletOperationSuccess}
      />
    </div>
  );
};

export default HomePage;
