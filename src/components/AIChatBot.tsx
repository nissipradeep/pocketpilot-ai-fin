import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Send, Bot, User, Plus, MessageSquare, Clock, Loader2, Mic, MicOff } from 'lucide-react';
import { CATEGORIES, Category, formatCurrency, ChatMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

// SECURE KEY ACCESS
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBgw9sgkCrdCSWYw0tq8AtlDLRwNDr4RdM";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state, dispatch, totalExpenses, totalIncome, remainingBalance, savingsAmount, categoryTotals, todayExpenses, dailySpendingLimit, goalProgress, currency } = useStore();

  const currentMessages = state.chatHistory.filter(m => m.sessionId === sessionId);
  const allSessionIds = [...new Set(state.chatHistory.map(m => m.sessionId))];
  const otherSessions = allSessionIds.filter(id => id !== sessionId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentMessages, open, isTyping]);

  useEffect(() => {
    if (open && currentMessages.length === 0) {
      const welcome: ChatMessage = {
        id: crypto.randomUUID(),
        message: "Hi! I'm your PocketPilot AI. I can now understand voice, render tables, and provide deep financial insights. How can I help today? 🎤📊",
        isUser: false,
        timestamp: new Date().toISOString(),
        sessionId,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: welcome });
    }
  }, [open, sessionId]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const getAIResponse = async (userQuery: string, history: ChatMessage[]) => {
    setIsTyping(true);
    const financialContext = `
      [SYSTEM DATA ACCESS]
      - MONTHLY_INCOME: ${formatCurrency(totalIncome, currency)}
      - TOTAL_EXPENSES: ${formatCurrency(totalExpenses, currency)}
      - REMAINING_BALANCE: ${formatCurrency(remainingBalance, currency)}
      - SAVINGS_TARGET: ${formatCurrency(state.user?.savingsTarget || 0, currency)}
      - CURRENT_GOAL: "${state.user?.financialGoal || 'Not set'}"
      - GOAL_PROGRESS: ${goalProgress.toFixed(1)}%
      - DAILY_LIMIT: ${formatCurrency(dailySpendingLimit, currency)}
      - TODAY_SPENT: ${formatCurrency(todayExpenses, currency)}
      - CATEGORY_DATA: ${JSON.stringify(categoryTotals)}
    `;

    const contents = [
      {
        role: "user",
        parts: [{ text: `You are PocketPilot AI. Use the provided [SYSTEM DATA ACCESS] to answer accurately.
        Format your responses with Markdown (use tables for lists, bold for numbers).
        If the user asks for a breakdown, use a Markdown table.

        ${financialContext}

        History:
        ${history.slice(-5).map(m => `${m.isUser ? "User" : "Assistant"}: ${m.message}`).join("\n")}

        User: ${userQuery}` }]
      }
    ];

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error("API Error");
    } catch (error) {
      return "I encountered an error. Please check your connection! 🔌";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    const userMsg: ChatMessage = { id: crypto.randomUUID(), message: userText, isUser: true, timestamp: new Date().toISOString(), sessionId };
    dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMsg });
    setInput('');
    const aiResponse = await getAIResponse(userText, currentMessages);
    const botMsg: ChatMessage = { id: crypto.randomUUID(), message: aiResponse, isUser: false, timestamp: new Date().toISOString(), sessionId };
    dispatch({ type: 'ADD_CHAT_MESSAGE', message: botMsg });
  };

  const startNewSession = () => {
    setSessionId(crypto.randomUUID());
    setShowHistory(false);
  };

  const switchSession = (id: string) => {
    setSessionId(id);
    setShowHistory(false);
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)}
        className="glass-button fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-glow"
        style={{ background: 'var(--gradient-primary)', maxWidth: '430px' }}>
        <Bot className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[430px] flex-col rounded-t-3xl bg-card"
              style={{ height: '75vh', boxShadow: 'var(--shadow-lg)' }}>

              <div className="flex items-center justify-between rounded-t-3xl px-5 py-4" style={{ background: 'var(--gradient-hero)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-foreground font-display">PocketPilot Pro AI</h3>
                    <p className="text-xs text-primary-foreground/70">Voice & Data Enabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowHistory(!showHistory)} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground"><Clock className="h-4 w-4" /></button>
                  <button onClick={startNewSession} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground"><Plus className="h-4 w-4" /></button>
                  <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground"><X className="h-5 w-5" /></button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {currentMessages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isUser && <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-4 w-4 text-primary" /></div>}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm prose prose-sm dark:prose-invert ${msg.isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-[#222] text-foreground rounded-bl-md border border-white/5'}`}>
                      <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </div>
                    {msg.isUser && <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><User className="h-4 w-4 text-primary" /></div>}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 justify-start items-center p-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">AI Processing...</span></div>
                )}
              </div>

              <div className="border-t border-border px-4 py-3 flex gap-2 items-center">
                <button onClick={startListening} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-secondary text-secondary-foreground'}`}>
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." className="input-finance flex-1 text-sm h-10" />
                <button onClick={handleSend} disabled={!input.trim() || isTyping} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBot;
