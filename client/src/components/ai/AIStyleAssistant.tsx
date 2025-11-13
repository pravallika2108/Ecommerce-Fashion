'use client';

import { useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AIStyleAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/ai/chat`, {
        messages: [...messages, userMessage],
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Open AI Style Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-2xl border flex flex-col"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">AI Style Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Sparkles className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                <p className="font-medium">Ask me anything about fashion!</p>
                <p className="text-sm mt-2 text-gray-400">
                  Try: "What should I wear to a summer wedding?"
                </p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Ask about fashion..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
