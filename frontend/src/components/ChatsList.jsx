import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/UsersLoadingSkeleton";
import NoChatsFound from "../components/NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

const ChatsList = () => {
  const {
    getMyChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    unreadCounts,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const chatId = chat._id || chat.id; // _id veya id field'ını kullan
        const unreadCount = unreadCounts[chatId] || 0;

        return (
          <div
            key={chatId}
            className="p-4 transition-colors rounded-lg cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`avatar ${
                  onlineUsers.includes(chatId) ? "online" : "offline"
                }`}
              >
                <div className="rounded-full size-12">
                  <img
                    src={chat?.profilePic || "/avatar.png"}
                    alt={chat?.fullName}
                  />
                </div>
              </div>
              <div className="relative flex-1 min-w-0">
                <h4 className="font-medium truncate text-slate-200">
                  {chat?.fullName}
                </h4>
                <div>
                  {/* Notification badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-3 flex items-center justify-center min-w-[20px] h-5 px-2.5 text-xs font-semibold text-white bg-green-500 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChatsList;
