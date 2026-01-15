import { useState, useCallback } from 'react';
import { sendMessage } from './chatbotService';
import { useLanguage } from '../LanguageContext';

export function useChatbot() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize with welcome message
    const initializeChat = useCallback(() => {
        if (messages.length === 0) {
            setMessages([{
                id: Date.now(),
                role: 'bot',
                content: t.chatbot?.welcomeMessage || 'สวัสดีครับ! ผมคือ AI Assistant ของบอส มีคำถามอะไรเกี่ยวกับประวัติการทำงานหรือผลงานไหมครับ?'
            }]);
        }
    }, [messages.length, t.chatbot]);

    const toggleChat = useCallback(() => {
        setIsOpen(prev => {
            const newValue = !prev;
            if (newValue && messages.length === 0) {
                initializeChat();
            }
            return newValue;
        });
    }, [messages.length, initializeChat]);

    const sendUserMessage = useCallback(async (userMessage) => {
        if (!userMessage.trim()) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: userMessage.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            // Prepare conversation history (exclude welcome message)
            const history = messages
                .filter(msg => msg.role !== 'bot' || msg.id !== messages[0]?.id)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            // Get bot response
            const botResponse = await sendMessage(userMessage, history);

            // Add bot message
            const botMsg = {
                id: Date.now() + 1,
                role: 'bot',
                content: botResponse
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message);

            // Add error message to chat
            const errorMsg = {
                id: Date.now() + 1,
                role: 'bot',
                content: t.chatbot?.errorMessage || 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 😅',
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, t.chatbot]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
        initializeChat();
    }, [initializeChat]);

    return {
        isOpen,
        toggleChat,
        messages,
        isLoading,
        error,
        sendUserMessage,
        clearChat
    };
}
