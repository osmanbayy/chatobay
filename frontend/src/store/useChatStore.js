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
      set({ chats: response.data });
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
      set({ messages: response.data.messages })
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
      createdAt: new Date().toLocaleString(),
      isOptimistic: true
    }
    set({ messages: [...messages, optimisticMessage] });

    try {
      const response = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);

      set({ messages: messages.concat(response.data) });

    } catch (error) {
      console.error("Error in sendMessage: ", error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3")
        notificationSound.currentTime = 0;  // reset to start
        notificationSound.play().catch(e => console.log("Audio play failed: ", e));
      }
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  }
}))