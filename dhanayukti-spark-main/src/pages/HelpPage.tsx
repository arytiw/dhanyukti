import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

type Msg = { role: "user" | "assistant"; text: string };

const HelpPage = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! Ask me anything about Dhanyukti or personal finance." },
  ]);

  const send = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setMessage("");
    setLoading(true);

    try {
      // Same-origin call. In Docker, nginx proxies /api/support/* to the Support service.
      const { data } = await axios.post<string>("/api/support/chat", { message: trimmed });
      setMessages((m) => [...m, { role: "assistant", text: String(data) }]);
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || "Failed to reach support service";
      toast({ title: "Support error", description: String(msg), variant: "destructive" });
      setMessages((m) => [...m, { role: "assistant", text: "Sorry — I couldn't respond right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[420px] overflow-auto rounded-md border p-3 space-y-3 bg-background">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    "inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question…"
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              disabled={loading}
            />
            <Button onClick={send} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            If this is running in Docker, the URL is proxied via nginx at <code>/api/support/chat</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;

