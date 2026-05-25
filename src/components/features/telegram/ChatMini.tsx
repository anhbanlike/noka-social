import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { useAuthStore } from '../../../store/useAuthStore';
import { databaseService } from '../../../lib/supabase';
import { TelegramMessage } from '../../../types';
import { Send, Cpu, User, RefreshCw, Bot } from 'lucide-react';

export const ChatMini: React.FC = () => {
  const { t, language } = useTranslation();
  const user = useAuthStore((state) => state.user);
  
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [replying, setReplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome bot bubble on mount/language change
  useEffect(() => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: t.tel_welcome_msg,
        created_at: new Date().toISOString(),
      },
    ]);
  }, [t, language]);

  // Keep chat viewport scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, replying]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || replying || !user) return;

    const userMessageText = inputValue.trim();
    setInputValue('');

    // Append user bubble to thread
    const userMsg: TelegramMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setReplying(true);

    try {
      // Gather metadata structure to guide the bot's factual awareness
      const platforms = await databaseService.getPlatforms(user.id);
      const passwords = await databaseService.getPasswords(user.id);
      
      const payloadPlatforms = platforms.map((p) => {
        const associatedAccounts = passwords
          .filter((pw) => pw.platform_id === p.id)
          .map((pw) => pw.account_name)
          .join(', ');
        return {
          name: p.name,
          accounts: associatedAccounts || 'Không có',
        };
      });

      // Query AI server-side endpoint securely
      const response = await fetch('/api/telegram/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          platformList: payloadPlatforms,
          passwordCount: passwords.length,
          language: language,
        }),
      });

      const data = await response.json();

      // Add Bot Reply bubble to thread
      const botMsg: TelegramMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: data.text || 'Error rendering AI response.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (err) {
      console.error('Bot request failed', err);
      // Fallback fallback bubble
      const botMsg: TelegramMessage = {
        id: `msg-bot-err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ [Noka System API Timeout] Không thể định vị máy chủ. Kiểm tra kết nối mạng của bạn.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 flex flex-col h-[520px] relative overflow-hidden" id="telegram-ai-mini-chat">
      
      {/* Mini Chat Info Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4.5 shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center relative shadow-lg shadow-cyan-500/10 shrink-0">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Bot size={18} className="text-cyan-400" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-extrabold font-display leading-tight text-white tracking-wide">
            {t.tel_mini_chat_title}
          </span>
          <span className="text-[10px] text-slate-450 truncate whitespace-nowrap leading-none font-medium">
            {t.tel_mini_chat_desc}
          </span>
        </div>
      </div>

      {/* Message viewport lists */}
      <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-4 pr-1" id="message-bubbles-viewport">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              {/* Bubble Avatar */}
              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 border ${
                isBot ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' : 'bg-blue-950/40 border-blue-500/20 text-blue-400'
              }`}>
                {isBot ? <Cpu size={13} /> : <User size={13} />}
              </div>

              {/* Text cloud bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isBot
                  ? 'bg-white/4 border border-white/6 text-slate-200 font-sans'
                  : 'bg-gradient-to-tr from-blue-700 to-blue-600 text-white shadow-lg font-medium shadow-blue-600/10'
              }`}>
                {/* Parse Markdown representation simplistically */}
                <div className="whitespace-pre-wrap select-text selection:bg-blue-500/25">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {/* Replying animated wave bubble */}
        {replying && (
          <div className="flex items-start gap-4 max-w-[80%] self-start" id="bot-thinking-bubble">
            <div className="w-7.5 h-7.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu size={13} className="animate-spin" />
            </div>

            <div className="bg-white/4 border border-white/6 text-slate-400 font-sans rounded-2xl px-4 py-3 text-xs font-semibold tracking-wide flex items-center gap-1">
              <span>Noka Guard is analyzing</span>
              <span className="animate-pulse">..</span>
              <span className="animate-pulse delay-75">.</span>
            </div>
          </div>
        )}

        {/* Invisible scrolling anchor */}
        <div ref={scrollRef} />
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleSend} className="mt-auto pt-3 border-t border-white/5 flex gap-2 w-full shrink-0" id="telegram-ai-mini-form">
        <input
          id="mini-chat-input-text"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.tel_mini_chat_placeholder}
          disabled={replying}
          className="flex-1 bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
        
        <button
          id="mini-chat-send-btn"
          type="submit"
          disabled={!inputValue.trim() || replying}
          className="p-3 w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          aria-label={t.tel_send_btn}
        >
          <Send size={15} />
        </button>
      </form>

    </div>
  );
};
export default ChatMini;
