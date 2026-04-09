'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Hello! I am your AI Medical Assistant. How can I help you understand dementia and cognitive health today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all text-white"
        >
          🤖
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ease-in-out
            ${isMinimized 
              ? 'bottom-6 right-6 w-14 h-14 rounded-full overflow-hidden shadow-lg border border-transparent' 
              : 'bottom-[5vh] right-[5vw] sm:right-[5vw] md:right-[5vw] w-[90vw] sm:w-[400px] h-[600px] max-h-[85vh] rounded-2xl flex flex-col glass shadow-2xl border border-gray-700/50'
            }
          `}
        >
          {isMinimized ? (
            <button
               onClick={() => setIsMinimized(false)}
               className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-2xl hover:scale-105 transition-transform text-white"
            >
              💬
            </button>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 rounded-t-2xl">
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-xl flex items-center justify-center">🤖</div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-semibold">Medical AI Assistant</h3>
                    <p className="text-green-400 text-xs">Online</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-white p-1" title="Minimize">
                    ➖
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-400 p-1" title="Close">
                    ✖
                  </button>
                </div>
              </div>

              {/* Chat Area (WhatsApp Style) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/80 scroll-mt-2">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-base leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-cyan-600 text-white rounded-br-none' 
                          : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700/50'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-800 text-gray-400 rounded-bl-none flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-gray-900 border-t border-gray-800 rounded-b-2xl">
                <div className="flex items-end gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800 focus-within:border-cyan-500/50 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your medical question..."
                    className="flex-1 bg-transparent text-white text-base px-3 py-2 max-h-32 min-h-[40px] resize-none outline-none"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 flex-shrink-0 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-colors mb-0.5 mr-0.5"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
