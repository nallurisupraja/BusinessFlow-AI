
import { useEffect, useState } from "react";
import type { Business } from "../features/businesses/types";
import { listBusinesses } from "../features/businesses/api";
import { chatWithAssistant } from "../features/ai-assistant/api";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Analyze my business performance",
  "How can I reduce my expenses?",
  "Give me revenue growth ideas",
  "How can I improve my profit?",
];

export function AIAssistantPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBusinesses() {
      setBusinessLoading(true);
      setBusinessError(null);

      try {
        const data = await listBusinesses();

        if (active) {
          setBusinesses(data);

          if (data.length > 0) {
            setSelectedBusinessId(data[0].id);
          }
        }
      } catch (err) {
        if (active) {
          setBusinessError(
            err instanceof Error
              ? err.message
              : "Could not load businesses.",
          );
        }
      } finally {
        if (active) {
          setBusinessLoading(false);
        }
      }
    }

    void loadBusinesses();

    return () => {
      active = false;
    };
  }, []);

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId,
  );

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setChatError(null);
  }

  async function handleSend(question?: string) {
    const message = (question ?? input).trim();

    if (!message || !selectedBusiness || sending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setChatError(null);
    setSending(true);

    try {
      const result = await chatWithAssistant(
        selectedBusiness.id,
        message,
      );

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.answer,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setChatError(
        err instanceof Error
          ? err.message
          : "Unable to get an AI response. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              ✦
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Business Assistant
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Your intelligent companion for better business decisions.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          disabled={sending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          + New Chat
        </button>
      </header>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm font-medium text-blue-900">
          Gemini AI Assistant
        </p>

        <p className="mt-1 text-xs text-blue-700">
          Ask questions and get answers using your selected business's
          available financial records.
        </p>
      </div>

      {businessError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {businessError}
        </p>
      )}

      {chatError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {chatError}
        </p>
      )}

      <section className="flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Business Chat
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Ask questions about your business.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <label
              htmlFor="ai-business"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Select Business
            </label>

            <select
              id="ai-business"
              value={selectedBusinessId}
              onChange={(event) => {
                setSelectedBusinessId(event.target.value);
                setMessages([]);
                setChatError(null);
              }}
              disabled={businessLoading || businesses.length === 0 || sending}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">
                {businessLoading
                  ? "Loading businesses..."
                  : "Select a business"}
              </option>

              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-slate-50 p-5">
          {businessLoading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading your businesses...
            </p>
          ) : businesses.length === 0 ? (
            <div className="m-auto max-w-md py-12 text-center">
              <div className="mb-4 text-4xl">🌱</div>

              <h3 className="text-lg font-semibold text-slate-900">
                No businesses found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add a business first to start using AI Business Assistant.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="m-auto w-full max-w-2xl py-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-700">
                ✦
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Hello! How can I help your business?
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Ask me about finances, expenses, revenue and business growth.
              </p>

              <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void handleSend(question)}
                    disabled={sending || !selectedBusiness}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <span className="mb-2 block text-blue-600">✦</span>
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    <p className="mb-2 text-xs font-semibold opacity-70">
                      {message.role === "user" ? "You" : "BusinessFlow AI"}
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  Preparing response...
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              rows={2}
              maxLength={2000}
              disabled={!selectedBusiness || sending}
              placeholder="Ask anything about your business..."
              className="min-h-12 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={!input.trim() || !selectedBusiness || sending}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-slate-400">
            AI-generated answers are based on the available records
            for the selected business.
          </p>
        </form>
      </section>
    </div>
  );
}
