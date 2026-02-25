import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Send, Bot, User } from 'lucide-react';
import { CATEGORIES, Category } from '@/lib/types';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hi! I'm your PocketPilot AI assistant. Ask me anything about your finances! 💰" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state, totalExpenses, totalIncome, remainingBalance, savingsAmount, categoryTotals, todayExpenses, dailySpendingLimit, goalProgress } = useStore();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const processQuery = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('today') && (q.includes('spend') || q.includes('expense'))) {
      return `You've spent **$${todayExpenses.toFixed(2)}** today. Your daily limit is **$${dailySpendingLimit.toFixed(2)}**.${
        todayExpenses > dailySpendingLimit ? ' ⚠️ You\'re over your daily limit!' : ' ✅ You\'re within budget.'
      }`;
    }

    if (q.includes('total') && q.includes('expense')) {
      return `Your total expenses this month are **$${totalExpenses.toFixed(2)}** out of **$${totalIncome.toFixed(2)}** income.`;
    }

    if (q.includes('balance') || q.includes('remaining') || q.includes('left')) {
      return `Your remaining balance is **$${remainingBalance.toFixed(2)}** this month.`;
    }

    if (q.includes('saving') && (q.includes('can') || q.includes('feasib') || q.includes('goal') || q.includes('target'))) {
      const target = state.user?.savingsTarget || 0;
      return `Your savings target is **$${target.toFixed(2)}**. Current progress: **${goalProgress.toFixed(0)}%**. ${
        goalProgress >= 100 ? '🎉 You\'ve reached your goal!' : `You need **$${Math.max(0, target - savingsAmount).toFixed(2)}** more.`
      }`;
    }

    if (q.includes('category') || q.includes('breakdown') || q.includes('most')) {
      const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
      if (sorted.length === 0) return "No expenses recorded yet this month.";
      const lines = sorted.map(([cat, amt]) => {
        const c = CATEGORIES[cat as Category];
        return `${c.icon} ${c.label}: **$${amt.toFixed(2)}**`;
      });
      return `Here's your spending breakdown:\n\n${lines.join('\n')}`;
    }

    if (q.includes('income') || q.includes('salary')) {
      return `Your monthly income is **$${totalIncome.toFixed(2)}**.`;
    }

    if (q.includes('daily') && q.includes('limit')) {
      return `Your daily spending limit is **$${dailySpendingLimit.toFixed(2)}** to stay on track with your savings goal.`;
    }

    if (q.includes('tip') || q.includes('advice') || q.includes('suggest')) {
      const top = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
      if (top) {
        const c = CATEGORIES[top[0] as Category];
        return `💡 Your highest spending category is **${c.label}** at **$${top[1].toFixed(2)}**. Consider setting a budget limit for this category to boost your savings!`;
      }
      return "💡 Start tracking your expenses regularly to get personalized insights!";
    }

    return "I can help you with:\n• Today's spending\n• Total expenses\n• Remaining balance\n• Savings goal progress\n• Category breakdown\n• Daily spending limit\n• Financial tips\n\nTry asking one of these! 😊";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const response = processQuery(userMsg.content);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    }, 500);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground"
        style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)', maxWidth: '430px' }}
      >
        <Bot className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[430px] flex-col rounded-t-3xl bg-card"
              style={{ height: '70vh', boxShadow: 'var(--shadow-lg)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-3xl px-5 py-4" style={{ background: 'var(--gradient-hero)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-foreground font-display">PocketPilot AI</h3>
                    <p className="text-xs text-primary-foreground/70">Your finance assistant</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {msg.content.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border px-4 py-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your finances..."
                  className="input-finance flex-1 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground disabled:opacity-40"
                  style={{ background: 'var(--gradient-primary)' }}
                >
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
