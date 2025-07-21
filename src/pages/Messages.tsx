
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Phone, 
  Video,
  MoreVertical,
  Clock,
  CheckCheck,
  Users
} from 'lucide-react';

const Messages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock conversations for demonstration
  const conversations = [
    {
      id: '1',
      name: 'Ahmad Traders',
      lastMessage: 'Thank you for the order confirmation',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      type: 'wholesaler'
    },
    {
      id: '2',
      name: 'Karachi Electronics',
      lastMessage: 'When will the shipment arrive?',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      type: 'supplier'
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Messages</h1>
              <p className="text-muted-foreground font-poppins">
                Communicate with suppliers and customers
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => console.log('Open new message modal')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                  <Badge variant="secondary">{conversations.length}</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-poppins">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedChat === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedChat(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {conversation.name.charAt(0)}
                              </span>
                            </div>
                            {conversation.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">{conversation.name}</p>
                              <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs">
                                {conversation.type}
                              </Badge>
                              {conversation.unread > 0 && (
                                <Badge className="bg-pakistani_green-600 text-xs">
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedChat ? (
                <>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">A</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Ahmad Traders</h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <Separator />
                  
                  {/* Messages area - flex-1 to take remaining space */}
                  <CardContent className="flex-1 flex flex-col p-4">
                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                      {/* Sample messages */}
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg max-w-xs">
                          <p className="text-sm">Hello! I'm interested in your electronics products.</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">2:30 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-pakistani_green-600 text-white p-3 rounded-lg max-w-xs">
                          <p className="text-sm">Thank you for your interest! I'll send you our catalog.</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-90">2:32 PM</span>
                            <CheckCheck className="w-3 h-3 opacity-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Input area - fixed at bottom */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Type a message..." 
                          className="flex-1" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                          onClick={handleSendMessage}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold font-poppins">Select a conversation</h3>
                      <p className="text-muted-foreground font-poppins">
                        Choose a conversation to start messaging
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Messages;
