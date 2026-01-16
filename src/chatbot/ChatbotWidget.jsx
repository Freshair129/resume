import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useChatbot } from './useChatbot';
import { useLanguage } from '../LanguageContext';
import ChatbotModal from './ChatbotModal';
import { useState, useEffect } from 'react';

const ChatbotWidget = () => {
    const { isOpen, toggleChat, messages, isLoading, sendUserMessage } = useChatbot();
    const { t } = useLanguage();
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        // Show hint after a short delay
        const timer = setTimeout(() => {
            if (!isOpen) setShowHint(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <>
            {/* Floating Button & Hint */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
                    {/* Invitation Hint */}
                    {showHint && (
                        <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-blue-100 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-[200px] pointer-events-auto relative group">
                            <button
                                onClick={() => setShowHint(false)}
                                className="absolute -top-2 -right-2 bg-slate-100 text-slate-400 p-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X size={10} />
                            </button>
                            <p className="text-xs font-bold leading-relaxed flex items-center gap-2">
                                <Sparkles size={14} className="text-blue-600 shrink-0" />
                                {t.chatbot.hint}
                            </p>
                            {/* Triangle Arrow */}
                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-blue-100 rotate-45"></div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            toggleChat();
                            setShowHint(false);
                        }}
                        className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 hover:-translate-y-1 animate-bounce-slow group pointer-events-auto"
                        aria-label="Open AI Chat Assistant"
                    >
                        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />

                        {/* Notification Badge */}
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            AI
                        </span>
                    </button>
                </div>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <ChatbotModal
                    onClose={toggleChat}
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={sendUserMessage}
                />
            )}
        </>
    );
};

export default ChatbotWidget;
