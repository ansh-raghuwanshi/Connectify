import { Post } from "../model/post.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPost = asyncHandler(async (req, res) => {
  const { content, mediaUrl, tags } = req.body;

  if (!content || !content.trim()) {
    throw new apiError(400, "Post content is required");
  }

  const post = await Post.create({
    author: req.user._id,
    content: content.trim(),
    mediaUrl: mediaUrl || "",
    tags: Array.isArray(tags) ? tags : [],
  });

  const populatedPost = await Post.findById(post._id).populate(
    "author",
    "name role profilePicture currentCompany jobTitle"
  );

  return res
    .status(201)
    .json(new apiResponse(201, "Post published successfully", populatedPost));
});

const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, authorId, tag } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (authorId) filter.author = authorId;
  if (tag) filter.tags = tag.toLowerCase().trim();

  const [total, posts] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .populate("author", "name role profilePicture currentCompany jobTitle")
      .populate("comments.author", "name role profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const formattedPosts = posts.map((post) => ({
    ...post,
    likesCount: post.likes ? post.likes.length : 0,
    commentsCount: post.comments ? post.comments.length : 0,
    isLikedByMe: req.user
      ? post.likes.some((likeId) => likeId.toString() === req.user._id.toString())
      : false,
  }));

  return res.status(200).json({
    success: true,
    message: "Posts retrieved successfully",
    data: formattedPosts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate("author", "name role profilePicture currentCompany jobTitle")
    .populate("comments.author", "name role profilePicture");

  if (!post) {
    throw new apiError(404, "Post not found");
  }

  const postObj = post.toObject();
  postObj.likesCount = post.likes.length;
  postObj.commentsCount = post.comments.length;
  postObj.isLikedByMe = req.user
    ? post.likes.some((likeId) => likeId.toString() === req.user._id.toString())
    : false;

  return res.status(200).json(new apiResponse(200, "Post retrieved successfully", postObj));
});

const toggleLikePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) {
    throw new apiError(404, "Post not found");
  }

  const existingIndex = post.likes.findIndex(
    (likeId) => likeId.toString() === userId.toString()
  );

  let liked = false;
  if (existingIndex > -1) {
    post.likes.splice(existingIndex, 1);
  } else {
    post.likes.push(userId);
    liked = true;
  }

  await post.save();

  return res.status(200).json(
    new apiResponse(200, liked ? "Post liked" : "Post unliked", {
      liked,
      likesCount: post.likes.length,
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new apiError(400, "Comment text is required");
  }

  const post = await Post.findById(id);
  if (!post) {
    throw new apiError(404, "Post not found");
  }

  post.comments.push({
    author: req.user._id,
    text: text.trim(),
  });

  await post.save();

  const populatedPost = await Post.findById(id).populate(
    "comments.author",
    "name role profilePicture"
  );

  const newComment = populatedPost.comments[populatedPost.comments.length - 1];

  return res
    .status(201)
    .json(new apiResponse(201, "Comment added successfully", newComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new apiError(404, "Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found");
  }

  const isAuthor = comment.author.toString() === req.user._id.toString();
  const isPostAuthor = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isAuthor && !isPostAuthor && !isAdmin) {
    throw new apiError(403, "You do not have permission to delete this comment");
  }

  post.comments.pull(commentId);
  await post.save();

  return res.status(200).json(new apiResponse(200, "Comment deleted successfully", null));
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    throw new apiError(404, "Post not found");
  }

  const isAuthor = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isAuthor && !isAdmin) {
    throw new apiError(403, "You do not have permission to delete this post");
  }

  await Post.findByIdAndDelete(id);

  return res.status(200).json(new apiResponse(200, "Post deleted successfully", null));
});

export {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  addComment,
  deleteComment,
  deletePost,
};
