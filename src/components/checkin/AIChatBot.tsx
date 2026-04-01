'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import dynamic from 'next/dynamic';
import aiPulse from '../../../public/animations/ai_pulse.json';
import loadingAnim from '../../../public/animations/loading.json';
import { checkinHistory } from '@/data/mockCheckins';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
};

const SUGGESTIONS = ["Feeling fine today", "Yes, some discomfort", "I skipped my medicine"];

export default function AIChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const initialQuestion = checkinHistory[0].questions[0].q;

  useEffect(() => {
    // Typewriter effect for initial question
    let i = 0;
    setIsTyping(true);
    setMessages([{ id: 'init', sender: 'ai', text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) }]);
    
    const intervalId = setInterval(() => {
      setMessages(prev => {
        const newText = initialQuestion.slice(0, i + 1);
        return [{ ...prev[0], text: newText }];
      });
      i++;
      if (i === initialQuestion.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAnalysing]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsAnalysing(true);

    setTimeout(() => {
      setIsAnalysing(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Thank you for sharing that. Has the tightness felt worse during any specific activity like climbing stairs or stress?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-card-border h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-card-border bg-gradient-to-r from-blue-50 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="font-sora text-base font-bold text-blue-900">Daily Check-in</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">AI Assistant · Active</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface/30"
      >
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isLastAi = msg.sender === 'ai' && index === messages.length - 1 && !isTyping;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-1 pl-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                        {isLastAi ? (
                          <div className="w-8 h-8"><Lottie animationData={aiPulse} loop /></div>
                        ) : (
                          <Bot size={12} className="text-blue-600" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Swasthya AI</span>
                    </div>
                  )}
                  
                  <div 
                    className={`p-3.5 shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-[16px_4px_16px_16px]' 
                        : 'bg-white border border-blue-100 text-text-primary rounded-[4px_16px_16px_16px]'
                    }`}
                  >
                    <p className="font-dm-sans text-sm leading-relaxed">{msg.text}</p>
                    {msg.sender === 'ai' && isTyping && index === 0 && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${msg.sender === 'user' ? 'text-text-muted pr-1' : 'text-text-muted pl-1'}`}>
                    {msg.time}
                  </span>
                </div>
              </motion.div>
            );
          })}
          
          {isAnalysing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start w-full"
            >
              <div className="flex flex-col items-start max-w-[80%]">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                    <Bot size={12} className="text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Swasthya AI</span>
                </div>
                <div className="bg-white border border-blue-100 rounded-[4px_16px_16px_16px] p-2 shadow-sm flex items-center gap-2 pr-4">
                  <div className="w-8 h-8 opacity-70">
                    <Lottie animationData={loadingAnim} loop />
                  </div>
                  <span className="text-xs font-medium text-text-muted">Analysing response...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-card-border p-4 flex flex-col gap-3">
        {/* Suggestion Chips */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
          {SUGGESTIONS.map((sug, i) => (
            <button
               key={i}
              onClick={() => handleSend(sug)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50/50 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              {sug}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder="Type your response..."
            className="flex-1 bg-surface border border-card-border rounded-full py-3 pl-4 pr-12 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-text-muted"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
            className="absolute right-1.5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-blue-300"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
