"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatBoxProps {
  endpoint?: string;
  botName?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  endpoint = API_ENDPOINTS.DIET.CHAT,
  botName = 'GYM GURU Dietician',
}) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: `Hello! I am your ${botName}. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const wsUrl = new URL(endpoint);
      if (token) {
        wsUrl.searchParams.append('token', token);
      }
      
      socket = new WebSocket(wsUrl.toString());
      socketRef.current = socket;

      socket.onopen = () => setIsConnected(true);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, { role: 'bot', content: data.message }]);
        } catch {
          setMessages(prev => [...prev, { role: 'bot', content: event.data }]);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3s
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [endpoint]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    socketRef.current.send(userMsg);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto glass-dark rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <span className="text-slate-900 font-semibold">{botName}</span>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-white font-medium' : 'bg-slate-100 text-slate-900'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 bg-white rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-900 placeholder-slate-400 px-4 py-2 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-900 rounded-xl transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
