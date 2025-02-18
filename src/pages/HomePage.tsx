import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/icon/icon.component";

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
      title: "RocketPlay",
      description: "Crash game with real-time multipliers and instant cashouts",
      status: "Trend", 
      image: "cover-2.png",
      stats: {
        minBet: 5,
        maxWin: "100x",
        players: 856
      }
    },
    { 
      id: 3, 
      title: "SpeedBet",
      description: "Fast-paced betting game with multipliers",
      status: "Popular", 
      image: "cover-2.png",
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
      image: "cover-1.png",
      description: "Spin the wheel of fortune",
      stats: { minBet: 1, maxWin: "20x", players: 890 }
    },
    { 
      id: 6, 
      title: "FortuneWheel", 
      status: "Popular", 
      image: "cover-1.png",
      description: "Classic fortune wheel with bonuses",
      stats: { minBet: 5, maxWin: "15x", players: 567 }
    }
  ];

  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredCards =
    selectedFilter === "All"
      ? gameCards
      : gameCards.filter((card) => card.status === selectedFilter);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        {/* Hero Banner */}
        <div className="relative mt-4 sm:mt-6 lg:mt-8 h-auto sm:h-[180px] py-4 sm:py-6 lg:py-0 bg-gradient-to-r from-base-200/80 via-base-100/40 to-base-200/80 backdrop-blur-sm rounded-3xl mb-8 border border-base-content/20 shadow-[0_0_15px_rgba(var(--primary),0.15)] hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-shadow overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"></div>

          {/* Animated Shapes */}
          <div className="absolute inset-0">
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
                    RocketBet
                  </span>
                  <span className="text-base-content/80 text-lg ml-3 font-normal">
                    Instant Poker Games
                  </span>
                </h1>
                <p className="text-base text-base-content/70 backdrop-blur-sm font-medium">
                  Experience the thrill of poker with instant payouts and up to 50x multipliers
                </p>
                <Link
                  to="/game"
                  className="btn btn-primary gap-2 px-6 group relative hover:scale-105 transition-all shadow-[0_4px_12px_rgba(var(--primary),0.25)] hover:shadow-[0_6px_16px_rgba(var(--primary),0.35)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-20 transition-opacity rounded-lg"></div>
                  <Icon name="game" className="text-xl group-hover:rotate-12 transition-transform" />
                  <span className="font-bold">Play Now</span>
                  <div className="absolute -top-1 -right-1 status status-error size-2 animate-ping"></div>
                </Link>
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
                  className={`badge badge-lg badge-outline whitespace-nowrap ${
                    selectedFilter === filter ? "badge-primary" : ""
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
              <div key={card.id} className="card backdrop-blur-md rounded-2xl sm:rounded-3xl bg-base-200 hover:shadow-xl transition-all">
                {/* Game Image - Adjust height for mobile */}
                <div className="relative h-36 sm:h-40 lg:h-48">
                  <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent"></div>
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-100 rounded-2xl  h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  {card.status === "Active" && (
                    <div className="absolute top-4 right-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content - Better padding on mobile */}
                <div className="h-full p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold">{card.title}</h3>
                    <span className={`badge ${
                      card.status === "Active" ? "badge-success" : 
                      card.status === "Trend" ? "badge-secondary" : 
                      "badge-accent"
                    }`}>
                      {card.status}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-base-content/70 line-height-3">
                    {card.description}
                  </p>

                  {/* Stats - Wrap on small screens */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="wallet" className="text-primary" />
                      <span>${card.stats.minBet}</span>
                    </div>
                    <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                    <div className="flex items-center gap-1">
                      <Icon name="cup" className="text-secondary" />
                      <span>{card.stats.maxWin}</span>
                    </div>
                    <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                    <div className="flex items-center gap-1">
                      <Icon name="user" className="text-accent" />
                      <span>{card.stats.players}</span>
                    </div>
                  </div>

                  {/* Action Button - حذف z-index */}
                  <button
                    onClick={() => navigate(`/game?id=${card.id}`)}
                    disabled={card.status !== "Active"}
                    className="w-full relative btn btn-primary py-3 btn-sm sm:btn-md lg:btn-lg"
                  >
                    <Icon name="game" />
                    {card.status === "Active" ? "Play Now" : "Coming Soon"}
                    {card.status === "Active" && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 status status-error rounded-full animate-ping"></div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
