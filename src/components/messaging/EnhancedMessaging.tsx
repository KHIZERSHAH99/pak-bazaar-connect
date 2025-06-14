
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, Paperclip, Phone, Video, MoreVertical, Search, Star } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  businessType: string;
  rating: number;
  messages: Message[];
}

const EnhancedMessaging: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participantName: 'Ahmad Textiles',
      participantAvatar: '',
      lastMessage: 'Thank you for your inquiry about cotton fabric...',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      businessType: 'Manufacturer',
      rating: 4.8,
      messages: [
        {
          id: '1',
          senderId: 'other',
          senderName: 'Ahmad Textiles',
          content: 'Thank you for your inquiry about cotton fabric. We have premium quality fabric available.',
          timestamp: '10:30 AM',
          isRead: false
        },
        {
          id: '2',
          senderId: 'me',
          senderName: 'You',
          content: 'What are your bulk pricing options for 1000+ meters?',
          timestamp: '10:35 AM',
          isRead: true
        }
      ]
    },
    {
      id: '2',
      participantName: 'Karachi Steel Works',
      participantAvatar: '',
      lastMessage: 'The shipment is ready for dispatch',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: false,
      businessType: 'Supplier',
      rating: 4.5,
      messages: [
        {
          id: '3',
          senderId: 'other',
          senderName: 'Karachi Steel Works',
          content: 'The shipment is ready for dispatch. Please confirm the delivery address.',
          timestamp: '9:15 AM',
          isRead: true
        }
      ]
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setConversations(conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, messages: [...conv.messages, message], lastMessage: newMessage, lastMessageTime: 'now' }
        : conv
    ));

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message]
    });

    setNewMessage('');
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold font-poppins">Messages</h3>
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-pakistani_green-600' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback>{conversation.participantName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm font-poppins truncate">{conversation.participantName}</h4>
                    <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{conversation.businessType}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{conversation.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate font-poppins">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-pakistani_green-600 text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.participantAvatar} />
                  <AvatarFallback>{selectedConversation.participantName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium font-poppins">{selectedConversation.participantName}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.isOnline ? 'Online' : 'Last seen 2 hours ago'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'me'
                        ? 'bg-pakistani_green-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-poppins">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.senderId === 'me' ? 'text-green-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">Select a conversation</h3>
              <p className="text-gray-600 font-poppins">Choose a conversation from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessaging;
