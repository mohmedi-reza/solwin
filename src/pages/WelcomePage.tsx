import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/icon/icon.component';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Poker Card Game
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the thrill of poker with our unique betting system. 
          Test your luck and strategy with dynamic risk levels and amazing rewards!
        </p>
      </div>

      {/* Game Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Icon name="game" className="text-4xl text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Dynamic Risk Levels</h3>
          <p className="text-gray-600">
            Choose your risk level from 0.5x to 2.0x to customize your potential rewards
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Icon name="wallet" className="text-4xl text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Instant Payouts</h3>
          <p className="text-gray-600">
            Win big with multipliers up to 50x on Royal Flush hands
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Icon name="game" className="text-4xl text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Fair Gaming</h3>
          <p className="text-gray-600">
            Provably fair system ensures complete transparency and fairness
          </p>
        </div>
      </div>

      {/* Winning Hands */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Winning Hands & Rewards</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Royal Flush</h4>
            <p className="text-primary font-bold">50x Multiplier</p>
            <p className="text-sm text-gray-600">Ace through 10, same suit</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Straight Flush</h4>
            <p className="text-primary font-bold">10x Multiplier</p>
            <p className="text-sm text-gray-600">Five consecutive cards, same suit</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Four of a Kind</h4>
            <p className="text-primary font-bold">5x Multiplier</p>
            <p className="text-sm text-gray-600">Four cards of the same rank</p>
          </div>
          {/* Add more hands... */}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6">
        <button
          onClick={() => navigate('/game')}
          className="btn btn-primary btn-lg gap-2 text-xl"
        >
          <Icon name="game" className="text-2xl" />
          Start Playing Now
        </button>
        <p className="text-sm text-gray-500">
          Minimum bet: $10 • Maximum risk level: 2.0x
        </p>
      </div>
    </div>
  );
};

export default WelcomePage; 