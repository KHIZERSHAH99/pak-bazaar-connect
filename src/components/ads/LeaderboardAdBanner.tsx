import React from 'react';
import HilTopBanner from './HilTopBanner';

const LeaderboardAdBanner: React.FC = () => {
  return (
    <div className="flex justify-center w-full">
      <HilTopBanner adType="leaderboard" />
    </div>
  );
};

export default LeaderboardAdBanner;