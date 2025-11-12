import User from "../models/User.js";
import Message from "../models/Message.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (request, response) => {
  try {
    const loggedInUserId = request.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    response.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    response.status(500).json({ message: "Internal Server error" });
  }
}

export const getChatPartners = async (request, response) => {
  try {
    const loggedInUserId = request.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    // Calculate the number of unread messages for each user
    const chatPartnersWithUnread = await Promise.all(
      chatPartners.map(async (partner) => {
        const unreadCount = await Message.countDocuments({
          senderId: partner._id,
          receiverId: loggedInUserId,
          isRead: false
        });

        if (unreadCount > 0) {
          console.log(`Unread messages from ${partner.fullName} (${partner._id}):`, unreadCount);
        }

        return {
          ...partner.toObject(),
          unreadCount
        };
      })
    );

    response.status(200).json(chatPartnersWithUnread);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const getMessagesByUserId = async (request, response) => {
  try {
    const myId = request.user._id;
    const { id: userToChatId } = request.params;

    // Mark all messages from this user as read FIRST
    const updatedMessages = await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: myId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    // If messages were marked as read, notify the sender
    if (updatedMessages.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(userToChatId);
      if (senderSocketId) {
        // Get all message IDs that were just marked as read
        const readMessages = await Message.find({
          senderId: userToChatId,
          receiverId: myId,
          isRead: true
        }).select("_id").sort({ createdAt: -1 }).limit(updatedMessages.modifiedCount);

        io.to(senderSocketId).emit("messagesRead", {
          messageIds: readMessages.map(msg => msg._id.toString()),
          readBy: myId.toString()
        });
      }
    }

    // Now get all messages with updated read status
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Count unread messages and report via socket
    const unreadCount = await Message.countDocuments({
      senderId: userToChatId,
      receiverId: myId,
      isRead: false
    });

    // Send notification updates via socket
    const receiverSocketId = getReceiverSocketId(myId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("unreadCountUpdated", {
        userId: userToChatId,
        unreadCount: 0
      });
    }

    response.status(200).json({ success: true, messages });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const markMessagesAsRead = async (request, response) => {
  try {
    const myId = request.user._id;
    const { senderId } = request.body;

    if (!senderId) {
      return response.status(400).json({ success: false, message: "Sender ID is required." });
    }

    // Mark all messages from this sender as read
    const updatedMessages = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: myId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    // If messages were marked as read, notify the sender
    if (updatedMessages.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        // Get all message IDs that were just marked as read
        const readMessages = await Message.find({
          senderId: senderId,
          receiverId: myId,
          isRead: true
        }).select("_id").sort({ createdAt: -1 }).limit(updatedMessages.modifiedCount);

        io.to(senderSocketId).emit("messagesRead", {
          messageIds: readMessages.map(msg => msg._id.toString()),
          readBy: myId.toString()
        });
      }
    }

    return response.status(200).json({ 
      success: true, 
      message: "Messages marked as read.",
      count: updatedMessages.modifiedCount 
    });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const sendMessage = async (request, response) => {
  try {
    const { text, image } = request.body;
    const { id: receiverId } = request.params;
    const senderId = request.user._id;

    if (!text && !image) {
      return response.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return response.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return response.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    
    // Calculate the number of unread messages for the recipient
    const unreadCount = await Message.countDocuments({
      senderId: senderId,
      receiverId: receiverId,
      isRead: false
    });

    console.log(`Unread count for user ${receiverId} from ${senderId}:`, unreadCount);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      
      io.to(receiverSocketId).emit("unreadCountUpdated", {
        userId: senderId.toString(),
        unreadCount: unreadCount
      });
      
      console.log(`Sent unreadCountUpdated to socket ${receiverSocketId}:`, {
        userId: senderId.toString(),
        unreadCount: unreadCount
      });

      // Notify sender that message was delivered (receiver is online)
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: newMessage._id.toString()
        });
      }
    } else {
      console.log(`Receiver ${receiverId} is not online, unreadCount will be updated on next chat load`);
    }

    response.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}