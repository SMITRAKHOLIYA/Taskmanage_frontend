import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'agent', text: "Hello! I'm your TaskMaster AI assistant. How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const knowledgeBase = [
        {
            keywords: ['what', 'taskmaster', 'app', 'about', 'website'],
            response: "TaskMaster is a futuristic task management platform designed to keep you in the flow state using AI-powered organization and focus tools."
        },
        {
            keywords: ['free', 'price', 'cost', 'pricing', 'subscription'],
            response: "We offer a generous free tier for individuals. Our Pro plan starts at just $9/month for advanced AI features and unlimited team members."
        },
        {
            keywords: ['offline', 'internet', 'connection'],
            response: "Yes! TaskMaster works completely offline. Your data automatically syncs once you're back online."
        },
        {
            keywords: ['secure', 'security', 'data', 'privacy', 'safe'],
            response: "Your security is our priority. We use military-grade AES-256 encryption to ensure your data remains private and secure."
        },
        {
            keywords: ['team', 'collaborate', 'share', 'invite'],
            response: "Collaboration is seamless! You can invite unlimited team members, assign tasks, and chat in real-time within the app."
        },
        {
            keywords: ['focus', 'mode', 'distraction'],
            response: "Our Focus Mode blocks distractions and plays ambient sounds to help you concentrate on your most important tasks."
        },
        {
            keywords: ['thank', 'thanks'],
            response: "You're welcome! Let me know if you have any other questions."
        },
        {
            keywords: ['hello', 'hi', 'hey', 'greetings'],
            response: "Hello there! Ready to boost your productivity?"
        }
    ];

    const analyzeInput = (text) => {
        const lowerText = text.toLowerCase();
        for (const entry of knowledgeBase) {
            if (entry.keywords.some(keyword => lowerText.includes(keyword))) {
                return entry.response;
            }
        }
        return "I'm not sure about that yet, but I'm learning! You can ask me about features, pricing, security, or offline mode.";
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const newMessages = [...messages, { type: 'user', text: inputValue }];
        setMessages(newMessages);
        setInputValue("");

        // Simulate thinking delay
        setTimeout(() => {
            const response = analyzeInput(inputValue);
            setMessages(prev => [...prev, { type: 'agent', text: response }]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-80 md:w-96 h-[500px] bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,246,255,0.15)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f6ff] to-[#a100ff] flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">AI</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">TaskMaster AI</div>
                                    <div className="text-xs text-[#00f6ff] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f6ff] animate-pulse" />
                                        Online
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                            ? 'bg-[#00f6ff]/20 text-white rounded-tr-none border border-[#00f6ff]/20'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/10'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-[#00f6ff]/50 transition-colors placeholder:text-gray-600"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#00f6ff] hover:bg-[#00f6ff]/10 transition-colors disabled:opacity-50"
                                    disabled={!inputValue.trim()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00f6ff] to-[#a100ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,246,255,0.5)] hover:shadow-[0_0_30px_rgba(161,0,255,0.6)] transition-shadow z-50"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
