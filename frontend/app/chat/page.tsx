"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Chat</h2>
        <p className="text-muted-foreground">Talk to your fitness experts.</p>
      </div>

      <Tabs defaultValue="buddy" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="buddy">Gym Buddy</TabsTrigger>
          <TabsTrigger value="dietitian">Dietitian</TabsTrigger>
        </TabsList>
        <TabsContent value="buddy" className="flex-1 min-h-0">
          <ChatWindow type="buddy" />
        </TabsContent>
        <TabsContent value="dietitian" className="flex-1 min-h-0">
          <ChatWindow type="dietitian" />
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  );
}

function ChatWindow({ type }: { type: "buddy" | "dietitian" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = `ws://localhost:8000/api/${type}/chat?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = (error) => console.error(`WS Error (${type}):`, error);

    return () => ws.close();
  }, [type]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    socketRef.current.send(input);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-250px)]">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-sm font-medium flex items-center">
          <div className={cn("h-2 w-2 rounded-full mr-2", connected ? "bg-green-500" : "bg-red-500")} />
          {type === "buddy" ? "Gym Guru Buddy" : "Gym Guru Dietitian"}
          {!connected && <span className="ml-2 text-xs font-normal text-muted-foreground">(Disconnected)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-8">
                Ask me anything about {type === "buddy" ? "workouts and form!" : "nutrition and meal planning!"}
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("flex max-w-[80%] items-start space-x-2", msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row")}>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", msg.role === "user" ? "bg-primary" : "bg-secondary")}>
                    {msg.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn("p-3 rounded-lg text-sm", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form className="flex w-full space-x-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!connected}
          />
          <Button type="submit" size="icon" disabled={!connected || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
