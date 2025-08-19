import React, { useEffect, useState } from "react";
import { type Message } from "@/services/socket/types";
import {
  connectChatSocket,
  joinInventoryRoom,
  leaveInventoryRoom,
  sendMessage
} from "@/services/socket/chat";
import { useAuthStore } from "@/store/authStore";
import { loadMessages } from "@/services/api";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface ChatProps {
  inventoryId: string;
  readOnly: boolean;
}

export default function Chat({ inventoryId, readOnly }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const user = useAuthStore.getState().user;
  const { t } = useTranslation();

  useEffect(() => {
    const socket = connectChatSocket();

    loadMessages(inventoryId).then((data) => {
      setMessages(data);
    });

    joinInventoryRoom(inventoryId, user?.id as string);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      leaveInventoryRoom(inventoryId, user?.id as string);
      socket.off("newMessage");
    };
  }, [inventoryId]);

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(inventoryId, text, user?.id as string);
      setText("");
    }
  };

  return (
    <div className="bg-muted/50 min-h-screen flex flex-col rounded-xl grow-0">
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 pb-28">
        {messages.map((m) => {
          const isOwn = m.user.id === user?.id;
          return (
            <div
              key={m.id}
              className={`flex gap-3 mb-4 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwn && (
                <img
                  src={m.user.avatar}
                  alt={m.user.fullName}
                  className="w-8 h-8 rounded-lg"
                />
              )}
              <div className="max-w-[85%] sm:max-w-[60%] border rounded-md bg-muted/90 p-2">
                <div
                  className={`font-semibold ${
                    isOwn ? "text-right" : "text-left"
                  }`}
                >
                  {m.user.fullName}
                </div>
                <div
                  className={`text-xs text-gray-400 ${
                    isOwn ? "text-right" : "text-left"
                  }`}
                >
                  {m.user.email}
                </div>
                <div className="prose prose-sm prose-stone dark:prose-invert max-w-none p-3 overflow-y-auto">
                  <Separator />
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {m.text}
                  </ReactMarkdown>
                </div>
                <div className="text-xs text-gray-400 text-right">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
              {isOwn && (
                <img
                  src={m.user.avatar}
                  alt={m.user.fullName}
                  className="w-8 h-8 rounded-lg"
                />
              )}
            </div>
          );
        })}
      </div>

      {user && !readOnly && (
        <div className="sticky bottom-0 left-0 w-full p-3 sm:p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-muted/50">
          <Textarea
            placeholder={t("chat.typeYourMessage")}
            rows={3}
            value={text ?? ""}
            onChange={(e) => setText(e.target.value)}
            className="resize-none font-mono flex-1 bg-white dark:bg-slate-800 border-slate-500"
          />
          <Button onClick={handleSend} className="px-4 w-full sm:w-auto">
            {t("chat.sendMessage")}
          </Button>
        </div>
      )}
    </div>
  );
}
