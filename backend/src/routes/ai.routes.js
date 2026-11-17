import { Router } from "express";
import { queryAiService, summarizeProfile } from "../controllers/ai.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

// Authenticated AI Gateway proxy routes
router.use(verifyJwt);

router.route("/query").post(queryAiService);
router.route("/summarize-profile").post(summarizeProfile);

export default router;
