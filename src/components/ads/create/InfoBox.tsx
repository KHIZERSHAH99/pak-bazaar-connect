
import React from 'react';
import { Info } from 'lucide-react';

const InfoBox: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How Cost Per Order (CPO) Works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>You only pay when customers place orders through your ad</li>
            <li>Campaign stops automatically when budget or time limit is reached</li>
            <li>You'll receive notifications when campaigns end</li>
            <li>Track performance in real-time through your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
