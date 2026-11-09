import { useState, useCallback } from 'react';
import { sendMessage } from './chatbotService';
import { useLanguage } from '../LanguageContext';
import { trackEvent } from '../lib/track';

function saveDeclaredIdentity(name, company) {
    try {
        sessionStorage.setItem('eva_user_name', name);
        sessionStorage.setItem('eva_user_company', company);
    } catch {
        // Chat should remain usable when browser storage is unavailable.
    }
}

function readDeclaredIdentity() {
    try {
        return {
            name: sessionStorage.getItem('eva_user_name'),
            company: sessionStorage.getItem('eva_user_company'),
        };
    } catch {
        return { name: null, company: null };
    }
}

export function useChatbot() {
    const { t, language } = useLanguage();
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
                content: t.chatbot?.welcomeMessage || 'สวัสดีครับ! ผมคือ AI Assistant ของบอสครับ ยินดีที่ได้รู้จักนะครับ! รบกวนแจ้งชื่อของคุณและบริษัทให้ผมทราบนิดนึงได้ไหมครับ? ผมจะได้ดึงข้อมูลและเตรียมคำตอบที่เหมาะกับคุณที่สุดให้ครับ 😊'
            }]);
        }
    }, [messages.length, t.chatbot]);

    const toggleChat = useCallback(() => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
        if (messages.length === 0) initializeChat();
        trackEvent('chat_opened');
    }, [isOpen, messages.length, initializeChat]);

    const sendUserMessage = useCallback(async (userMessage) => {
        if (!userMessage.trim()) return;
        trackEvent('chat_message_sent');

        // Detect Identity (Very simple regex for "Name จาก Company")
        // This will be improved to handle separate inputs or LLM-based extraction
        const identityMatch = userMessage.match(/(?:ชื่อ|ผม|ดิฉัน)\s*(\S+)\s*(?:จาก|บริษัท)\s*(\S+)/i);
        if (identityMatch) {
            const name = identityMatch[1];
            const company = identityMatch[2];
            saveDeclaredIdentity(name, company);
        }

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: userMessage.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const { name: userName, company: userCompany } = readDeclaredIdentity();

            // Prepare conversation history
            const history = messages
                .filter(msg => msg.role !== 'bot' || msg.id !== messages[0]?.id)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            // Get bot response with identity context
            const botResponse = await sendMessage(userMessage, history, { name: userName, company: userCompany, language });

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
    }, [messages, t.chatbot, language]);

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
