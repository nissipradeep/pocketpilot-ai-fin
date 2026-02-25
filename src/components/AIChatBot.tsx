import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Send, Bot, User, Plus, MessageSquare, Clock } from 'lucide-react';
import { CATEGORIES, Category, formatCurrency, ChatMessage } from '@/lib/types';

const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state, dispatch, totalExpenses, totalIncome, remainingBalance, savingsAmount, categoryTotals, todayExpenses, dailySpendingLimit, goalProgress, currency } = useStore();

  const currentMessages = state.chatHistory.filter(m => m.sessionId === sessionId);
  const allSessionIds = [...new Set(state.chatHistory.map(m => m.sessionId))];
  const otherSessions = allSessionIds.filter(id => id !== sessionId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentMessages, open]);

  // Add welcome message to new sessions
  useEffect(() => {
    if (open && currentMessages.length === 0) {
      const welcome: ChatMessage = {
        id: crypto.randomUUID(),
        message: "Hi! I'm your PocketPilot AI assistant. Ask me anything about your finances! 💰",
        isUser: false,
        timestamp: new Date().toISOString(),
        sessionId,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: welcome });
    }
  }, [open, sessionId]);

  const parseNaturalDate = (query: string): Date | null => {
    const q = query.toLowerCase();
    const now = new Date();

    if (q.includes('today')) return now;
    if (q.includes('yesterday')) { const d = new Date(now); d.setDate(d.getDate() - 1); return d; }

    // "on 24 february" or "on february 24" or "24 feb"
    const datePatterns = [
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/i,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/i,
    ];

    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    for (const pattern of datePatterns) {
      const match = q.match(pattern);
      if (match) {
        let day: number, monthStr: string;
        if (/^\d/.test(match[1])) {
          day = parseInt(match[1]);
          monthStr = match[2].substring(0, 3).toLowerCase();
        } else {
          monthStr = match[1].substring(0, 3).toLowerCase();
          day = parseInt(match[2]);
        }
        if (monthStr in monthMap) {
          const d = new Date(now.getFullYear(), monthMap[monthStr], day);
          return d;
        }
      }
    }

    return null;
  };

  const getSpendingOnDate = (date: Date): number => {
    const dateStr = date.toDateString();
    return state.transactions
      .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const processQuery = (query: string): string => {
    const q = query.toLowerCase();
    const fc = (amt: number) => formatCurrency(amt, currency);

    // Date-specific spending
    const parsedDate = parseNaturalDate(query);
    if (parsedDate && (q.includes('spend') || q.includes('expense') || q.includes('spent'))) {
      const spent = getSpendingOnDate(parsedDate);
      const dateLabel = parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      if (spent === 0) return `You didn't spend anything on **${dateLabel}**. 🎉`;
      return `You spent **${fc(spent)}** on **${dateLabel}**.${
        parsedDate.toDateString() === new Date().toDateString()
          ? ` Your daily limit is **${fc(dailySpendingLimit)}**.${todayExpenses > dailySpendingLimit ? ' ⚠️ Over limit!' : ' ✅ Within budget.'}`
          : ''
      }`;
    }

    if (q.includes('today') && (q.includes('spend') || q.includes('expense'))) {
      return `You've spent **${fc(todayExpenses)}** today. Your daily limit is **${fc(dailySpendingLimit)}**.${
        todayExpenses > dailySpendingLimit ? ' ⚠️ Over limit!' : ' ✅ Within budget.'
      }`;
    }

    if (q.includes('overspend') || q.includes('over budget') || q.includes('over limit')) {
      if (todayExpenses > dailySpendingLimit) {
        return `⚠️ Yes, you've exceeded today's limit by **${fc(todayExpenses - dailySpendingLimit)}**. Try to reduce spending tomorrow.`;
      }
      const pct = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
      if (pct >= 80) return `⚠️ You've used **${pct.toFixed(0)}%** of your income. Be careful with remaining spending!`;
      return `✅ You're within budget! You've used **${pct.toFixed(0)}%** of your income.`;
    }

    if ((q.includes('save daily') || q.includes('save per day') || q.includes('should i save'))) {
      const target = state.user?.savingsTarget || 0;
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const dailySave = target / daysInMonth;
      return `To hit your savings target of **${fc(target)}**, you should save about **${fc(dailySave)}** per day.`;
    }

    if (q.includes('can i buy') || q.includes('afford') || q.includes('can i get')) {
      const months = parseInt(q.match(/(\d+)\s*month/)?.[1] || '0');
      if (months > 0) {
        const monthlySavable = Math.max(0, remainingBalance);
        const totalSavable = monthlySavable * months;
        return `In **${months} months**, you could save approximately **${fc(totalSavable)}** (based on current month's pace of **${fc(monthlySavable)}/month**).`;
      }
      return `Your remaining balance this month is **${fc(remainingBalance)}**. Tell me the item cost and timeline for a better answer!`;
    }

    if (q.includes('total') && (q.includes('expense') || q.includes('spent'))) {
      return `Total expenses this month: **${fc(totalExpenses)}** out of **${fc(totalIncome)}** income.`;
    }

    if (q.includes('balance') || q.includes('remaining') || q.includes('left')) {
      return `Remaining balance: **${fc(remainingBalance)}** this month.`;
    }

    if (q.includes('saving') && (q.includes('goal') || q.includes('target') || q.includes('progress'))) {
      const target = state.user?.savingsTarget || 0;
      return `Savings target: **${fc(target)}**. Progress: **${goalProgress.toFixed(0)}%**. ${
        goalProgress >= 100 ? '🎉 Goal reached!' : `Need **${fc(Math.max(0, target - savingsAmount))}** more.`
      }`;
    }

    // Category-specific
    for (const [catKey, catInfo] of Object.entries(CATEGORIES)) {
      if (q.includes(catKey) || q.includes(catInfo.label.toLowerCase().split(' ')[0].toLowerCase())) {
        const amount = categoryTotals[catKey as Category] || 0;
        return `${catInfo.icon} **${catInfo.label}** spending this month: **${fc(amount)}**.`;
      }
    }

    if (q.includes('category') || q.includes('breakdown') || q.includes('most')) {
      const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
      if (sorted.length === 0) return "No expenses recorded yet.";
      const lines = sorted.map(([cat, amt]) => `${CATEGORIES[cat as Category].icon} ${CATEGORIES[cat as Category].label}: **${fc(amt)}**`);
      return `Spending breakdown:\n\n${lines.join('\n')}`;
    }

    if (q.includes('income') || q.includes('salary')) {
      return `Monthly income: **${fc(totalIncome)}**.`;
    }

    if (q.includes('daily') && q.includes('limit')) {
      return `Daily spending limit: **${fc(dailySpendingLimit)}** to stay on track.`;
    }

    if (q.includes('tip') || q.includes('advice') || q.includes('suggest')) {
      const top = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
      if (top) {
        const c = CATEGORIES[top[0] as Category];
        return `💡 Highest spending: **${c.label}** at **${fc(top[1])}**. Consider setting a budget for this category!`;
      }
      return "💡 Start tracking expenses to get personalized tips!";
    }

    return "I can help you with:\n• Spending on any date\n• Overspending check\n• Daily savings needed\n• Purchase affordability\n• Category breakdown\n• Savings goal progress\n• Financial tips\n\nTry asking! 😊";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      message: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      sessionId,
    };
    dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMsg });
    setInput('');

    setTimeout(() => {
      const response = processQuery(userMsg.message);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        message: response,
        isUser: false,
        timestamp: new Date().toISOString(),
        sessionId,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: botMsg });
    }, 400);
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
      {/* FAB */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)}
        className="glass-button fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground"
        style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)', maxWidth: '430px' }}>
        <Bot className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[430px] flex-col rounded-t-3xl bg-card"
              style={{ height: '75vh', boxShadow: 'var(--shadow-lg)' }}>

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
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowHistory(!showHistory)} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground" title="Chat History">
                    <Clock className="h-4 w-4" />
                  </button>
                  <button onClick={startNewSession} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground" title="New Chat">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-primary-foreground/70 hover:text-primary-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* History Panel */}
              {showHistory && otherSessions.length > 0 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-b border-border overflow-hidden">
                  <div className="p-3 flex flex-col gap-1 max-h-32 overflow-y-auto">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Previous Chats</p>
                    {otherSessions.map(id => {
                      const msgs = state.chatHistory.filter(m => m.sessionId === id);
                      const firstUserMsg = msgs.find(m => m.isUser);
                      const label = firstUserMsg?.message.substring(0, 40) || 'Chat session';
                      const time = msgs[0]?.timestamp;
                      return (
                        <button key={id} onClick={() => switchSession(id)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-muted transition-colors">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{label}</p>
                            {time && <p className="text-[10px] text-muted-foreground">{new Date(time).toLocaleDateString()}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {currentMessages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                      {msg.message.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                      )}
                    </div>
                    {msg.isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border px-4 py-3 flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your finances..." className="input-finance flex-1 text-sm" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground disabled:opacity-40"
                  style={{ background: 'var(--gradient-primary)' }}>
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
