import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isVerifyingEmail: false,
  isResendingCode: false,
  isCompletingOnboarding: false,
  socket: null,
  onlineUsers: [],

  setAuthUser: (user) => {
    set({ authUser: user });

    if (user?.isVerified && user?.onboardingCompleted) {
      get().connectSocket();
    } else {
      get().disconnectSocket();
    }
  },

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      get().setAuthUser(response.data);
    } catch (error) {
      console.error("Error in authCheck: ", error);
      set({ authUser: null });
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      get().setAuthUser(response.data?.user);

      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Error in signup: ", error);
      toast.error(error?.response?.data?.message || "Failed to create account.");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      get().setAuthUser(response?.data?.user);

      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Error in login: ", error);
      toast.error(error?.response?.data?.message || "Failed to login.");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().setAuthUser(null);

      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error in logout: ", error);
      toast.error(error?.response?.data?.message || "Failed to logout.");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await axiosInstance.put("/auth/update-profile", data);
      get().setAuthUser(response?.data?.updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error in update profile: ", error);
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  verifyEmail: async (code) => {
    set({ isVerifyingEmail: true });
    try {
      const response = await axiosInstance.post("/auth/verify-email", { code });
      get().setAuthUser(response?.data?.user);
      toast.success("Email verified successfully!");
    } catch (error) {
      console.error("Error in verify email: ", error);
      toast.error(error?.response?.data?.message || "Failed to verify email.");
      throw error;
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  resendVerificationCode: async () => {
    set({ isResendingCode: true });
    try {
      await axiosInstance.post("/auth/resend-code");
      toast.success("Verification code sent!");
    } catch (error) {
      console.error("Error in resend verification code: ", error);
      toast.error(error?.response?.data?.message || "Failed to resend verification code.");
    } finally {
      set({ isResendingCode: false });
    }
  },

  completeOnboarding: async (data) => {
    set({ isCompletingOnboarding: true });
    try {
      const response = await axiosInstance.put("/auth/onboarding", data);
      get().setAuthUser(response?.data?.user);
      toast.success("Onboarding completed!");
    } catch (error) {
      console.error("Error in complete onboarding: ", error);
      toast.error(error?.response?.data?.message || "Failed to complete onboarding.");
      throw error;
    } finally {
      set({ isCompletingOnboarding: false });
    }
  },

  deleteAccount: async () => {
    try {
      await axiosInstance.delete("/auth/delete-account");
      get().setAuthUser(null);
      get().disconnectSocket();
      toast.success("Account deleted successfully.");
    } catch (error) {
      console.error("Error in delete account: ", error);
      toast.error(error?.response?.data?.message || "Failed to delete account.");
      throw error;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || !authUser.isVerified || !authUser.onboardingCompleted || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,    // this ensures cookies are sent with the connection
    });
    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    });

    // listen for unread count updates (listen always)
    // Dynamic import to avoid circular dependency
    socket.on("unreadCountUpdated", async ({ userId, unreadCount }) => {
      const { useChatStore } = await import("./useChatStore.js");
      const { unreadCounts } = useChatStore.getState();
      const updatedCounts = { ...unreadCounts };
      
      if (unreadCount > 0) {
        updatedCounts[userId] = unreadCount;
      } else {
        delete updatedCounts[userId];
      }
      useChatStore.setState({ unreadCounts: updatedCounts });
    });

    // Global message delivered listener (for all messages)
    socket.on("messageDelivered", async ({ messageId }) => {
      const { useChatStore } = await import("./useChatStore.js");
      const { messages } = useChatStore.getState();
      const updatedMessages = messages.map(msg => {
        const msgId = msg._id?.toString() || msg._id;
        const targetId = messageId?.toString() || messageId;
        return msgId === targetId
          ? { ...msg, isDelivered: true }
          : msg;
      });
      useChatStore.setState({ messages: updatedMessages });
    });

    // Global messages read listener (for all messages)
    socket.on("messagesRead", async ({ messageIds }) => {
      const { useChatStore } = await import("./useChatStore.js");
      const { messages } = useChatStore.getState();
      const updatedMessages = messages.map(msg => {
        const msgId = msg._id?.toString() || msg._id;
        const isRead = messageIds.some(id => {
          const readId = id?.toString() || id;
          return msgId === readId;
        });
        return isRead
          ? { ...msg, isRead: true, isDelivered: true }
          : msg;
      });
      useChatStore.setState({ messages: updatedMessages });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));