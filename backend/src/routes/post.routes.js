import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  addComment,
  deleteComment,
  deletePost,
} from "../controllers/post.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

// Public/Optional auth for feed
router.route("/").get(getPosts);
router.route("/:id").get(getPostById);

// Protected routes
router.use(verifyJwt);

router.route("/").post(createPost);
router.route("/:id").delete(deletePost);
router.route("/:id/like").post(toggleLikePost);
router.route("/:id/comment").post(addComment);
router.route("/:postId/comments/:commentId").delete(deleteComment);

export default router;
