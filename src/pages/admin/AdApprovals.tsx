
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPendingAds, approveAd } from "@/lib/supabase";
import { BadgeCheck, Trash2 } from "lucide-react";

const AdApprovals: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const data = await getPendingAds();
        setAds(data || []);
      } catch (error) {
        setAds([]);
      }
      setLoading(false);
    };
    fetchAds();
  }, []);

  const handleApprove = async (adId: string) => {
    await approveAd(adId, 'approved');
    setAds((ads) => ads.filter((ad) => ad.id !== adId));
  };
  const handleReject = async (adId: string) => {
    await approveAd(adId, 'rejected');
    setAds((ads) => ads.filter((ad) => ad.id !== adId));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-poppins font-semibold mb-5">Pending Ad Approvals</h1>
      <Card>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : ads.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No pending ads.</div>
        ) : (
          <div>
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between p-4 border-b">
                <div>
                  <div className="font-bold">{ad.headline}</div>
                  <div className="text-sm text-gray-600">{ad.status}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600" onClick={() => handleApprove(ad.id)}>
                    <BadgeCheck className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(ad.id)}>
                    <Trash2 className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdApprovals;
