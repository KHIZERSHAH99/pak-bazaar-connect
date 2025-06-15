
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { getOrdersForWholesaler } from "@/lib/orders";
import { ShoppingCart } from "lucide-react";

const WholesalerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrdersForWholesaler();
        setOrders(data || []);
      } catch (e) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-2 py-8">
        <div className="flex items-center mb-6">
          <ShoppingCart className="h-6 w-6 mr-2 text-pakistani_green-700" />
          <h1 className="text-2xl font-semibold font-poppins">Wholesaler Orders</h1>
        </div>
        <Card>
          {loading ? (
            <div className="p-10 text-center">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No orders yet for your shops.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 font-poppins">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Buyer Email</th>
                    <th className="px-4 py-2">Shop</th>
                    <th className="px-4 py-2">Total Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Placed At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="px-4 py-2">{order.id.slice(0, 8)}...</td>
                      <td className="px-4 py-2">{order.profiles?.email || "Unknown"}</td>
                      <td className="px-4 py-2">{order.shop_id}</td>
                      <td className="px-4 py-2">Rs {order.total_amount}</td>
                      <td className="px-4 py-2 capitalize">{order.status}</td>
                      <td className="px-4 py-2">{order.created_at && new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
export default WholesalerOrders;
