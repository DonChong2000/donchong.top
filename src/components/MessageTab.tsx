'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ChatBubbleSolidIcon } from '@/components/icons/ChatBubbleSolidIcon';

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
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [loadingFrame, setLoadingFrame] = useState(0);
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

  useEffect(() => {
    if (!isLoading) {
      setLoadingFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % 2);
    }, 200);
    return () => {
      clearInterval(interval);
    };
  }, [isLoading]);

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
        body: JSON.stringify({
          messages: nextMessages,
          detailMode: isDetailMode,
        }),
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
          entry.id === assistantId ? { ...entry, content: message } : entry,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-x-3 bottom-6 z-50 flex justify-center sm:inset-auto sm:right-6 sm:bottom-6 sm:justify-end">
          <div
            className={`flex w-[min(96vw,420px)] flex-col overflow-hidden rounded-xl border border-zinc-900/10 bg-white shadow-2xl backdrop-blur dark:border-white/10 dark:bg-charcoal-700 dark:shadow-zinc-500/15 sm:w-[min(92vw,360px)] ${
              isDetailMode ? 'lg:w-[min(92vw,720px)]' : ''
            }`}
          >
          <div className="flex items-center justify-end gap-3 border-b border-zinc-900/10 px-4 py-3 text-sm font-semibold text-zinc-500 dark:border-white/10 dark:text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-300">
                Detail Mode
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isDetailMode}
                  onChange={(event) => setIsDetailMode(event.target.checked)}
                  aria-label="Toggle detail mode"
                />
                <span className="h-5 w-9 rounded-full bg-zinc-300 transition peer-checked:bg-charcoal-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-500 dark:bg-zinc-600 dark:peer-checked:bg-white/90" />
                <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4 dark:bg-charcoal-700" />
              </label>
            </div>
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
            className="subtle-scrollbar flex max-h-[50vh] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 text-sm"
          >
            {messages.length === 0 && (
              <div className="rounded-2xl border border-zinc-900/10 bg-zinc-50 px-4 py-3 text-zinc-600 dark:border-white/10 dark:bg-charcoal-800 dark:text-zinc-300">
                Ask about projects, notes, experience or dive into Don’s
                thoughts on AI.
              </div>
            )}
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`w-fit max-w-[85%] rounded-2xl px-4 py-2 leading-relaxed ${
                    isUser
                      ? 'ml-auto bg-zinc-700 text-white dark:bg-timberwolf-100 dark:text-charcoal-900'
                      : 'bg-timberwolf-100 text-zinc-700 dark:bg-charcoal-800 dark:text-zinc-200'
                  }`}
                >
                  {isUser ? (
                    message.content
                  ) : (
                    <div className="prose-sm prose max-w-none dark:prose-invert prose-p:my-0 prose-a:text-zinc-700 prose-a:underline dark:prose-a:text-zinc-100 prose-code:rounded prose-code:bg-zinc-200/70 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-white/10 prose-pre:my-2 prose-pre:rounded-lg prose-pre:bg-zinc-900/90 prose-pre:px-3 prose-pre:py-2 prose-pre:text-zinc-100 dark:prose-pre:bg-black/40">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="w-fit max-w-[85%] rounded-2xl py-2 text-zinc-500 dark:text-zinc-300">
                {loadingFrame === 0 ? '🐋...' : '🐬...'}
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="border-t border-zinc-900/10 px-4 py-3 dark:border-white/10"
          >
            <div className="relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a message..."
                className="w-full rounded-md bg-zinc-50 px-3 py-2 pr-16 text-sm text-zinc-800 transition outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-charcoal-750 dark:text-zinc-100 dark:focus:bg-charcoal-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                className="text-zinc-500transition absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold tracking-wide hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-zinc-200"
                aria-label="Send message"
              >
                ENTER
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      {!isOpen && (
        <div className="fixed right-3 bottom-6 z-50 flex flex-col items-end gap-3 sm:right-6">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="group flex items-center gap-2 rounded-full border border-zinc-900/10 bg-charcoal-500/95 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-charcoal-700/95 dark:border-white/10 dark:bg-timberwolf-100/95 dark:text-charcoal-900 dark:hover:bg-zinc-200/95"
            aria-expanded={isOpen}
            aria-label="Toggle message panel"
          >
            <ChatBubbleSolidIcon className="h-5 w-5 text-white dark:text-charcoal-600" />
            <span className="hidden sm:inline">Ask me</span>
          </button>
        </div>
      )}
    </>
  );
}
