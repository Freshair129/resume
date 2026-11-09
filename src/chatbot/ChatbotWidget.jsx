import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useChatbot } from './useChatbot';
import { useLanguage } from '../LanguageContext';
import ChatbotModal from './ChatbotModal';
import { useState, useEffect, useRef } from 'react';

const HINT_DISMISSED_KEY = 'eva_hint_dismissed';
const HINT_SHOW_AFTER_MS = 6000;
const HINT_AUTO_HIDE_MS = 9000;

const readDismissed = () => {
    try {
        return localStorage.getItem(HINT_DISMISSED_KEY) === '1';
    } catch {
        return false;
    }
};

const writeDismissed = () => {
    try {
        localStorage.setItem(HINT_DISMISSED_KEY, '1');
    } catch {
        /* storage unavailable — ignore */
    }
};

const ChatbotWidget = () => {
    const { isOpen, toggleChat, messages, isLoading, sendUserMessage } = useChatbot();
    const { t } = useLanguage();
    const [showHint, setShowHint] = useState(false);
    const launcherRef = useRef(null);
    const wasOpenRef = useRef(false);

    useEffect(() => {
        if (wasOpenRef.current && !isOpen) launcherRef.current?.focus();
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    // Invite once: appear after the visitor has had a moment with the page,
    // disappear on its own, and never come back once dismissed or the chat was opened.
    useEffect(() => {
        if (isOpen || readDismissed()) return undefined;
        const showTimer = setTimeout(() => setShowHint(true), HINT_SHOW_AFTER_MS);
        const hideTimer = setTimeout(() => setShowHint(false), HINT_SHOW_AFTER_MS + HINT_AUTO_HIDE_MS);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [isOpen]);

    const dismissHint = () => {
        setShowHint(false);
        writeDismissed();
    };

    const openChat = () => {
        dismissHint();
        toggleChat();
    };

    return (
        <div className="print:hidden">
            {/* Floating Button & Hint */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
                    {showHint && (
                        <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-blue-100 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-[220px] pointer-events-auto relative">
                            <button
                                onClick={dismissHint}
                                className="absolute -top-2 -right-2 bg-slate-100 text-slate-500 p-1 rounded-full hover:bg-slate-200 transition-colors"
                                aria-label={t.a11y.dismissHint}
                            >
                                <X size={10} />
                            </button>
                            <p className="text-xs font-bold leading-relaxed flex items-center gap-2">
                                <Sparkles size={14} className="text-blue-600 shrink-0" />
                                {t.chatbot.hint}
                            </p>
                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-blue-100 rotate-45"></div>
                        </div>
                    )}

                    <button
                        ref={launcherRef}
                        onClick={openChat}
                        className="relative bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-105 group pointer-events-auto"
                        aria-label={t.a11y.openChat}
                    >
                        <MessageCircle size={26} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 leading-none border-2 border-white">
                            AI
                        </span>
                    </button>
                </div>
            )}

            {isOpen && (
                <ChatbotModal
                    onClose={toggleChat}
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={sendUserMessage}
                />
            )}
        </div>
    );
};

export default ChatbotWidget;
