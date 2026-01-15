import { MessageCircle, X } from 'lucide-react';
import { useChatbot } from './useChatbot';
import ChatbotModal from './ChatbotModal';

const ChatbotWidget = () => {
    const { isOpen, toggleChat, messages, isLoading, sendUserMessage } = useChatbot();

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 hover:-translate-y-1 animate-bounce-slow group"
                    aria-label="Open AI Chat Assistant"
                >
                    <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />

                    {/* Notification Badge */}
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        AI
                    </span>
                </button>
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
