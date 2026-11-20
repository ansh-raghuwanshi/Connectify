import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../socket.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user._id;

  if (!recipientId) {
    throw new apiError(400, "Recipient ID is required");
  }

  if (!content || !content.trim()) {
    throw new apiError(400, "Message content cannot be empty");
  }

  if (recipientId.toString() === senderId.toString()) {
    throw new apiError(400, "Cannot send a message to yourself");
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new apiError(404, "Recipient user not found");
  }

  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    content: content.trim(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name role profilePicture")
    .populate("recipient", "name role profilePicture");

  try {
    const io = getIO();
    if (io) {
      io.to(recipientId.toString()).emit("receive_message", populatedMessage);
      io.to(senderId.toString()).emit("receive_message", populatedMessage);
    }
  } catch (socketErr) {
    console.warn("[Socket.io] Real-time broadcast failed:", socketErr.message);
  }

  return res
    .status(201)
    .json(new apiResponse(201, "Message sent successfully", populatedMessage));
});

const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const { page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const query = {
    $or: [
      { sender: currentUserId, recipient: userId },
      { sender: userId, recipient: currentUserId },
    ],
  };

  const [total, messages] = await Promise.all([
    Message.countDocuments(query),
    Message.find(query)
      .populate("sender", "name role profilePicture")
      .populate("recipient", "name role profilePicture")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  await Message.updateMany(
    { sender: userId, recipient: currentUserId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return res.status(200).json({
    success: true,
    message: "Conversation retrieved successfully",
    data: messages,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getConversationsList = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: currentUserId }, { recipient: currentUserId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", currentUserId] },
            "$recipient",
            "$sender",
          ],
        },
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "partner",
      },
    },
    { $unwind: "$partner" },
    {
      $project: {
        partner: {
          _id: 1,
          name: 1,
          role: 1,
          profilePicture: 1,
          currentCompany: 1,
        },
        lastMessage: {
          _id: 1,
          content: 1,
          createdAt: 1,
          sender: 1,
          isRead: 1,
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, "Conversations retrieved successfully", messages));
});

export { sendMessage, getConversation, getConversationsList };
