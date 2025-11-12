import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { ArrowLeft, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, setViewingProfile } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);

    // Cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex items-center justify-between border-b bg-transparent backdrop-blur-md border-slate-700/50 max-h-[84px] px-6 flex-1 shadow-md">
      <div className="flex items-center space-x-3">
        {/* Mobile back button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 -ml-2 transition-colors rounded-full md:hidden hover:bg-slate-700/30"
          aria-label="Back"
        >
          <ArrowLeft className="size-5 text-slate-300" />
        </button>
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullName}
            />
          </div>
        </div>

        <button
          onClick={() => {
            setViewingProfile({ 
              user: selectedUser, 
              isOwnProfile: selectedUser._id === authUser._id 
            });
          }}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <h3 className="font-medium text-slate-300 cursor-pointer">
            {selectedUser.fullName}
          </h3>
          <p className="text-sm text-slate-400">
            {isOnline ? "Online" : "Offline"}
          </p>
        </button>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        className="items-center justify-center hidden p-2 transition-colors border border-transparent rounded-full md:flex hover:border-slate-500"
        aria-label="Close chat"
      >
        <XIcon className="transition-colors cursor-pointer size-5 text-slate-400 hover:text-slate-200" />
      </button>
    </div>
  );
};

export default ChatHeader;
