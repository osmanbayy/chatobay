import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  viewingProfile: null, // null | { user, isOwnProfile: boolean }
  unreadCounts: {}, // { userId: count }
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  isProfileModalOpen: false,
  isLogoutModalOpen: false,
  selectedImage: null,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setViewingProfile: (viewingProfile) => set({ viewingProfile }),

  setSelectedImage: (selectedImage) => set({ selectedImage }),

  setIsProfileModalOpen: () => set(state => ({ isProfileModalOpen: !state.isProfileModalOpen })),

  setIsLogoutModalOpen: () => set(state => ({ isLogoutModalOpen: !state.isLogoutModalOpen })),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/message/contacts");
      set({ allContacts: response.data });
    } catch (error) {
      console.error("Error in getAllContacts: ", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false })
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/message/chats");
      const chats = response.data;
      
      // Update unread counts
      const unreadCounts = {};
      chats.forEach((chat) => {
        const chatId = chat._id || chat.id;
        if (chat.unreadCount && chat.unreadCount > 0) {
          unreadCounts[chatId] = chat.unreadCount;
        }
      });

      set({ chats, unreadCounts });
    } catch (error) {
      console.error("Error in getMyChatPartners: ", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false })
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      // Backend'den gelen mesajların isRead durumunu koru
      const messagesWithStatus = response.data.messages.map(msg => ({
        ...msg,
        isRead: msg.isRead || false,
        isDelivered: msg.isDelivered !== undefined ? msg.isDelivered : true
      }));
      
      set({ messages: messagesWithStatus });
      
      // Reset this user's notification count when messages are loaded
      const { unreadCounts } = get();
      const updatedCounts = { ...unreadCounts };
      // UserId comes as a string, use it directly
      delete updatedCounts[userId];
      set({ unreadCounts: updatedCounts });
    } catch (error) {
      console.error("Error in getMyChatPartners: ", error);
      toast.error(error?.response?.data?.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isRead: false,
      isDelivered: false,
      isOptimistic: true
    }
    set({ messages: [...messages, optimisticMessage] });

    try {
      const response = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      
      // Optimistic message'ı gerçek mesajla değiştir
      const currentMessages = get().messages;
      const updatedMessages = currentMessages.map(msg => {
        if (msg._id === tempId) {
          return { 
            ...response.data, 
            isDelivered: false,
            isRead: false 
          };
        }
        return msg;
      });
      
      const messageExists = updatedMessages.some(msg => 
        msg._id === response.data._id || 
        msg._id?.toString() === response.data._id?.toString()
      );
      
      if (!messageExists) {
        updatedMessages.push({ 
          ...response.data, 
          isDelivered: false, 
          isRead: false 
        });
      }

      set({ messages: updatedMessages });

    } catch (error) {
      console.error("Error in sendMessage: ", error);
      const currentMessages = get().messages;
      const filteredMessages = currentMessages.filter(msg => msg._id !== tempId);
      set({ messages: filteredMessages });
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket not available for subscribing to messages");
      return;
    }
    
    // When new message came from selectedUser
    const handleNewMessage = async (newMessage) => {
      const selectedUserId = selectedUser._id?.toString() || selectedUser._id;
      const messageSenderId = newMessage.senderId?.toString() || newMessage.senderId;
      const isMessageSentFromSelectedUser = messageSenderId === selectedUserId;
      
      if (isMessageSentFromSelectedUser) {
        const currentMessages = get().messages;
        // Check if message already exists (avoid duplicates)
        const messageExists = currentMessages.some(msg => {
          const msgId = msg._id?.toString() || msg._id;
          const newMsgId = newMessage._id?.toString() || newMessage._id;
          return msgId === newMsgId;
        });
        
        if (!messageExists) {
          const newMessageWithStatus = { ...newMessage, isDelivered: false, isRead: false };
          set({ messages: [...currentMessages, newMessageWithStatus] });
          
          try {
            await axiosInstance.post("/message/mark-read", { senderId: messageSenderId });
          } catch (error) {
            console.error("Error marking message as read:", error);
          }
        }

        if (isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3")
          notificationSound.currentTime = 0;
          notificationSound.play().catch(e => console.log("Audio play failed: ", e));
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  }
}))