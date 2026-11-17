import { Router } from "express";
import {
  requestMentorship,
  getMyMentorshipRequests,
  updateMentorshipStatus,
} from "../controllers/mentorship.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/").post(requestMentorship).get(getMyMentorshipRequests);
router.route("/:id/status").put(updateMentorshipStatus);

export default router;
