'use client';

import { useEffect, useRef, useState } from 'react';

import { ChatBubbleIcon } from '@/components/icons/ChatBubbleIcon';
import { PaperAirplaneIcon } from '@/components/icons/PaperAirplaneIcon';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
};

export function MessageTab() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    inputRef.current?.focus();
    const listEl = listRef.current;
    if (!listEl) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      listEl.scrollTo({ top: listEl.scrollHeight, behavior: 'auto' });
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || input.trim().length === 0) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    const assistantId = crypto.randomUUID();
    const nextMessages = [...messagesRef.current, userMessage];

    setInput('');
    setIsLoading(true);
    setMessages([
      ...nextMessages,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to reach the chat service.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: message.content + chunk }
                : message,
            ),
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      setMessages((prev) =>
        prev.map((entry) =>
          entry.id === assistantId
            ? { ...entry, content: message }
            : entry,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex w-[min(92vw,360px)] flex-col overflow-hidden rounded-3xl border border-zinc-900/10 bg-white shadow-2xl backdrop-blur dark:border-white/10 dark:bg-charcoal-850">
          <div className="flex items-center justify-between border-b border-zinc-900/10 px-4 py-3 text-sm font-semibold text-zinc-900 dark:border-white/10 dark:text-white">
            <span>Message</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-2 py-1 text-xs text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              aria-label="Close message panel"
            >
              Close
            </button>
          </div>
          <div
            ref={listRef}
            className="flex max-h-[50vh] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 text-sm"
          >
            {messages.length === 0 && (
              <div className="rounded-2xl border border-zinc-900/10 bg-zinc-50 px-4 py-3 text-zinc-600 dark:border-white/10 dark:bg-charcoal-800 dark:text-zinc-300">
                Start a conversation. Ask about projects, notes, or anything else.
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`w-fit max-w-[85%] rounded-2xl px-4 py-2 leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-zinc-900 text-white dark:bg-white dark:text-charcoal-900'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-charcoal-800 dark:text-zinc-200'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="w-fit max-w-[85%] rounded-2xl bg-zinc-100 px-4 py-2 text-zinc-500 dark:bg-charcoal-800 dark:text-zinc-300">
                Thinking...
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-zinc-900/10 px-4 py-3 dark:border-white/10"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message"
              className="flex-1 rounded-full border border-zinc-900/10 bg-white px-4 py-2 text-sm text-zinc-700 outline-none transition focus:border-zinc-900/30 dark:border-white/10 dark:bg-charcoal-900 dark:text-zinc-200 dark:focus:border-white/30"
            />
            <button
              type="submit"
              disabled={isLoading || input.trim().length === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-charcoal-900 dark:hover:bg-zinc-200"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-4 w-4 stroke-current" />
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2 rounded-full border border-zinc-900/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 dark:border-white/10 dark:bg-white dark:text-charcoal-900 dark:hover:bg-zinc-200"
        aria-expanded={isOpen}
        aria-label="Toggle message panel"
      >
        <ChatBubbleIcon className="h-5 w-5 stroke-current" />
        <span className="hidden sm:inline">Message</span>
      </button>
    </div>
  );
}
