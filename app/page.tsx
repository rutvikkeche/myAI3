"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square, Sparkles } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = 'chat-messages';

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

// Pre-loaded prompts for querying chatbot
const SAMPLE_PROMPTS = [
  {
    icon: "📊",
    title: "Data Schema",
    prompt: "How does the data schema look like?"
  },
  {
    icon: "👥",
    title: "Customer insights",
    prompt: "What are the top 10 customers by revenue?"
  },
  {
    icon: "🛍️",
    title: "Category Insights",
    prompt: "Which category observed the most orders?"
  },
  {
    icon: "💰",
    title: "Average Order Value",
    prompt: "What is the average order value of the database?"
  }
];

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== 'undefined' ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    welcomeMessageShownRef.current = false;
    toast.success("Chat cleared");
    
    // Re-show welcome message
    setTimeout(() => {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
    }, 100);
  }

  function handlePromptClick(prompt: string) {
    form.setValue("message", prompt);
    sendMessage({ text: prompt });
    form.reset();
  }

  const showPrompts = messages.length <= 1;

  return (
    <div className="flex h-screen items-center justify-center font-sans bg-background">
      <main className="w-full bg-background h-screen relative flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src="/chat_logo.png" />
              <AvatarFallback>
                <Image src="/chat_logo.png" alt="Logo" width={32} height={32} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-semibold">{AI_NAME}</h1>
              <p className="text-xs text-muted-foreground">Query Assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer hover:bg-secondary"
            onClick={clearChat}
          >
            <Plus className="size-4 mr-2" />
            {CLEAR_CHAT_TEXT}
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {isClient ? (
              <>
                {/* Show prompts only when chat is new/empty */}
                {showPrompts && (
                  <div className="mb-12 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Sparkles className="size-8 text-primary" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-semibold">How can I help you today?</h2>
                      <p className="text-muted-foreground">
                        Start by asking a question or try one of these:
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                      {SAMPLE_PROMPTS.map((sample, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(sample.prompt)}
                          disabled={status === "streaming" || status === "submitted"}
                          className="group relative flex items-start gap-3 p-4 text-left rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="text-2xl mt-0.5">{sample.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                              {sample.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {sample.prompt}
                            </div>
                          </div>
                          <ArrowUp className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <MessageWall 
                  messages={messages} 
                  status={status} 
                  durations={durations} 
                  onDurationChange={handleDurationChange} 
                />
                
                {status === "submitted" && (
                  <div className="flex justify-start py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="message"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="chat-form-message" className="sr-only">
                        Message
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="chat-form-message"
                          className="h-12 pr-12 pl-4 bg-secondary/50 border-input rounded-xl resize-none focus:bg-background transition-colors"
                          placeholder="Ask anything..."
                          disabled={status === "streaming"}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                        {(status === "ready" || status === "error") && (
                          <Button
                            className="absolute right-2 top-2 rounded-lg size-8"
                            type="submit"
                            disabled={!field.value.trim()}
                            size="icon"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                        )}
                        {(status === "streaming" || status === "submitted") && (
                          <Button
                            className="absolute right-2 top-2 rounded-lg size-8"
                            size="icon"
                            variant="secondary"
                            onClick={() => {
                              stop();
                            }}
                          >
                            <Square className="size-3 fill-current" />
                          </Button>
                        )}
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
            
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} {OWNER_NAME}</span>
              <span>•</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Use
              </Link>
              <span>•</span>
              <Link href="https://ringel.ai/" className="hover:text-foreground transition-colors">
                Powered by Ringel.AI
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
