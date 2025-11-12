import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageStatus from "./MessageStatus";

const ChatContainer = () => {
  const { 
    messages, 
    getMessagesByUserId, 
    selectedUser, 
    isMessagesLoading, 
    subscribeToMessages, 
    unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    
    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-400">
        Bir sohbet seçin
      </div>
    );
  }

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble relative ${
                    message.senderId === authUser._id
                      ? "bg-cyan-800 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Shared image"
                      className="object-cover h-48 rounded-lg"
                    />
                  )}
                  {message.text && <p className="mt-2">{message.text}</p>}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-75">
                      {new Date(message.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    {/* Message status for our messages */}
                    {message.senderId === authUser._id && (
                      <MessageStatus 
                        isRead={message.isRead} 
                        isDelivered={message.isDelivered !== false}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
};

export default ChatContainer;
