"use client";

import { useEffect, useRef, useState } from "react";
import type { MentorMessage } from "@/lib/mentor";

interface MentorChatProps {
  messages: MentorMessage[];
  onSend: (message: string) => Promise<void>;
  loading: boolean;
  hasCode: boolean;
  onSendWithCode: () => void;
}

function MessageBubble({ msg }: { msg: MentorMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs">
          🧠
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? "rounded-tr-sm bg-violet-600 text-white"
          : "rounded-tl-sm bg-[#1e1e30] text-[#c0c0d8]"
      }`}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs">🧠</div>
      <div className="rounded-2xl rounded-tl-sm bg-[#1e1e30] px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export default function MentorChat({ messages, onSend, loading, hasCode, onSendWithCode }: MentorChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await onSend(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#2d2d4e] bg-[#0d0d1a]">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#2d2d4e] px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-sm">🧠</div>
        <div>
          <p className="text-sm font-semibold text-white">AI Mentor</p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-[#6b6b8a]">Powered by Groq</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#2d2d4e] p-3">
        {hasCode && (
          <button
            onClick={onSendWithCode}
            disabled={loading}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/10 py-2 text-xs font-medium text-violet-400 transition hover:bg-violet-600/20 disabled:opacity-50"
          >
            <span>📎</span> Review my code
          </button>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for a hint, explain your thinking..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#2d2d4e] bg-[#13131f] px-3 py-2.5 text-sm text-white placeholder-[#4a4a6a] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-[#4a4a6a]">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
