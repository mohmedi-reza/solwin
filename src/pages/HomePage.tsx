import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/icon/icon.component";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const gameCards = [
    { id: 1, title: "Crashbiling", status: "Active", image: "cover-1.png" },
    { id: 2, title: "RocketPlay", status: "Trend", image: "cover-1.png" },
    { id: 3, title: "SpeedBet", status: "Popular", image: "cover-2.png" },
    { id: 4, title: "MegaJackpot", status: "Trend", image: "cover-3.png" },
    { id: 5, title: "LuckySpin", status: "Trend", image: "cover-1.png" },
    { id: 6, title: "FortuneWheel", status: "Popular", image: "cover-1.png" },
  ];

  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredCards =
    selectedFilter === "All"
      ? gameCards
      : gameCards.filter((card) => card.status === selectedFilter);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative mt-6 h-[180px] bg-gradient-to-r from-base-200/80 via-base-100/40 to-base-200/80 backdrop-blur-sm rounded-3xl mb-8 border border-base-content/20 shadow-[0_0_15px_rgba(var(--primary),0.15)] hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-shadow overflow-hidden">
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
        <div className="relative z-10 h-full flex items-center px-8">
          <div className="flex-1 flex items-center justify-between max-w-6xl mx-auto">
            {/* Left Side */}
            <div className="space-y-3 max-w-xl">
              <h1 className="text-4xl font-bold drop-shadow-sm">
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
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-ping"></div>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end gap-4">
       
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm backdrop-blur-sm px-4 py-2 rounded-full bg-base-content/5 shadow-[inset_0_2px_4px_rgba(var(--primary),0.1)]">
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

      {/* Rest of the content */}
      <div className="min-w-0 w-full space-y-5">

        {/* <img
          src="header-1.png"
          alt=""
          className="w-full rounded-4xl border border-white/20"
        /> */}

        <div className="text-start mt-12">
          <h1 className="text-3xl font-extrabold">Game List</h1>
          <span>
            Cupidatat ut quis labore elit in voluptate non mollit id nisi
            adipisicing reprehenderit aliqua.
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className={`badge badge-outline cursor-pointer hover:badge-accent  ${selectedFilter === "All" ? "badge-primary" : ""
              }`}
            onClick={() => setSelectedFilter("All")}
          >
            All
          </button>
          <button
            className={`badge badge-outline cursor-pointer hover:badge-accent  ${selectedFilter === "Active" ? "badge-primary" : ""
              }`}
            onClick={() => setSelectedFilter("Active")}
          >
            Active
          </button>
          <button
            className={`badge badge-outline cursor-pointer hover:badge-accent  ${selectedFilter === "Trend" ? "badge-primary" : ""
              }`}
            onClick={() => setSelectedFilter("Trend")}
          >
            Trend
          </button>
          <button
            className={`badge badge-outline cursor-pointer hover:badge-accent  ${selectedFilter === "Popular" ? "badge-primary" : ""
              }`}
            onClick={() => setSelectedFilter("Popular")}
          >
            Popular
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <div key={card.id} className="card bg-base-100 image-full w-100 p-0">
              <figure>
                <img className="object-cover" src={card.image} alt={card.title} />
              </figure>
              <div className="card-body text-white text-start">
                <h2
                  className={`card-title text-2xl ${card.status === "Active" ? " text-white" : ""
                    }`}
                >
                  {card.title}
                </h2>
                <p className={`${card.status === "Active" ? " text-white" : ""}`}>
                  A card component has a figure, a body part, and inside body
                  there are title and actions parts
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    disabled={card.status !== "Active" ? true : false}
                    onClick={() => navigate(`/game?id=${card.id}`)}
                  >
                    {card.status === "Active" && (
                      <span className="status status-error animate-ping"></span>
                    )}
                    <span className="">Play Now!</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
