"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User } from "lucide-react";
import { DEMO } from "@/lib/landing-demo-theme";

export interface ChatMessage {
  role: "agent" | "user";
  text: string;
  isTyping?: boolean;
}

interface AgentChatProps {
  messages: ChatMessage[];
  className?: string;
  maxHeight?: number;
}

export function AgentChat({ messages, className = "", maxHeight = 200 }: AgentChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [messages.length]);

  return (
    <div
      ref={scrollRef}
      className={`flex flex-col gap-2.5 overflow-y-auto rounded-xl p-3.5 ${className}`}
      style={{
        background: DEMO.panelBlue,
        border: `1px solid ${DEMO.border}`,
        maxHeight,
        scrollbarWidth: "thin",
        scrollbarColor: `${DEMO.border} transparent`,
      }}
      role="log"
      aria-live="polite"
      aria-label="Trust Agent conversation"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{
                background: msg.role === "agent" ? "rgba(37,99,235,0.1)" : "rgba(59,130,246,0.1)",
                border: msg.role === "agent" ? `1px solid ${DEMO.border}` : "1px solid rgba(59,130,246,0.25)",
              }}
              aria-hidden
            >
              {msg.role === "agent" ? (
                <Bot size={10} style={{ color: DEMO.primary }} />
              ) : (
                <User size={10} style={{ color: DEMO.primaryLight }} />
              )}
            </div>
            <div
              className="max-w-[78%] rounded-xl px-2.5 py-1.5 text-[11px] leading-relaxed"
              style={{
                background: msg.role === "agent" ? DEMO.panel : "rgba(59,130,246,0.06)",
                border: msg.role === "agent" ? `1px solid ${DEMO.borderLight}` : "1px solid rgba(59,130,246,0.18)",
                color: msg.role === "agent" ? DEMO.textSoft : DEMO.primaryDark,
              }}
            >
              {msg.isTyping ? (
                <span className="flex h-3 items-center gap-1">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1 w-1 rounded-full"
                      style={{ background: DEMO.primary }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }}
                      aria-hidden
                    />
                  ))}
                </span>
              ) : (
                msg.text
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
