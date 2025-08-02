import React from 'react';
import HilTopBanner from './HilTopBanner';
import SimpleAdBanner from './SimpleAdBanner';

const LeaderboardAdBanner: React.FC = () => {
  return (
    <div className="flex justify-center w-full">
      <SimpleAdBanner adType="leaderboard" />
    </div>
  );
};

export default LeaderboardAdBanner;