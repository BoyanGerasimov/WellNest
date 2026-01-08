import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { RobotIcon } from './icons/Icons';

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatService.getChatHistory();
      if (response.success) {
        const chatMessages = [];
        response.data.forEach(msg => {
          chatMessages.push({ type: 'user', content: msg.message, timestamp: msg.timestamp });
          chatMessages.push({ type: 'assistant', content: msg.response, timestamp: msg.timestamp });
        });
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setLoading(true);

    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await chatService.chatWithCoach(userMessage);
      if (response.success) {
        const assistantMessage = {
          type: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get response from AI coach');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      try {
        await chatService.clearChatHistory();
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear chat history:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[calc(100vh-8rem)] sm:h-[600px] max-h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">AI Chat Coach</h2>
            <p className="text-xs text-teal-100">Get personalized fitness advice</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-white/80 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/20 transition-colors"
                title="Clear History"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <RobotIcon className="w-16 h-16" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Welcome to WellNest AI Coach!</h3>
                <p className="text-sm text-slate-500">
                  Ask me anything about fitness, nutrition, or workouts.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    msg.type === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1.5 ${
                    msg.type === 'user' ? 'text-teal-200' : 'text-slate-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your fitness coach..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatModal;

