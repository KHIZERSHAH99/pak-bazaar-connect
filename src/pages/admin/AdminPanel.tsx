
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRoleRequests, approveRoleRequest } from "@/lib/supabase";

const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getRoleRequests();
        setRequests(data);
      } catch (error) {
        setRequests([]);
      }
      setLoading(false);
    })();
  }, []);

  const handleApprove = async (requestId: string) => {
    await approveRoleRequest(requestId);
    setRequests((requests) => requests.filter((r) => r.id !== requestId));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-poppins font-semibold mb-5">Role Requests</h1>
      <Card>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No role requests.</div>
        ) : (
          <ul>
            {requests.map((r) => (
              <li key={r.id} className="flex justify-between items-center p-4 border-b">
                <div>
                  <div className="font-poppins font-medium">{r.user_id}</div>
                  <span className="text-sm text-gray-600">Role: {r.requested_role}</span>
                </div>
                <Button size="sm" onClick={() => handleApprove(r.id)}>
                  Approve
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
export default AdminPanel;
