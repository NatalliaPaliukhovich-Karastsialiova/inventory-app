import React, { useEffect, useState } from 'react';
import { type Message } from '@/services/socket/types';
import { connectChatSocket, joinInventoryRoom, leaveInventoryRoom, sendMessage } from '@/services/socket/chat';
import { useAuthStore } from "@/store/authStore";
import { loadMessages } from '@/services/api';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from "rehype-sanitize";

interface ChatProps {
  inventoryId: string;
}

export default function Chat({
  inventoryId
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const user = useAuthStore.getState().user

  useEffect(() => {
    const socket = connectChatSocket();

    loadMessages(inventoryId).then((data) => {
      setMessages(data);
    });

    joinInventoryRoom(inventoryId, user?.id as string);

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      leaveInventoryRoom(inventoryId, user?.id as string);
      socket.off('newMessage');
    };
  }, [inventoryId]);


  const handleSend = () => {
    if (text.trim()) {
      sendMessage(inventoryId, text, user?.id as string);
      setText('');
    }
  };


 return (
  <div className="bg-muted/50 min-h-screen flex flex-col rounded-xl grow-0">
    <div className="flex-1 overflow-y-auto p-10 space-y-3 pb-28">
      {messages.map((m) => {
        const isOwn = m.user.id === user?.id;
        return (
          <div
            key={m.id}
            className={`flex gap-3 mb-6 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            {!isOwn && (
              <img
                src={m.user.avatar}
                alt={m.user.fullName}
                className="w-8 h-8 rounded-lg"
              />
            )}
            <div className={`w-6/12`}>
              <div className={`font-semibold ${isOwn ? "text-right" : "text-left"}`}>{m.user.fullName}</div>
              <div
                className={`text-xs text-gray-400 ${isOwn ? "text-right" : "text-left"}`}
              >
                {m.user.email} - {new Date(m.createdAt).toLocaleString()}
              </div>
              <div
                className="prose prose-sm prose-stone dark:prose-invert max-w-none p-2 border rounded-md bg-muted/30 overflow-y-auto"
              >
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {m.text}
                </ReactMarkdown>
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

    <div className="sticky bottom-0 left-0 w-full border-t bg-muted p-4 flex gap-2 items-center">
      <Textarea
        placeholder="Write your message in Markdown..."
        rows={3}
        value={text ?? ""}
        onChange={(e) => setText(e.target.value)}
        className="resize-none font-mono flex-1"
      />
      <Button
        onClick={handleSend}
        className="px-4"
      >
        Send
      </Button>
    </div>
  </div>
);

}
