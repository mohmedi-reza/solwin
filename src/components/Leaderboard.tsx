import React, { useState } from 'react';
import Icon from './icon/icon.component';
import AddressShort from './AddressShort';
import { AggregatedLeaderboardEntry, LeaderboardEntry } from '../types/leaderboard.interface';

interface LeaderboardProps {
  recentData: LeaderboardEntry[];
  topData: AggregatedLeaderboardEntry[];
  isLoadingRecent: boolean;
  isLoadingTop: boolean;
  hasMoreRecent: boolean;
  hasMoreTop: boolean;
  recentRef: (node?: Element | null) => void;
  topRef: (node?: Element | null) => void;
}

type TabType = 'recent' | 'top';

const Leaderboard: React.FC<LeaderboardProps> = ({
  recentData,
  topData,
  isLoadingRecent,
  isLoadingTop,
  hasMoreRecent,
  hasMoreTop,
  recentRef,
  topRef,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recent');

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <div className="badge badge-primary gap-1">🥇 1st</div>;
      case 2:
        return <div className="badge badge-secondary gap-1">🥈 2nd</div>;
      case 3:
        return <div className="badge badge-accent gap-1">🥉 3rd</div>;
      default:
        return <div className="badge badge-ghost">{rank}th</div>;
    }
  };

  return (
    <div className="bg-base-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Icon name="crown" className="text-primary text-2xl" />
          Leaderboard
        </h3>
        <div className="tabs tabs-boxed">
          <button 
            className={`tab ${activeTab === 'recent' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Wins
          </button>
          <button 
            className={`tab ${activeTab === 'top' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            Top Players
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === 'recent' ? (
          <>
            {recentData.map((winner, index) => (
              <div 
                key={`${winner.pdaAddress}-${index}`} 
                className="bg-base-100 rounded-lg p-4 hover:bg-base-200 transition-colors animate-slideRight"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="avatar placeholder">
                      <div className="bg-primary flex items-center justify-center text-white rounded-full p-2">
                        <Icon className='text-xl' name="userTick" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <AddressShort address={winner.pdaAddress} />
                      </div>
                      <div className="text-sm text-base-content/60">
                        {winner.gameHistory.handType}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${winner.gameHistory.winnings > 0 ? 'text-success' : 'text-error'}`}>
                      {winner.gameHistory.winnings > 0 ? '+' : ''}{winner.gameHistory.winnings.toFixed(3)} SOL
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={recentRef} className="py-4 text-center">
              {isLoadingRecent ? (
                <div className="loading loading-spinner loading-md"></div>
              ) : hasMoreRecent ? (
                <span className="text-base-content/60">Loading more...</span>
              ) : (
                <span className="text-base-content/60">No more wins to load</span>
              )}
            </div>
          </>
        ) : (
          <>
            {topData.map((player) => (
              <div 
                key={player.pdaAddress}
                className="bg-base-100 rounded-lg p-4 hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getRankBadge(player.rank || 0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <AddressShort address={player.pdaAddress} />
                        <div className="badge badge-sm">{player.gamesPlayed} games</div>
                      </div>
                      <div className="text-sm text-base-content/60 mt-1">
                        Best Hand: <span className="text-primary">{player.bestHand.handType}</span>
                        <span className="text-success ml-2">
                          +{player.bestHand.winnings.toFixed(3)} SOL
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {player.totalWinnings.toFixed(3)} SOL
                    </div>
                    <div className="text-xs text-base-content/60">
                      Total Winnings
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={topRef} className="py-4 text-center">
              {isLoadingTop ? (
                <div className="loading loading-spinner loading-md"></div>
              ) : hasMoreTop ? (
                <span className="text-base-content/60">Loading more...</span>
              ) : (
                <span className="text-base-content/60">No more players to load</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 