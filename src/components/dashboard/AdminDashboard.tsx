
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users } from 'lucide-react';

const AdminDashboard: React.FC = () => (
  <div className="animate-fadeIn">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-poppins">Admin Dashboard</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <Link to="/dashboard/ad-approvals">
        <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">Ad Approvals</h3>
          </div>
          <p className="text-gray-600 font-poppins text-sm md:text-base">Review and approve advertisement submissions from wholesalers.</p>
        </Card>
      </Link>

      <Link to="/dashboard/chat">
        <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">Support Chat</h3>
          </div>
          <p className="text-gray-600 font-poppins text-sm md:text-base">Access the AI chat support to help users with questions.</p>
        </Card>
      </Link>

      <Card className="p-4 md:p-6 bg-pakistani_green-50 border-pakistani_green-200">
        <div className="flex items-center mb-4">
          <div className="bg-pakistani_green-100 p-3 rounded-full mr-4">
            <Users className="h-6 w-6 text-pakistani_green-700" />
          </div>
          <h3 className="text-lg font-semibold font-poppins text-pakistani_green-800">User Management</h3>
        </div>
        <p className="text-pakistani_green-700 font-poppins text-sm md:text-base">Users can now instantly switch roles without approval. Role changes are immediate and automatic.</p>
      </Card>
    </div>
  </div>
);

export default AdminDashboard;

