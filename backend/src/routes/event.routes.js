import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
} from "../controllers/event.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

// Public event discovery
router.route("/").get(getEvents);
router.route("/:id").get(getEventById);

// Protected routes
router.use(verifyJwt);

// Create event allowed for teachers, alumni, and admins
router
  .route("/")
  .post(requireRole("teacher", "alumni", "admin"), createEvent);

router.route("/:id/register").post(registerForEvent);

export default router;
