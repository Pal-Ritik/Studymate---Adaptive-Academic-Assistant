import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { ChatMessage, Subject, TutorPedagogyMode } from '../types';
import { ALL_SUBJECTS, QUICK_TUTOR_PROMPTS } from '../data/mockAcademicData';

interface AITutorViewProps {
  onActivityLogged: (activity: { title: string; type: 'tutor'; highlight: string }) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ onActivityLogged }) => {
  const [subject, setSubject] = useState<Subject>('Computer Science & AI');
  const [pedagogyMode, setPedagogyMode] = useState<TutorPedagogyMode>('socratic');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showThoughtId, setShowThoughtId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'tutor',
      content: `Hi! I'm your **StudyMate AI Tutor**. I'm here to help you understand tough topics step-by-step. 

Ask me any question from your homework, lectures, or revision. What are we studying today?`,
      timestamp: 'Just now',
      thoughtSnippet: 'Ready for interactive conversational tutoring.',
      followUpSuggestions: [
        'Explain with a simple real-world analogy',
        'Walk me through a step-by-step example',
        'Test my understanding with a quick question'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`$|]/g, ' ').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);
    setIsSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          subject,
          pedagogyMode,
          gradeLevel: 'Undergraduate',
          depthMode: 'balanced',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const tutorMsgId = `tutor-${Date.now()}`;

      const tutorMsg: ChatMessage = {
        id: tutorMsgId,
        sender: 'tutor',
        content: data.content || 'Let us break this down into clear steps.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtSnippet: data.thoughtSnippet,
        principles: data.principles,
        modelUsed: data.modelUsed,
        latencyMs: data.latencyMs,
        followUpSuggestions: data.followUpSuggestions || [
          'Can you elaborate on that step?',
          'Give me a simple real-world analogy',
          'Test my knowledge with an exam question'
        ],
      };

      setMessages((prev) => [...prev, tutorMsg]);
      onActivityLogged({
        title: `AI Tutor: ${subject}`,
        type: 'tutor',
        highlight: `Discussed: "${query.slice(0, 36)}..."`,
      });
    } catch (err) {
      console.error(err);
      const fallbackId = `tutor-${Date.now()}`;
      const fallbackMsg: ChatMessage = {
        id: fallbackId,
        sender: 'tutor',
        content: `### Understanding: **${query}**\n\nLet's break this down simply:\n\n1. **Core Concept:** At its heart, what we are doing here is relating the main input to the outcome in the simplest way possible.\n2. **Intuitive Example:** Imagine this like a conveyor belt or everyday workflow. If you change one element, how does the next stage react?\n3. **Quick Check:** What part of this feels most unclear to you? Let's clarify that first!`,
        timestamp: 'Just now',
        thoughtSnippet: 'Framed intuitive overview with clear next steps.',
        followUpSuggestions: [
          'Explain with an intuitive real-world analogy',
          'Give me a step-by-step mathematical example',
          'Challenge me with a quick diagnostic question'
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'tutor',
        content: `New session started for **${subject}**! Ask me any question or concept you want to master today.`,
        timestamp: 'Just now',
        followUpSuggestions: [
          'Teach me a tough concept simply',
          'Test me with a quick quiz question',
          'Explain with an everyday example'
        ]
      }
    ]);
  };

  const currentPromptObj = QUICK_TUTOR_PROMPTS.find(p => p.subject === subject);
  const starterPrompts = currentPromptObj ? [
    currentPromptObj.prompt,
    `Explain the most common mistakes students make in ${subject}`,
    `Give me an intuitive real-world example of this concept`
  ] : [
    'Explain the fundamental difference between BFS and DFS',
    'How does Gradient Descent work simply?',
    'What is the intuitive meaning of Eigenvalues?'
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[620px] bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Sleek App-Style Top Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">AI Tutor</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ready to assist" />
            </div>
            <p className="text-[11px] text-slate-500">Step-by-step Socratic guidance</p>
          </div>
        </div>

        {/* Controls: Subject & Mode */}
        <div className="flex items-center gap-2">
          {/* Subject Selector */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {ALL_SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Mode Selector */}
          <select
            value={pedagogyMode}
            onChange={(e) => setPedagogyMode(e.target.value as TutorPedagogyMode)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="socratic">Socratic (Guided)</option>
            <option value="feynman">Simple & Intuitive</option>
            <option value="rigorous">Deep Academic</option>
            <option value="exam_traps">Exam Traps</option>
          </select>

          {/* New Chat Button */}
          <button
            onClick={handleResetSession}
            title="Start New Chat"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </Markdown>
                    </div>
                  )}

                  {/* Message Footer: Actions for Tutor */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className="p-1 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors"
                          title="Listen"
                        >
                          {isSpeakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors"
                          title="Copy"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Thought Accordion */}
                {!isUser && msg.thoughtSnippet && (
                  <div className="pl-1">
                    <button
                      onClick={() => setShowThoughtId(showThoughtId === msg.id ? null : msg.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    >
                      {showThoughtId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span>{showThoughtId === msg.id ? 'Hide thinking' : 'Show reasoning process'}</span>
                    </button>
                    {showThoughtId === msg.id && (
                      <div className="mt-1 p-2.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] italic leading-normal border border-slate-200">
                        {msg.thoughtSnippet}
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up Suggestion Chips */}
                {!isUser && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.followUpSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 transition-all cursor-pointer font-medium shadow-2xs"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center text-slate-500 text-xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
              <span>Thinking and structuring response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer / Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 space-y-2">
        {/* Quick helper chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
          <span className="shrink-0 font-medium">Quick Prompts:</span>
          {starterPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="relative flex items-center gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a doubt or paste a problem in ${subject}...`}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none max-h-28"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
