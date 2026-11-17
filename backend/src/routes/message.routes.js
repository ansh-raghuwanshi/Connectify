import { Router } from "express";
import {
  sendMessage,
  getConversation,
  getConversationsList,
} from "../controllers/message.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

// All message routes are strictly protected
router.use(verifyJwt);

router.route("/").get(getConversationsList).post(sendMessage);
router.route("/:userId").get(getConversation);

export default router;
