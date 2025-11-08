import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/UsersLoadingSkeleton";
import NoChatsFound from "../components/NoChatsFound";

const ChatsList = () => {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChatStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="p-4 transition-colors rounded-lg cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            {/* todo: fix this online status and make it work with socket */}
            <div className="avatar online">
              <div className="rounded-full size-12">
                <img
                  src={chat?.profilePic || "/avatar.png"}
                  alt={chat?.fullName}
                />
              </div>
            </div>
            <h4 className="font-medium truncate text-slate-200">
              {chat?.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatsList;
