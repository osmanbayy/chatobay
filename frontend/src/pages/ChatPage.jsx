import React from "react";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useChatStore } from "../store/useChatStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import LogoutModal from "../components/modals/LogoutModal";
import ProfileImageModal from "../components/modals/ProfileImageModal";
import { useAuthStore } from "../store/useAuthStore";

const ChatPage = () => {
  const { authUser } = useAuthStore();
  const { activeTab, selectedUser, selectedImage } = useChatStore();
  return (
    <div className="relative w-full max-w-6xl lg:h-[800px] h-[85vh]">
      <BorderAnimatedContainer>
        {/* Mobile (default) view: show only one pane like WhatsApp */}
        <div className="flex w-full h-full md:hidden">
          {selectedUser ? (
            <div className="flex flex-col flex-1 bg-slate-900/50 backdrop-blur-sm">
              <ChatContainer />
            </div>
          ) : (
            <div className="flex flex-col flex-1 bg-slate-800/50 backdrop-blur-sm">
              <ProfileHeader />
              <ActiveTabSwitch />
              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
              </div>
            </div>
          )}
        </div>

        {/* Desktop / Tablet view: two panes side-by-side */}
        <div className="hidden w-full h-full md:flex">
          {/* Left Side */}
          <div className="flex flex-col w-80 bg-slate-800/50 backdrop-blur-sm">
            <ProfileHeader />
            <ActiveTabSwitch />

            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col flex-1 bg-slate-900/50 backdrop-blur-sm">
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>
        </div>

        {/* Logout Modal */}
        <LogoutModal />

        {/* Profile Image Modal */}
        <ProfileImageModal authUser={authUser} selectedImage={selectedImage} />
        
      </BorderAnimatedContainer>
    </div>
  );
};

export default ChatPage;
