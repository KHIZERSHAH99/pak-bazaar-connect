
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveChat, getChatHistory } from "@/lib/chat";
import { MessageCircle } from "lucide-react";

const ChatSupport: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      // Call OpenAI via Supabase Edge Function (see below for /functions/chatbot) 
      const response = await fetch("/functions/v1/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });
      const data = await response.json();
      setReply(data.reply || data.generatedText || "No reply.");
      // Save to chat history
      await saveChat(question, data.reply || data.generatedText);
      setHistory(await getChatHistory());
      setQuestion("");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getChatHistory().then(setHistory);
  }, []);

  return (
    <div className="max-w-lg mx-auto py-10">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6 text-pakistani_green-700" />
          <h1 className="text-lg font-poppins font-semibold">Chatbot Support</h1>
        </div>
        <div className="space-y-4">
          <div>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something (e.g., How to create an ad?)"
              disabled={loading}
              className="mb-2"
            />
            <Button onClick={handleSend} disabled={loading || !question.trim()}>
              {loading ? "Asking..." : "Ask"}
            </Button>
          </div>
          <div>
            {history.length > 0 && (
              <div className="mt-4">
                <h2 className="font-poppins font-medium">Chat History</h2>
                <ul className="space-y-2">
                  {history.map((h, i) => (
                    <li key={h.id || i} className="text-gray-800">
                      <span className="font-semibold">You:</span>{" "}
                      <span>{h.message}</span>
                      <br />
                      <span className="font-semibold">AI:</span>{" "}
                      <span className="italic">{h.reply}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatSupport;
