import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

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
      set({ messages: response.data })
    } catch (error) {
      console.error("Error in getMyChatPartners: ", error);
      toast.error(error?.response?.data?.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
}))